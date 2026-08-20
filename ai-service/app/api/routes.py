"""FastAPI routes for the dental intelligence stack."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.engine import SessionLocal, init_db
from app.db import seed as seed_module
from app.graph import workflow
from app.memory import store as memory_store
from app.observability import tracer
from app.retrieval import pipeline as retrieval_pipeline
from app.schemas.agents import ReviewDecision

router = APIRouter()


class AnalyzeRequest(BaseModel):
    question: str
    patient_id: int | None = None
    doctor_id: str | None = None


class ReviewRequest(BaseModel):
    thread_id: str
    review: ReviewDecision


class FeedbackRequest(BaseModel):
    doctor_correction: str
    doctor_id: str | None = None
    ai_output: str | None = None
    reason: str | None = None
    category: str | None = None
    agent: str | None = None


def _patient_id_from_case(case_id: str) -> int | None:
    try:
        return int(case_id)
    except ValueError:
        return None


@router.get("/health")
def health():
    return {"status": "ok", "service": "dental-ai"}


@router.post("/admin/seed")
def admin_seed():
    init_db()
    session = SessionLocal()
    try:
        k = seed_module.seed_knowledge(session)
        p = seed_module.seed_patients(session)
        m = seed_module.seed_materials(session)
        return {"knowledge_chunks": k, "patients": p, "materials": m}
    finally:
        session.close()


@router.post("/ai/cases/{case_id}/analyze")
def analyze(case_id: str, req: AnalyzeRequest):
    patient_id = req.patient_id or _patient_id_from_case(case_id)
    draft, config = workflow.start_analysis(
        req.question,
        patient_id=patient_id,
        doctor_id=req.doctor_id,
        case_id=case_id,
    )
    return {
        "case_id": case_id,
        "thread_id": config["configurable"]["thread_id"],
        "status": "awaiting_review",
        "draft_report": draft,
    }


@router.post("/ai/cases/{case_id}/review")
def review(case_id: str, req: ReviewRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    final = workflow.submit_review(config, req.review.model_dump())
    return {"case_id": case_id, "final_output": final}


@router.post("/ai/cases/{case_id}/report")
def report(case_id: str, req: AnalyzeRequest):
    return analyze(case_id, req)


@router.post("/ai/cases/{case_id}/research")
def research(case_id: str, req: AnalyzeRequest):
    patient_id = req.patient_id or _patient_id_from_case(case_id)
    session = SessionLocal()
    try:
        result = retrieval_pipeline.retrieve(
            session, req.question, patient_id=patient_id, force_web=True
        )
        return {
            "case_id": case_id,
            "plan": result.plan.model_dump(),
            "evidence": [e.model_dump(mode="json") for e in result.evidence],
        }
    finally:
        session.close()


@router.post("/ai/cases/{case_id}/feedback")
def feedback(case_id: str, req: FeedbackRequest):
    session = SessionLocal()
    try:
        row = memory_store.store_feedback(
            session,
            req.doctor_correction,
            doctor_id=req.doctor_id,
            patient_id=_patient_id_from_case(case_id),
            ai_output=req.ai_output,
            reason=req.reason,
            category=req.category,
            agent=req.agent,
        )
        return {"feedback_id": row.id}
    finally:
        session.close()


@router.get("/ai/cases/{case_id}/memory")
def get_memory(case_id: str):
    session = SessionLocal()
    try:
        memories = memory_store.get_case_memories(
            session, patient_id=_patient_id_from_case(case_id), case_id=case_id
        )
        return {
            "case_id": case_id,
            "memories": [
                {
                    "finding": m.finding,
                    "approved": m.approved,
                    "question": m.question,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                }
                for m in memories
            ],
        }
    finally:
        session.close()


@router.get("/ai/cases/{case_id}/evidence")
def get_evidence(case_id: str, question: str = "clinical briefing"):
    patient_id = _patient_id_from_case(case_id)
    session = SessionLocal()
    try:
        result = retrieval_pipeline.retrieve(session, question, patient_id=patient_id)
        return {
            "case_id": case_id,
            "plan": result.plan.model_dump(),
            "evidence": [e.model_dump(mode="json") for e in result.evidence],
        }
    finally:
        session.close()


@router.get("/ai/runs/{run_id}/trace")
def get_run_trace(run_id: str):
    session = SessionLocal()
    try:
        trace = tracer.get_trace(session, run_id)
        if not trace.get("run"):
            raise HTTPException(status_code=404, detail="run not found")
        return trace
    finally:
        session.close()
