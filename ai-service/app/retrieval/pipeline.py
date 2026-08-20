"""End-to-end retrieval pipeline: router -> sources -> fusion -> context."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.retrieval import semantic, structured, web
from app.retrieval.context_builder import build_context
from app.retrieval.fusion import fuse
from app.retrieval.router import RetrievalRouter
from app.schemas.retrieval import EvidenceItem, PatientContext, RetrievalResult

router = RetrievalRouter()


def retrieve(
    session: Session,
    question: str,
    patient_id: int | None = None,
    *,
    force_web: bool = False,
    top_k: int | None = None,
) -> RetrievalResult:
    """Run full retrieval for a clinical question."""
    plan = router.plan(question)

    patient_context: PatientContext | None = None
    if patient_id is not None and plan.patient_context:
        patient_context = structured.get_patient_context(session, patient_id)

    source_groups: list[list[EvidenceItem]] = []

    if plan.semantic_knowledge:
        source_groups.append(semantic.search_knowledge(session, question, top_k=top_k))

    if plan.web_research or force_web:
        source_groups.append(web.search_web(question))

    evidence = fuse(source_groups)

    return RetrievalResult(
        plan=plan,
        question=question,
        patient_context=patient_context,
        evidence=evidence,
    )


def retrieve_for_role(
    session: Session,
    question: str,
    patient_id: int | None,
    role: str,
    result: RetrievalResult | None = None,
) -> str:
    result = result or retrieve(session, question, patient_id)
    return build_context(
        result.plan, result.patient_context, result.evidence, role=role
    )
