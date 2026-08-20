"""Specialist agent runners — one function per dental crew role."""

from __future__ import annotations

from app.agents import prompts
from app.agents.llm import generate_structured
from app.schemas.agents import (
    CaseReport,
    ClinicalAnalysis,
    EvidenceAnalysis,
    MaterialsAnalysis,
    MedicationAnalysis,
    ResearchAnalysis,
)

SYSTEM_TEMPLATE = (
    "{preamble}" "Role: {role}\nMission: {mission}\nInstructions:\n{instructions}\n"
)


def _system(role_def: dict) -> str:
    return SYSTEM_TEMPLATE.format(preamble=prompts.SAFETY_PREAMBLE, **role_def)


def clinical_analyst(question: str, context: str) -> ClinicalAnalysis:
    return generate_structured(
        _system(prompts.CLINICAL_ANALYST),
        f"Question:\n{question}\n\nContext:\n{context}",
        ClinicalAnalysis,
    )


def evidence_specialist(question: str, context: str) -> EvidenceAnalysis:
    return generate_structured(
        _system(prompts.EVIDENCE_SPECIALIST),
        f"Question:\n{question}\n\nContext:\n{context}",
        EvidenceAnalysis,
    )


def research_specialist(question: str, context: str) -> ResearchAnalysis:
    return generate_structured(
        _system(prompts.RESEARCH_SPECIALIST),
        f"Question:\n{question}\n\nContext:\n{context}",
        ResearchAnalysis,
    )


def medication_specialist(question: str, context: str) -> MedicationAnalysis:
    return generate_structured(
        _system(prompts.MEDICATION_SPECIALIST),
        f"Question:\n{question}\n\nContext:\n{context}",
        MedicationAnalysis,
    )


def materials_specialist(question: str, context: str) -> MaterialsAnalysis:
    return generate_structured(
        _system(prompts.MATERIALS_SPECIALIST),
        f"Question:\n{question}\n\nContext:\n{context}",
        MaterialsAnalysis,
    )


def synthesize(question: str, specialist_outputs: str) -> CaseReport:
    return generate_structured(
        _system(prompts.SYNTHESIZER),
        f"Question:\n{question}\n\nSpecialist findings:\n{specialist_outputs}",
        CaseReport,
    )
