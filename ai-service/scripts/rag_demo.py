"""Quick RAG smoke demo: run retrieval and print a compact summary."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.engine import SessionLocal
from app.retrieval.pipeline import retrieve


def main() -> None:
    session = SessionLocal()
    try:
        result = retrieve(
            session,
            "clinical briefing for this patient: medication considerations and caries evidence",
            patient_id=1,
        )
        print("== RetrievalPlan ==")
        print(result.plan.model_dump())
        print(f"\n== Evidence ({len(result.evidence)} items) ==")
        for e in result.evidence[:6]:
            print(
                f"  [{e.ranking}] {e.source_type} score={e.relevance_score} :: {e.title}"
            )
        if result.patient_context:
            print("\n== Patient context ==")
            print(f"  meds: {[m['name'] for m in result.patient_context.medications]}")
            print(
                f"  allergies: {[a['allergen'] for a in result.patient_context.allergies]}"
            )
            print(
                f"  teeth: {[(t['tooth_number'], t['status']) for t in result.patient_context.teeth]}"
            )
    finally:
        session.close()


if __name__ == "__main__":
    main()
