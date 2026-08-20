"""Observability tracer: persist run + step traces to answer 'why this report?'."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models import RunRecord, RunStep


def new_run_id() -> str:
    return uuid.uuid4().hex[:16]


def start_run(
    session: Session,
    *,
    question: str,
    patient_id: int | None = None,
    doctor_id: str | None = None,
) -> str:
    run_id = new_run_id()
    session.add(
        RunRecord(
            run_id=run_id,
            question=question,
            patient_id=patient_id,
            doctor_id=doctor_id,
            status="running",
        )
    )
    session.commit()
    return run_id


def record_routing(session: Session, run_id: str, plan: dict) -> None:
    session.query(RunRecord).filter(RunRecord.run_id == run_id).update(
        {"routing_decision": json.dumps(plan)}
    )
    session.commit()


def record_step(
    session: Session, run_id: str, step: str, kind: str, detail: dict | None = None
) -> None:
    session.add(
        RunStep(
            run_id=run_id,
            step=step,
            kind=kind,
            detail_json=json.dumps(detail) if detail is not None else None,
        )
    )
    session.commit()


def finish_run(session: Session, run_id: str, status: str = "complete") -> None:
    session.query(RunRecord).filter(RunRecord.run_id == run_id).update(
        {"status": status, "finished_at": datetime.now(timezone.utc)}
    )
    session.commit()


def get_trace(session: Session, run_id: str) -> dict:
    run = session.query(RunRecord).filter(RunRecord.run_id == run_id).first()
    steps = (
        session.query(RunStep)
        .filter(RunStep.run_id == run_id)
        .order_by(RunStep.id)
        .all()
    )
    return {
        "run": (
            {
                "run_id": run.run_id,
                "question": run.question,
                "patient_id": run.patient_id,
                "status": run.status,
                "routing_decision": (
                    json.loads(run.routing_decision) if run.routing_decision else None
                ),
            }
            if run
            else None
        ),
        "steps": [
            {
                "step": s.step,
                "kind": s.kind,
                "detail": json.loads(s.detail_json) if s.detail_json else None,
            }
            for s in steps
        ],
    }
