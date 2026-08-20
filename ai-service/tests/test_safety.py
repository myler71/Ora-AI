"""Tests for safety guardrails."""

import pytest

from app.safety.guardrails import (
    SafetyViolation,
    assert_decision_support,
    contains_prohibited_claims,
    validate_report,
)


def test_prohibited_claims_detected():
    text = "You must prescribe amoxicillin 500mg three times daily."
    hits = contains_prohibited_claims(text)
    assert len(hits) > 0


def test_no_prohibited_claims():
    text = "Consider discussing antibiotic options with the patient."
    hits = contains_prohibited_claims(text)
    assert len(hits) == 0


def test_assert_decision_support_raises():
    with pytest.raises(SafetyViolation):
        assert_decision_support("I diagnose irreversible pulpitis.")


def test_assert_decision_support_passes():
    assert_decision_support("The evidence suggests considering endodontic referral.")


def test_validate_report_valid():
    report = {
        "evidence_summary": ["finding 1"],
        "evidence_citations": ["citation 1"],
        "uncertainties": ["uncertainty 1"],
        "questions_for_dentist": ["question 1"],
    }
    result = validate_report(report)
    assert result["valid"] is True
    assert len(result["issues"]) == 0


def test_validate_report_missing_citations():
    report = {
        "evidence_summary": ["finding 1"],
        "evidence_citations": [],
        "uncertainties": ["uncertainty 1"],
        "questions_for_dentist": ["question 1"],
    }
    result = validate_report(report)
    assert result["valid"] is False
    assert "evidence_without_citations" in result["issues"]


def test_validate_report_no_uncertainty():
    report = {
        "evidence_summary": ["finding 1"],
        "evidence_citations": ["citation 1"],
        "uncertainties": [],
        "missing_information": [],
        "questions_for_dentist": ["question 1"],
    }
    result = validate_report(report)
    assert "no_uncertainty_disclosed" in result["issues"]


def test_validate_report_no_dentist_review():
    report = {
        "evidence_summary": ["finding 1"],
        "evidence_citations": ["citation 1"],
        "uncertainties": ["uncertainty 1"],
        "questions_for_dentist": [],
    }
    result = validate_report(report)
    assert "no_dentist_review_items" in result["issues"]
