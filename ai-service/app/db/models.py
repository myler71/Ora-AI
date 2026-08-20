"""Relational models for the dental intelligence stack.

PostgreSQL is the intended production database; SQLite is the local zero-setup
default. Models stay backend-agnostic. Embeddings are stored as JSON text and
searched in-process with NumPy by default (see app.retrieval.semantic), so no
pgvector extension is required for the local demo.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.engine import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    dob: Mapped[str | None] = mapped_column(String(20))
    gender: Mapped[str | None] = mapped_column(String(20))
    medical_history: Mapped[str | None] = mapped_column(Text)  # JSON list of conditions
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    allergies: Mapped[list["Allergy"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    medications: Mapped[list["Medication"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    teeth: Mapped[list["Tooth"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    notes: Mapped[list["DoctorNote"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )


class Allergy(Base):
    __tablename__ = "allergies"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    allergen: Mapped[str] = mapped_column(String(200))
    severity: Mapped[str | None] = mapped_column(String(50))  # mild/moderate/severe
    reaction: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)

    patient: Mapped["Patient"] = relationship(back_populates="allergies")


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    dosage: Mapped[str | None] = mapped_column(String(100))
    frequency: Mapped[str | None] = mapped_column(String(100))
    indication: Mapped[str | None] = mapped_column(String(300))
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    patient: Mapped["Patient"] = relationship(back_populates="medications")


class Tooth(Base):
    __tablename__ = "teeth"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    tooth_number: Mapped[int] = mapped_column(Integer)  # FDI two-digit notation
    quadrant: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(
        String(50)
    )  # present/missing/restored/carious/...
    notes: Mapped[str | None] = mapped_column(Text)

    patient: Mapped["Patient"] = relationship(back_populates="teeth")
    events: Mapped[list["ToothEvent"]] = relationship(
        back_populates="tooth", cascade="all, delete-orphan"
    )


class ToothEvent(Base):
    __tablename__ = "tooth_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    tooth_id: Mapped[int | None] = mapped_column(ForeignKey("teeth.id"))
    event_type: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    performed_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    tooth: Mapped["Tooth"] = relationship(back_populates="events")


class DoctorNote(Base):
    __tablename__ = "doctor_notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    note_type: Mapped[str | None] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    patient: Mapped["Patient"] = relationship(back_populates="notes")


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime)
    reason: Mapped[str | None] = mapped_column(String(300))
    status: Mapped[str | None] = mapped_column(String(50))

    patient: Mapped["Patient"] = relationship(back_populates="appointments")


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str | None] = mapped_column(String(100))
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    unit: Mapped[str | None] = mapped_column(String(50))
    reorder_threshold: Mapped[float | None] = mapped_column(Float)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=_now)


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[str] = mapped_column(String(200), index=True)
    chunk_id: Mapped[str] = mapped_column(String(200))
    title: Mapped[str | None] = mapped_column(String(400))
    author: Mapped[str | None] = mapped_column(String(200))
    source: Mapped[str | None] = mapped_column(String(400))
    publication_date: Mapped[str | None] = mapped_column(String(50))
    specialty: Mapped[str | None] = mapped_column(String(200))
    topic: Mapped[str | None] = mapped_column(String(200))
    procedure: Mapped[str | None] = mapped_column(String(200))
    condition: Mapped[str | None] = mapped_column(String(200))
    drug: Mapped[str | None] = mapped_column(String(200))
    material: Mapped[str | None] = mapped_column(String(200))
    evidence_type: Mapped[str | None] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text)
    embedding_json: Mapped[str | None] = mapped_column(Text)  # JSON list[float]

    def set_embedding(self, vector: list[float]) -> None:
        self.embedding_json = json.dumps(vector)

    def get_embedding(self) -> list[float] | None:
        if not self.embedding_json:
            return None
        return json.loads(self.embedding_json)


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[str | None] = mapped_column(String(100), index=True)
    source_type: Mapped[str] = mapped_column(
        String(50)
    )  # structured/semantic/web/graph
    source_id: Mapped[str | None] = mapped_column(String(200))
    title: Mapped[str | None] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)
    relevance_score: Mapped[float | None] = mapped_column(Float)
    ranking: Mapped[int | None] = mapped_column(Integer)
    citation: Mapped[str | None] = mapped_column(String(500))
    publication_date: Mapped[str | None] = mapped_column(String(50))
    evidence_type: Mapped[str | None] = mapped_column(String(100))
    retrieved_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


# --- Memory ---------------------------------------------------------------


class CaseMemory(Base):
    """Approved conclusions and findings from previous case analyses."""

    __tablename__ = "case_memory"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int | None] = mapped_column(Integer, index=True)
    case_id: Mapped[str | None] = mapped_column(String(100), index=True)
    doctor_id: Mapped[str | None] = mapped_column(String(100), index=True)
    question: Mapped[str | None] = mapped_column(Text)
    finding: Mapped[str] = mapped_column(Text)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class DoctorMemory(Base):
    """Explicit doctor preferences and workflow requirements."""

    __tablename__ = "doctor_memory"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[str | None] = mapped_column(String(100), index=True)
    preference: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(100))
    approved: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class FeedbackMemory(Base):
    """Doctor corrections to AI output (AI -> doctor -> reason)."""

    __tablename__ = "feedback_memory"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[str | None] = mapped_column(String(100), index=True)
    patient_id: Mapped[int | None] = mapped_column(Integer, index=True)
    ai_output: Mapped[str | None] = mapped_column(Text)
    doctor_correction: Mapped[str] = mapped_column(Text)
    reason: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(100))
    agent: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class InstructionMemory(Base):
    """Durable, doctor-approved behavioral instructions."""

    __tablename__ = "instruction_memory"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[str | None] = mapped_column(String(100), index=True)
    instruction: Mapped[str] = mapped_column(Text)
    scope: Mapped[str | None] = mapped_column(String(100))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


# --- Observability --------------------------------------------------------


class RunRecord(Base):
    """Top-level AI execution trace."""

    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[str] = mapped_column(String(100), index=True)
    question: Mapped[str | None] = mapped_column(Text)
    patient_id: Mapped[int | None] = mapped_column(Integer, index=True)
    doctor_id: Mapped[str | None] = mapped_column(String(100), index=True)
    routing_decision: Mapped[str | None] = mapped_column(Text)  # JSON RetrievalPlan
    status: Mapped[str] = mapped_column(String(50), default="running")
    started_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)


class RunStep(Base):
    """Per-node trace entry (retrieval, agent, tool, LLM, review)."""

    __tablename__ = "run_steps"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[str] = mapped_column(String(100), index=True)
    step: Mapped[str] = mapped_column(String(100))
    kind: Mapped[str | None] = mapped_column(
        String(50)
    )  # retrieval/agent/tool/llm/review
    detail_json: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
