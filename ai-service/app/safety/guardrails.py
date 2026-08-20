"""Clinical safety guardrails.

Enforces decision-support-only behavior: no autonomous diagnosis/prescription,
facts vs inference labeling, citation presence, and escalation of uncertainty.
"""

from __future__ import annotations

import re

PROHIBITED_PATTERNS = [
    r"\byou must (prescribe|administer|order)\b",
    r"\bi (prescribe|diagnose|order)\b",
    r"\bdefinitive diagnosis is\b",
    r"\bstop (the )?(patient'?s )?(anticoagulant|medication)\b",
]

DECISION_SUPPORT_DISCLAIMER = (
    "This output is decision-support material for a licensed dentist. It does not "
    "constitute a diagnosis or prescription. The treating dentist makes all final "
    "clinical decisions."
)


def contains_prohibited_claims(text: str) -> list[str]:
    hits = []
    lowered = text.lower()
    for pat in PROHIBITED_PATTERNS:
        if re.search(pat, lowered):
            hits.append(pat)
    return hits


def validate_report(report: dict) -> dict:
    """Return a validation summary for a synthesized report dict."""
    issues: list[str] = []

    flat_text = _flatten(report)
    prohibited = contains_prohibited_claims(flat_text)
    if prohibited:
        issues.append(f"prohibited_claims:{len(prohibited)}")

    citations = report.get("evidence_citations") or []
    evidence_summary = report.get("evidence_summary") or []
    if evidence_summary and not citations:
        issues.append("evidence_without_citations")

    if not report.get("uncertainties") and not report.get("missing_information"):
        issues.append("no_uncertainty_disclosed")

    if not report.get("questions_for_dentist"):
        issues.append("no_dentist_review_items")

    return {
        "valid": not issues,
        "issues": issues,
        "disclaimer": DECISION_SUPPORT_DISCLAIMER,
    }


def assert_decision_support(text: str) -> None:
    """Raise if text contains autonomous clinical directives."""
    hits = contains_prohibited_claims(text)
    if hits:
        raise SafetyViolation(f"prohibited clinical directive detected: {hits}")


class SafetyViolation(Exception):
    pass


def _flatten(obj) -> str:
    parts: list[str] = []

    def walk(o):
        if isinstance(o, str):
            parts.append(o)
        elif isinstance(o, dict):
            for v in o.values():
                walk(v)
        elif isinstance(o, (list, tuple)):
            for v in o:
                walk(v)

    walk(obj)
    return " ".join(parts)
