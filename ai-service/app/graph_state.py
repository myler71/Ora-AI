"""Typed LangGraph state for the clinical intelligence workflow."""

from __future__ import annotations

from typing import Any, TypedDict


class ClinicalGraphState(TypedDict, total=False):
    # Inputs
    doctor_id: str
    patient_id: int | None
    case_id: str
    question: str
    run_id: str

    # Retrieval
    retrieval_plan: dict[str, Any]
    patient_context: dict[str, Any] | None
    graph_context: list[dict[str, Any]]
    memory_context: list[str]
    evidence: list[dict[str, Any]]
    context_blocks: dict[str, str]

    # Specialist outputs
    clinical_analysis: dict[str, Any]
    evidence_analysis: dict[str, Any]
    research_analysis: dict[str, Any]
    medication_analysis: dict[str, Any]
    materials_analysis: dict[str, Any]

    # Synthesis + review
    synthesized_report: dict[str, Any]
    human_review: dict[str, Any]
    final_output: dict[str, Any]
