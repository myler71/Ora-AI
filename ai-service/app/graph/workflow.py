"""LangGraph clinical-intelligence workflow with human-in-the-loop review.

Flow:
  route -> retrieve -> clinical_analyst -> evidence_specialist
        -> research_specialist? -> medication_specialist? -> materials_specialist?
        -> synthesize -> human_review (interrupt) -> finalize

HITL: `human_review` calls `interrupt()` and pauses. Resume with
`Command(resume=review_dict)`.
"""

from __future__ import annotations

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

from app.agents import specialists
from app.db.engine import SessionLocal
from app.graph.knowledge_graph import build_graph
from app.graph_state import ClinicalGraphState
from app.memory import store as memory_store
from app.observability import tracer
from app.retrieval import pipeline as retrieval_pipeline
from app.retrieval.context_builder import build_context
from app.safety import guardrails

checkpointer = MemorySaver()


# --- Nodes -----------------------------------------------------------------


def route_node(state: ClinicalGraphState) -> dict:
    question = state["question"]
    plan = retrieval_pipeline_router_plan(question)
    session = SessionLocal()
    try:
        if state.get("run_id"):
            tracer.record_routing(session, state["run_id"], plan.model_dump())
            tracer.record_step(
                session, state["run_id"], "route", "routing", plan.model_dump()
            )
    finally:
        session.close()
    return {"retrieval_plan": plan.model_dump()}


def retrieval_pipeline_router_plan(question: str):
    from app.retrieval.router import RetrievalRouter

    return RetrievalRouter().plan(question)


def retrieve_node(state: ClinicalGraphState) -> dict:
    session = SessionLocal()
    try:
        result = retrieval_pipeline.retrieve(
            session,
            state["question"],
            patient_id=state.get("patient_id"),
        )
        plan = result.plan

        # Knowledge graph relationships
        graph_context = []
        if plan.graph_context and state.get("patient_id"):
            kg = build_graph(session)
            graph_context = kg.relationships_for_patient(state["patient_id"])

        # Relevant memory (instructions + doctor preferences)
        memory_context = memory_store.get_active_instructions(
            session, state.get("doctor_id")
        )
        if state.get("doctor_id"):
            memory_context += memory_store.get_doctor_preferences(
                session, state["doctor_id"]
            )

        evidence_dicts = [e.model_dump(mode="json") for e in result.evidence]

        if state.get("run_id"):
            tracer.record_step(
                session,
                state["run_id"],
                "retrieve",
                "retrieval",
                {
                    "sources": [e.source_type for e in result.evidence],
                    "n_evidence": len(result.evidence),
                    "graph_edges": len(graph_context),
                    "memory_items": len(memory_context),
                },
            )

        return {
            "patient_context": (
                result.patient_context.model_dump() if result.patient_context else None
            ),
            "evidence": evidence_dicts,
            "graph_context": graph_context,
            "memory_context": memory_context,
        }
    finally:
        session.close()


def _build_contexts(state: ClinicalGraphState) -> dict[str, str]:
    from app.schemas.retrieval import EvidenceItem, PatientContext, RetrievalPlan

    plan = RetrievalPlan(**state.get("retrieval_plan", {}))
    pc = (
        PatientContext(**state["patient_context"])
        if state.get("patient_context")
        else None
    )
    evidence = [EvidenceItem(**e) for e in state.get("evidence", [])]
    roles = [
        "clinical_analyst",
        "evidence_specialist",
        "research_specialist",
        "medication_specialist",
        "materials_specialist",
        "synthesizer",
    ]
    return {r: build_context(plan, pc, evidence, role=r) for r in roles}


def clinical_analyst_node(state: ClinicalGraphState) -> dict:
    contexts = _build_contexts(state)
    out = specialists.clinical_analyst(state["question"], contexts["clinical_analyst"])
    _trace(
        state, "clinical_analyst", "agent", {"fields": list(out.model_dump().keys())}
    )
    return {"clinical_analysis": out.model_dump(), "context_blocks": contexts}


