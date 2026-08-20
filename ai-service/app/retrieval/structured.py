"""Structured (SQL) patient-context retrieval."""

from __future__ import annotations

import json

from sqlalchemy.orm import Session, joinedload

from app.db.models import (
    Allergy,
    Appointment,
    DoctorNote,
    Medication,
    Patient,
    Tooth,
    ToothEvent,
)
from app.schemas.retrieval import PatientContext


def _load_history(raw: str | None) -> list[str]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else [str(data)]
    except json.JSONDecodeError:
        return [raw]


def get_patient_context(session: Session, patient_id: int) -> PatientContext | None:
    patient = session.get(Patient, patient_id)
    if patient is None:
        return None

    allergies = session.query(Allergy).filter(Allergy.patient_id == patient_id).all()
    medications = (
        session.query(Medication).filter(Medication.patient_id == patient_id).all()
    )
    teeth = session.query(Tooth).filter(Tooth.patient_id == patient_id).all()
    tooth_events = (
        session.query(ToothEvent)
        .options(joinedload(ToothEvent.tooth))
        .filter(ToothEvent.patient_id == patient_id)
        .order_by(ToothEvent.performed_at)
        .all()
    )
    notes = (
        session.query(DoctorNote)
        .filter(DoctorNote.patient_id == patient_id)
        .order_by(DoctorNote.created_at)
        .all()
    )
    appointments = (
        session.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.scheduled_at)
        .all()
    )

    return PatientContext(
        patient_id=patient_id,
        demographics={
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "dob": patient.dob,
            "gender": patient.gender,
        },
        medical_history=_load_history(patient.medical_history),
        allergies=[
            {
                "allergen": a.allergen,
                "severity": a.severity,
                "reaction": a.reaction,
                "notes": a.notes,
            }
            for a in allergies
        ],
        medications=[
            {
                "name": m.name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "indication": m.indication,
                "active": m.active,
            }
            for m in medications
        ],
        teeth=[
            {
                "tooth_number": t.tooth_number,
                "quadrant": t.quadrant,
                "status": t.status,
                "notes": t.notes,
            }
            for t in teeth
        ],
        tooth_events=[
            {
                "tooth_number": e.tooth.tooth_number if e.tooth else None,
                "event_type": e.event_type,
                "description": e.description,
                "performed_at": e.performed_at.isoformat() if e.performed_at else None,
            }
            for e in tooth_events
        ],
        notes=[
            {
                "note_type": n.note_type,
                "content": n.content,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notes
        ],
        appointments=[
            {
                "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
                "reason": a.reason,
                "status": a.status,
            }
            for a in appointments
        ],
    )


def get_medications(session: Session, patient_id: int) -> list[dict]:
    rows = session.query(Medication).filter(Medication.patient_id == patient_id).all()
    return [
        {
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "indication": m.indication,
            "active": m.active,
        }
        for m in rows
    ]
