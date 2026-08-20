"""Tests for LangGraph workflow (mock agents)."""

from unittest.mock import patch

from app.agents import specialists
from app.graph import workflow
from app.schemas.agents import (
    CaseReport,
    ClinicalAnalysis,
    EvidenceAnalysis,
    MaterialsAnalysis,
    MedicationAnalysis,
)


def _mock_agent_outputs():
    return {
        "clinical_analyst": ClinicalAnalysis(
            case_summary="Mock summary",
            documented_findings=["finding 1"],
            questions_for_dentist=["question 1"],
        ),
        "evidence_specialist": EvidenceAnalysis(
            evidence_summary="Mock evidence",
            key_findings=["finding 1"],
            citations=["citation 1"],
        ),
        "medication_specialist": MedicationAnalysis(
            current_medications=["med 1"],
            interactions=["interaction 1"],
        ),
        "materials_specialist": MaterialsAnalysis(
            required_items=["item 1"],
            purpose_of_each_item=["purpose 1"],
        ),
        "synthesize": CaseReport(
            case_overview="Mock overview",
            documented_findings=["finding 1"],
            evidence_summary=["evidence 1"],
            medication_considerations=["consideration 1"],
            materials_and_supplies=["supply 1"],
            uncertainties=["uncertainty 1"],
            missing_information=["missing 1"],
            questions_for_dentist=["question 1"],
            evidence_citations=["citation 1"],
            draft_conclusion="Mock conclusion",
        ),
    }


def test_workflow_runs_to_interrupt():
    mocks = _mock_agent_outputs()
    with (
        patch.object(
            specialists, "clinical_analyst", return_value=mocks["clinical_analyst"]
        ),
        patch.object(
            specialists,
            "evidence_specialist",
            return_value=mocks["evidence_specialist"],
        ),
        patch.object(specialists, "research_specialist", return_value=None),
        patch.object(
            specialists,
            "medication_specialist",
            return_value=mocks["medication_specialist"],
        ),
        patch.object(
            specialists,
            "materials_specialist",
            return_value=mocks["materials_specialist"],
        ),
        patch.object(specialists, "synthesize", return_value=mocks["synthesize"]),
    ):
        draft, config = workflow.start_analysis(
            "Test question", patient_id=1, doctor_id="doc-1"
        )
    assert draft is not None
    assert "draft_report" in draft
    assert config["configurable"]["thread_id"]


def test_workflow_resume_with_review():
    mocks = _mock_agent_outputs()
    with (
        patch.object(
            specialists, "clinical_analyst", return_value=mocks["clinical_analyst"]
        ),
        patch.object(
            specialists,
            "evidence_specialist",
            return_value=mocks["evidence_specialist"],
        ),
        patch.object(specialists, "research_specialist", return_value=None),
        patch.object(
            specialists,
            "medication_specialist",
            return_value=mocks["medication_specialist"],
        ),
        patch.object(
            specialists,
            "materials_specialist",
            return_value=mocks["materials_specialist"],
        ),
        patch.object(specialists, "synthesize", return_value=mocks["synthesize"]),
    ):
        draft, config = workflow.start_analysis(
            "Test question", patient_id=1, doctor_id="doc-1"
        )
    final = workflow.submit_review(
        config, {"action": "approve", "note": "test approval"}
    )
    assert final["review_action"] == "approve"
    assert final["disclaimer"]