def evidence_specialist_node(state: ClinicalGraphState) -> dict:
    contexts = state.get("context_blocks") or _build_contexts(state)
    out = specialists.evidence_specialist(
        state["question"], contexts["evidence_specialist"]
    )
    _trace(
        state, "evidence_specialist", "agent", {"fields": list(out.model_dump().keys())}
    )
    return {"evidence_analysis": out.model_dump()}


def research_specialist_node(state: ClinicalGraphState) -> dict:
    plan = state.get("retrieval_plan", {})
    if not plan.get("web_research"):
        return {"research_analysis": {}}
    contexts = state.get("context_blocks") or _build_contexts(state)
    out = specialists.research_specialist(
        state["question"], contexts["research_specialist"]
    )
    _trace(
        state, "research_specialist", "agent", {"fields": list(out.model_dump().keys())}
    )
    return {"research_analysis": out.model_dump()}


def medication_specialist_node(state: ClinicalGraphState) -> dict:
    plan = state.get("retrieval_plan", {})
    has_meds = bool((state.get("patient_context") or {}).get("medications"))
    if not (plan.get("medication_knowledge") or has_meds):
        return {"medication_analysis": {}}
    contexts = state.get("context_blocks") or _build_contexts(state)
    out = specialists.medication_specialist(
        state["question"], contexts["medication_specialist"]
    )
    _trace(
        state,
        "medication_specialist",
        "agent",
        {"fields": list(out.model_dump().keys())},
    )
    return {"medication_analysis": out.model_dump()}


def materials_specialist_node(state: ClinicalGraphState) -> dict:
    plan = state.get("retrieval_plan", {})
    if not plan.get("materials_data"):
        return {"materials_analysis": {}}
    contexts = state.get("context_blocks") or _build_contexts(state)
    out = specialists.materials_specialist(
        state["question"], contexts["materials_specialist"]
    )
    _trace(
        state,
        "materials_specialist",
        "agent",
        {"fields": list(out.model_dump().keys())},
    )
    return {"materials_analysis": out.model_dump()}


def synthesize_node(state: ClinicalGraphState) -> dict:
    specialist_outputs = _format_specialists(state)
    report = specialists.synthesize(state["question"], specialist_outputs)
    report_dict = report.model_dump()
    validation = guardrails.validate_report(report_dict)
    report_dict["_safety"] = validation
    _trace(state, "synthesize", "agent", {"safety_valid": validation["valid"]})
    return {"synthesized_report": report_dict}


def human_review_node(state: ClinicalGraphState) -> dict:
    draft = state["synthesized_report"]
    review = interrupt({"draft_report": draft})
    return {"human_review": review}


def finalize_node(state: ClinicalGraphState) -> dict:
    review = state.get("human_review") or {}
    report = dict(state["synthesized_report"])
    action = review.get("action", "approve")

    final = {
        "report": report,
        "review_action": action,
        "doctor_note": review.get("note", ""),
        "disclaimer": guardrails.DECISION_SUPPORT_DISCLAIMER,
    }
    if action == "modify" and review.get("modifications"):
        final["modifications"] = review["modifications"]

    session = SessionLocal()
    try:
        if state.get("run_id"):
            tracer.record_step(
                session, state["run_id"], "human_review", "review", {"action": action}
            )
            tracer.finish_run(session, state["run_id"], status=action)
        if action == "approve":
            memory_store.store_case_finding(
                session,
                finding=report.get("draft_conclusion", ""),
                patient_id=state.get("patient_id"),
                case_id=state.get("case_id"),
                doctor_id=state.get("doctor_id"),
                question=state.get("question"),
                approved=True,
            )
        elif action in ("modify", "reject") and review.get("note"):
            memory_store.store_feedback(
                session,
                doctor_correction=review.get("note", ""),
                doctor_id=state.get("doctor_id"),
                patient_id=state.get("patient_id"),
                ai_output=report.get("draft_conclusion", ""),
                category=action,
            )
    finally:
        session.close()

    return {"final_output": final}


