"""Retrieval router: classify a clinical question into a RetrievalPlan.

Rule-based keyword classifier (deterministic, no LLM cost). Maps the
information need to the correct retrieval sources per spec Section 6.
"""

from __future__ import annotations

from app.schemas.retrieval import RetrievalPlan

_PATIENT_TERMS = (
    "patient",
    "this case",
    "case",
    "tooth",
    "teeth",
    "history",
    "record",
    "chart",
    "odontogram",
    "allerg",
    "medication",
    "on file",
)

_SEMANTIC_TERMS = (
    "literature",
    "guideline",
    "guidelines",
    "evidence",
    "study",
    "studies",
    "paper",
    "book",
    "protocol",
    "recommendation",
    "standard of care",
    "what does the",
    "best practice",
    "briefing",
    "analyze",
    "analysis",
    "assess",
    "review",
    "consideration",
    "considerations",
)

_WEB_TERMS = (
    "recent",
    "latest",
    "current",
    "2024",
    "2025",
    "new research",
    "emerging",
    "what are recent",
    "up to date",
)

_MEDICATION_TERMS = (
    "drug",
    "medication",
    "interaction",
    "contraindication",
    "anticoagulant",
    "bisphosphonate",
    "antibiotic",
    "prescription",
)

_MATERIALS_TERMS = (
    "material",
    "inventory",
    "supply",
    "available",
    "stock",
    "composite",
    "amalgam",
    "cement",
    "restorative",
)

_MEMORY_TERMS = (
    "previous",
    "last time",
    "prefer",
    "as before",
    "what did i",
    "preference",
)


class RetrievalRouter:
    def plan(self, question: str) -> RetrievalPlan:
        q = question.lower()
        plan = RetrievalPlan()
        reasons: list[str] = []

        if any(t in q for t in _PATIENT_TERMS):
            plan.patient_context = True
            reasons.append("patient/case keywords")
        if any(t in q for t in _SEMANTIC_TERMS):
            plan.semantic_knowledge = True
            reasons.append("literature/evidence keywords")
        if any(t in q for t in _WEB_TERMS):
            plan.web_research = True
            reasons.append("recent/current keywords")
        if any(t in q for t in _MEDICATION_TERMS):
            plan.medication_knowledge = True
            reasons.append("medication keywords")
        if any(t in q for t in _MATERIALS_TERMS):
            plan.materials_data = True
            reasons.append("materials/inventory keywords")
        if any(t in q for t in _MEMORY_TERMS):
            plan.memory = True
            reasons.append("memory/preference keywords")

        # Graph context mirrors clinical relationship needs.
        plan.graph_context = plan.medication_knowledge or plan.semantic_knowledge

        plan.rationale = "; ".join(reasons) if reasons else "general question"
        return plan
