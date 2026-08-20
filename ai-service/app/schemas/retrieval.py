"""Typed retrieval contracts (Pydantic)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class RetrievalPlan(BaseModel):
    """Which retrieval sources are relevant to a clinical question."""

    patient_context: bool = False
    semantic_knowledge: bool = False
    graph_context: bool = False
    web_research: bool = False
    memory: bool = False
    medication_knowledge: bool = False
    materials_data: bool = False
    rationale: str = ""


class PatientContext(BaseModel):
    patient_id: int
    demographics: dict[str, Any] = Field(default_factory=dict)
    medical_history: list[str] = Field(default_factory=list)
    allergies: list[dict[str, Any]] = Field(default_factory=list)
    medications: list[dict[str, Any]] = Field(default_factory=list)
    teeth: list[dict[str, Any]] = Field(default_factory=list)
    tooth_events: list[dict[str, Any]] = Field(default_factory=list)
    notes: list[dict[str, Any]] = Field(default_factory=list)
    appointments: list[dict[str, Any]] = Field(default_factory=list)


class EvidenceItem(BaseModel):
    source_type: str
    source_id: str | None = None
    title: str | None = None
    content: str
    relevance_score: float | None = None
    citation: str | None = None
    publication_date: str | None = None
    evidence_type: str | None = None
    retrieved_at: datetime | None = None
    ranking: int | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class RetrievalResult(BaseModel):
    plan: RetrievalPlan
    question: str
    patient_context: PatientContext | None = None
    evidence: list[EvidenceItem] = Field(default_factory=list)
