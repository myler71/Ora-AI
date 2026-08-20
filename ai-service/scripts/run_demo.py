"""End-to-end demo: seed -> full LangGraph run -> trace -> sample report.

Non-interactive (auto-approves the review). Run:
  python scripts/run_demo.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import seed
from app.db.engine import SessionLocal, init_db
from app.graph import workflow
from app.observability import tracer

QUESTION = (
    "Give me a clinical briefing for this patient and identify the evidence, "
    "materials, medication considerations, and missing information I should review."
)
PATIENT_ID = 1


def main() -> None:
    init_db()
    session = SessionLocal()
    try:
        seed.seed_knowledge(session)
        seed.seed_patients(session)
        seed.seed_materials(session)
    finally:
        session.close()

    print(f"Question: {QUESTION}\n")
    draft, config = workflow.start_analysis(QUESTION, patient_id=PATIENT_ID)
    thread_id = config["configurable"]["thread_id"]
    print(f"thread_id: {thread_id}")
    print("Draft produced. Auto-approving for demo...\n")

    final = workflow.submit_review(config, {"action": "approve", "note": "demo"})

    report = final.get("report", {})
    print("===== FINAL REPORT =====")
    for key in [
        "case_overview",
        "documented_findings",
        "evidence_summary",
        "medication_considerations",
        "materials_and_supplies",
        "uncertainties",
        "missing_information",
        "questions_for_dentist",
        "evidence_citations",
        "draft_conclusion",
    ]:
        val = report.get(key)
        if not val:
            continue
        print(f"\n## {key.replace('_', ' ').title()}")
        if isinstance(val, list):
            for item in val:
                print(f"  - {item}")
        else:
            print(f"  {val}")

    print("\n===== SAFETY =====")
    print(json.dumps(report.get("_safety", {}), indent=2))
    print(f"\ndisclaimer: {final.get('disclaimer')}")

    out_dir = Path(__file__).resolve().parent.parent / "artifacts"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "sample_report.json").write_text(
        json.dumps({"final_output": final}, indent=2, default=str), encoding="utf-8"
    )
    print(f"\nSaved sample report to {out_dir / 'sample_report.json'}")


if __name__ == "__main__":
    main()
