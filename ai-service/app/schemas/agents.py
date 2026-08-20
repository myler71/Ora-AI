"""Pydantic output contracts for the dental crew agents."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ClinicalAnalysis(BaseModel):
    case_summary: str = ""
    documented_findings: list[str] = Field(default_factory=list)
    relevant_history: list[str] = Field(default_factory=list)
    tooth_findings: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    potential_considerations: list[str] = Field(default_factory=list)
    questions_for_dentist: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)


class EvidenceAnalysis(BaseModel):
    evidence_summary: str = ""
    key_findings: list[str] = Field(default_factory=list)
    supporting_sources: list[str] = Field(default_factory=list)
    contradictory_sources: list[str] = Field(default_factory=list)
    evidence_strength: str = ""
    limitations: list[str] = Field(default_factory=list)
    clinical_relevance: str = ""
    citations: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)


class ResearchAnalysis(BaseModel):
    research_question: str = ""
    search_queries: list[str] = Field(default_factory=list)
    findings: list[str] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
    publication_dates: list[str] = Field(default_factory=list)
    evidence_quality: str = ""
    contradictions: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    citations: list[str] = Field(default_factory=list)


class MedicationAnalysis(BaseModel):
    current_medications: list[str] = Field(default_factory=list)
    relevant_medications: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    interactions: list[str] = Field(default_factory=list)
    precautions: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    questions_for_dentist: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)


class MaterialsAnalysis(BaseModel):
    required_items: list[str] = Field(default_factory=list)
    purpose_of_each_item: list[str] = Field(default_factory=list)
    inventory_status: list[str] = Field(default_factory=list)
    available_quantity: list[str] = Field(default_factory=list)
    shortages: list[str] = Field(default_factory=list)
    possible_alternatives: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    last_updated: str = ""
    questions_for_dentist: list[str] = Field(default_factory=list)


class CaseReport(BaseModel):
    case_overview: str = ""
    documented_findings: list[str] = Field(default_factory=list)
    clinical_context: list[str] = Field(default_factory=list)
    relevant_dental_history: list[str] = Field(default_factory=list)
    evidence_summary: list[str] = Field(default_factory=list)
    medication_considerations: list[str] = Field(default_factory=list)
    materials_and_supplies: list[str] = Field(default_factory=list)
    availability: list[str] = Field(default_factory=list)
    agent_disagreements: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    questions_for_dentist: list[str] = Field(default_factory=list)
    evidence_citations: list[str] = Field(default_factory=list)
    draft_conclusion: str = ""


class ReviewDecision(BaseModel):
    action: str = Field(..., description="approve | modify | reject | request_research")
    note: str = ""
    modifications: str = ""
