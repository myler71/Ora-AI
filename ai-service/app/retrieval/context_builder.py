"""Context builder: assemble role-specific context from retrieved sources."""

from __future__ import annotations

from app.schemas.retrieval import EvidenceItem, PatientContext, RetrievalPlan


def build_patient_context_block(pc: PatientContext) -> str:
    if pc is None:
        return "No patient context available."
    lines = [
        f"Patient: {pc.demographics.get('first_name','')} {pc.demographics.get('last_name','')} "
        f"(DOB {pc.demographics.get('dob','unknown')}, {pc.demographics.get('gender','')})",
        "Medical history: " + (", ".join(pc.medical_history) or "none recorded"),
    ]
    lines.append(
        "Allergies: "
        + (
            ", ".join(
                f"{a['allergen']} ({a.get('severity','?')})" for a in pc.allergies
            )
            or "none recorded"
        )
    )
    lines.append(
        "Medications: "
        + (
            ", ".join(
                f"{m['name']} {m.get('dosage','')} {m.get('frequency','')}".strip()
                for m in pc.medications
            )
            or "none recorded"
        )
    )
    lines.append(
        "Teeth: "
        + (
            ", ".join(f"{t['tooth_number']}({t['status']})" for t in pc.teeth)
            or "none recorded"
        )
    )
    if pc.tooth_events:
        lines.append("Tooth events:")
        for e in pc.tooth_events:
            lines.append(
                f"  - [{e.get('performed_at','?')}] tooth {e.get('tooth_number')} "
                f"{e.get('event_type')}: {e.get('description','')}"
            )
    if pc.notes:
        lines.append("Doctor notes:")
        for n in pc.notes:
            lines.append(f"  - ({n.get('note_type','note')}) {n.get('content','')}")
    if pc.appointments:
        lines.append("Appointments:")
        for a in pc.appointments:
            lines.append(
                f"  - {a.get('scheduled_at','?')}: {a.get('reason','')} [{a.get('status','')}]"
            )
    return "\n".join(lines)


def build_evidence_block(evidence: list[EvidenceItem], max_items: int = 12) -> str:
    if not evidence:
        return "No retrieved evidence."
    lines = []
    for item in evidence[:max_items]:
        src = item.source_type.upper()
        cite = item.citation or item.source_id or ""
        lines.append(
            f"[{item.ranking or '?'}] ({src}) {item.title or item.content[:80]}"
        )
        if item.content:
            lines.append(f"    {item.content[:400]}")
        if cite:
            lines.append(f"    citation: {cite}")
    return "\n".join(lines)


def build_context(
    plan: RetrievalPlan,
    patient_context: PatientContext | None,
    evidence: list[EvidenceItem],
    *,
    role: str = "clinical_analyst",
) -> str:
    """Build role-specific prompt context.

    Roles filter which evidence/patient blocks are included:
      - clinical_analyst / medication_specialist / materials_specialist -> patient + evidence
      - evidence_specialist / research_specialist -> evidence only
      - synthesizer -> patient + full evidence
    """
    parts: list[str] = []

    include_patient = role in {
        "clinical_analyst",
        "medication_specialist",
        "materials_specialist",
        "synthesizer",
    }
    if include_patient:
        parts.append(
            "## Patient Context\n" + build_patient_context_block(patient_context)
        )

    if role in {
        "evidence_specialist",
        "research_specialist",
        "synthesizer",
        "clinical_analyst",
    }:
        parts.append("## Retrieved Evidence\n" + build_evidence_block(evidence))

    return "\n\n".join(parts)
