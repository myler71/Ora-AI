"""Memory store: case / doctor / feedback / instruction memories.

Retrieval is relevance-scoped (never all history injected). Instruction
memory is durable only when explicitly approved.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.models import (
    CaseMemory,
    DoctorMemory,
    FeedbackMemory,
    InstructionMemory,
)


def store_case_finding(
    session: Session,
    finding: str,
    *,
    patient_id: int | None = None,
    case_id: str | None = None,
    doctor_id: str | None = None,
    question: str | None = None,
    approved: bool = False,
) -> CaseMemory:
    row = CaseMemory(
        patient_id=patient_id,
        case_id=case_id,
        doctor_id=doctor_id,
        question=question,
        finding=finding,
        approved=approved,
    )
    session.add(row)
    session.commit()
    return row


def store_doctor_preference(
    session: Session, preference: str, doctor_id: str, category: str | None = None
) -> DoctorMemory:
    row = DoctorMemory(
        doctor_id=doctor_id, preference=preference, category=category, approved=True
    )
    session.add(row)
    session.commit()
    return row


def store_feedback(
    session: Session,
    doctor_correction: str,
    *,
    doctor_id: str | None = None,
    patient_id: int | None = None,
    ai_output: str | None = None,
    reason: str | None = None,
    category: str | None = None,
    agent: str | None = None,
) -> FeedbackMemory:
    row = FeedbackMemory(
        doctor_id=doctor_id,
        patient_id=patient_id,
        ai_output=ai_output,
        doctor_correction=doctor_correction,
        reason=reason,
        category=category,
        agent=agent,
    )
    session.add(row)
    session.commit()
    return row


def store_instruction(
    session: Session,
    instruction: str,
    *,
    doctor_id: str | None = None,
    scope: str | None = None,
    active: bool = True,
) -> InstructionMemory:
    row = InstructionMemory(
        doctor_id=doctor_id, instruction=instruction, scope=scope, active=active
    )
    session.add(row)
    session.commit()
    return row


def get_active_instructions(
    session: Session, doctor_id: str | None = None
) -> list[str]:
    q = session.query(InstructionMemory).filter(InstructionMemory.active.is_(True))
    if doctor_id:
        q = q.filter(InstructionMemory.doctor_id == doctor_id)
    return [r.instruction for r in q.all()]


def get_doctor_preferences(session: Session, doctor_id: str) -> list[str]:
    rows = (
        session.query(DoctorMemory)
        .filter(DoctorMemory.doctor_id == doctor_id, DoctorMemory.approved.is_(True))
        .all()
    )
    return [r.preference for r in rows]


def get_case_memories(
    session: Session, *, patient_id: int | None = None, case_id: str | None = None
) -> list[CaseMemory]:
    q = session.query(CaseMemory)
    if patient_id is not None:
        q = q.filter(CaseMemory.patient_id == patient_id)
    if case_id is not None:
        q = q.filter(CaseMemory.case_id == case_id)
    return q.all()


def get_feedback(
    session: Session, *, patient_id: int | None = None, category: str | None = None
) -> list[FeedbackMemory]:
    q = session.query(FeedbackMemory)
    if patient_id is not None:
        q = q.filter(FeedbackMemory.patient_id == patient_id)
    if category is not None:
        q = q.filter(FeedbackMemory.category == category)
    return q.all()
