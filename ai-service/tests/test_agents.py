"""Tests for specialist agents (mock LLM)."""

from unittest.mock import patch

import pytest

from app.agents import specialists
from app.schemas.agents import (
    CaseReport,
    ClinicalAnalysis,
    EvidenceAnalysis,
    MaterialsAnalysis,
    MedicationAnalysis,
    ResearchAnalysis,
)


@pytest.fixture
def mock_context():
    return "Patient context and evidence here."


def test_clinical_analyst(mock_context):
    mock_output = ClinicalAnalysis(
        case_summary="Test summary",
        documented_findings=["finding 1"],
        questions_for_dentist=["question 1"],
    )
    with patch.object(specialists, "generate_structured", return_value=mock_output):
        result = specialists.clinical_analyst("test question", mock_context)
    assert isinstance(result, ClinicalAnalysis)
    assert result.case_summary == "Test summary"
    assert len(result.documented_findings) == 1


def test_evidence_specialist(mock_context):
    mock_output = EvidenceAnalysis(
        evidence_summary="Test evidence",
        key_findings=["finding 1"],
        citations=["citation 1"],
    )
    with patch.object(specialists, "generate_structured", return_value=mock_output):
        result = specialists.evidence_specialist("test question", mock_context)
    assert isinstance(result, EvidenceAnalysis)
    assert result.evidence_summary == "Test evidence"


def test_research_specialist(mock_context):
    mock_output = ResearchAnalysis(
        research_question="test",
        findings=["finding 1"],
        sources=["source 1"],
    )
    with patch.object(specialists, "generate_structured", return_value=mock_output):
        result = specialists.research_specialist("test question", mock_context)
    assert isinstance(result, ResearchAnalysis)


def test_medication_specialist(mock_context):
    mock_output = MedicationAnalysis(
        current_medications=["med 1"],
        interactions=["interaction 1"],
    )
    with patch.object(specialists, "generate_structured", return_value=mock_output):
        result = specialists.medication_specialist("test question", mock_context)
    assert isinstance(result, MedicationAnalysis)


def test_materials_specialist(mock_context):
    mock_output = MaterialsAnalysis(
        required_items=["item 1"],
        purpose_of_each_item=["purpose 1"],
    )
    with patch.object(specialists, "generate_structured", return_value=mock_output):
        result = specialists.materials_specialist("test question", mock_context)
    assert isinstance(result, MaterialsAnalysis)


def test_synthesize(mock_context):
    mock_output = CaseReport(
        case_overview="Test overview",
        documented_findings=["finding 1"],
        draft_conclusion="Test conclusion",
    )
    with patch.object(specialists, "generate_structured", return_value=mock_output):
        result = specialists.synthesize("test question", "specialist outputs")
    assert isinstance(result, CaseReport)
    assert result.case_overview == "Test overview"