# --- Helpers ---------------------------------------------------------------


def _trace(state: ClinicalGraphState, step: str, kind: str, detail: dict) -> None:
    if not state.get("run_id"):
        return
    session = SessionLocal()
    try:
        tracer.record_step(session, state["run_id"], step, kind, detail)
    finally:
        session.close()


def _format_specialists(state: ClinicalGraphState) -> str:
    parts = []
    mapping = [
        ("Clinical Case Analyst", state.get("clinical_analysis")),
        ("Evidence Specialist", state.get("evidence_analysis")),
        ("Research Specialist", state.get("research_analysis")),
        ("Medication Specialist", state.get("medication_analysis")),
        ("Materials Specialist", state.get("materials_analysis")),
    ]
    for name, out in mapping:
        if out:
            parts.append(f"### {name}\n{_to_text(out)}")
    return "\n\n".join(parts)


def _to_text(d: dict) -> str:
    lines = []
    for k, v in d.items():
        if isinstance(v, list):
            lines.append(f"- {k}: " + ("; ".join(map(str, v)) if v else "none"))
        else:
            lines.append(f"- {k}: {v}")
    return "\n".join(lines)


# --- Graph assembly --------------------------------------------------------


def build_workflow():
    g = StateGraph(ClinicalGraphState)
    g.add_node("route", route_node)
    g.add_node("retrieve", retrieve_node)
    g.add_node("clinical_analyst", clinical_analyst_node)
    g.add_node("evidence_specialist", evidence_specialist_node)
    g.add_node("research_specialist", research_specialist_node)
    g.add_node("medication_specialist", medication_specialist_node)
    g.add_node("materials_specialist", materials_specialist_node)
    g.add_node("synthesize", synthesize_node)
    g.add_node("human_review", human_review_node)
    g.add_node("finalize", finalize_node)

    g.add_edge(START, "route")
    g.add_edge("route", "retrieve")
    g.add_edge("retrieve", "clinical_analyst")
    g.add_edge("clinical_analyst", "evidence_specialist")
    g.add_edge("evidence_specialist", "research_specialist")
    g.add_edge("research_specialist", "medication_specialist")
    g.add_edge("medication_specialist", "materials_specialist")
    g.add_edge("materials_specialist", "synthesize")
    g.add_edge("synthesize", "human_review")
    g.add_edge("human_review", "finalize")
    g.add_edge("finalize", END)

    return g.compile(checkpointer=checkpointer)


graph = build_workflow()


# --- Public helpers --------------------------------------------------------


def start_analysis(
    question: str,
    *,
    patient_id: int | None = None,
    doctor_id: str | None = None,
    case_id: str | None = None,
    thread_id: str | None = None,
) -> tuple[dict, dict]:
    """Run the workflow until the human-review interrupt. Returns (draft, config)."""
    import uuid

    session = SessionLocal()
    try:
        run_id = tracer.start_run(
            session, question=question, patient_id=patient_id, doctor_id=doctor_id
        )
    finally:
        session.close()

    thread_id = thread_id or uuid.uuid4().hex
    config = {"configurable": {"thread_id": thread_id}}
    initial: ClinicalGraphState = {
        "question": question,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "case_id": case_id or thread_id,
        "run_id": run_id,
    }
    graph.invoke(initial, config)

    snap = graph.get_state(config)
    draft = None
    for task in snap.tasks:
        for intr in getattr(task, "interrupts", []) or []:
            draft = intr.value
    return draft, config


def submit_review(config: dict, review: dict) -> dict:
    """Resume the workflow with the doctor's review decision. Returns final output."""
    result = graph.invoke(Command(resume=review), config)
    return result.get("final_output", {})
