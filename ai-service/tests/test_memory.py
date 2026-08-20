"""Tests for memory store."""

from app.db.engine import SessionLocal, init_db
from app.memory import store


def test_store_and_retrieve_case_finding():
    init_db()
    session = SessionLocal()
    try:
        row = store.store_case_finding(
            session,
            finding="Test finding",
            patient_id=1,
            case_id="test-case",
            doctor_id="doc-1",
            question="test question",
            approved=True,
        )
        assert row.id is not None
        memories = store.get_case_memories(session, patient_id=1)
        assert len(memories) >= 1
        assert any(m.finding == "Test finding" for m in memories)
    finally:
        session.close()


def test_store_and_retrieve_doctor_preference():
    session = SessionLocal()
    try:
        row = store.store_doctor_preference(
            session,
            preference="Always include material availability",
            doctor_id="doc-1",
            category="workflow",
        )
        assert row.id is not None
        prefs = store.get_doctor_preferences(session, "doc-1")
        assert "Always include material availability" in prefs
    finally:
        session.close()


def test_store_and_retrieve_feedback():
    session = SessionLocal()
    try:
        row = store.store_feedback(
            session,
            doctor_correction="Use material Y instead",
            doctor_id="doc-1",
            patient_id=1,
            ai_output="Material X recommended",
            reason="Material X unavailable",
            category="modify",
        )
        assert row.id is not None
        feedback = store.get_feedback(session, patient_id=1)
        assert len(feedback) >= 1
    finally:
        session.close()


def test_store_and_retrieve_instruction():
    session = SessionLocal()
    try:
        row = store.store_instruction(
            session,
            instruction="Always check renal function before prescribing NSAIDs",
            doctor_id="doc-1",
            scope="medication",
            active=True,
        )
        assert row.id is not None
        instructions = store.get_active_instructions(session, "doc-1")
        assert any("renal function" in i.lower() for i in instructions)
    finally:
        session.close()
