"""Command-line interface for the dental intelligence stack.

Usage:
  python -m app.cli seed
  python -m app.cli ask "clinical briefing for this patient" --patient 1
  python -m app.cli analyze "..." --patient 1
  python -m app.cli research "recent caries recommendations"
  python -m app.cli evidence "..." --patient 1
  python -m app.cli memory --patient 1
  python -m app.cli trace <run_id>
  python -m app.cli serve
"""

from __future__ import annotations

import argparse
import json
import sys

from app.db.engine import SessionLocal, init_db


def _print_report(report: dict) -> None:
    order = [
        "case_overview",
        "documented_findings",
        "clinical_context",
        "relevant_dental_history",
        "evidence_summary",
        "medication_considerations",
        "materials_and_supplies",
        "availability",
        "agent_disagreements",
        "uncertainties",
        "missing_information",
        "questions_for_dentist",
        "evidence_citations",
        "draft_conclusion",
    ]
    for key in order:
        val = report.get(key)
        if not val:
            continue
        print(f"\n## {key.replace('_', ' ').title()}")
        if isinstance(val, list):
            for item in val:
                # Replace non-breaking hyphens and other problematic chars
                safe_item = (
                    str(item)
                    .replace("\u2011", "-")
                    .replace("\u2013", "-")
                    .replace("\u2014", "-")
                    .replace("\u202f", " ")
                    .replace("\u00a0", " ")
                )
                print(f"  - {safe_item}")
        else:
            safe_val = (
                str(val)
                .replace("\u2011", "-")
                .replace("\u2013", "-")
                .replace("\u2014", "-")
                .replace("\u202f", " ")
                .replace("\u00a0", " ")
            )
            print(f"  {safe_val}")


def cmd_seed(_args) -> None:
    from app.db import seed

    init_db()
    session = SessionLocal()
    try:
        k = seed.seed_knowledge(session)
        p = seed.seed_patients(session)
        m = seed.seed_materials(session)
        print(f"Seeded {k} knowledge chunks, {p} patients, {m} materials.")
    finally:
        session.close()


def cmd_analyze(args) -> None:
    from app.graph import workflow
    from app.observability import tracer

    draft, config = workflow.start_analysis(
        args.question, patient_id=args.patient, doctor_id=args.doctor
    )
    thread_id = config["configurable"]["thread_id"]
    print(f"thread_id: {thread_id}")
    print("\n===== DRAFT REPORT (awaiting review) =====")
    if draft and "draft_report" in draft:
        _print_report(draft["draft_report"])
    if not args.no_review:
        _interactive_review(config)


def _interactive_review(config: dict) -> None:
    from app.graph import workflow

    print("\n===== REVIEW =====")
    print("Actions: approve | modify | reject | request_research")
    action = input("action [approve]: ").strip() or "approve"
    note = ""
    mods = ""
    if action in ("modify", "reject", "request_research"):
        note = input("note: ").strip()
    if action == "modify":
        mods = input("modifications: ").strip()
    final = workflow.submit_review(
        config, {"action": action, "note": note, "modifications": mods}
    )
    print("\n===== FINAL OUTPUT =====")
    print(f"review_action: {final.get('review_action')}")
    print(f"disclaimer: {final.get('disclaimer')}")
    if final.get("modifications"):
        print(f"modifications: {final['modifications']}")


def cmd_ask(args) -> None:
    cmd_analyze(args)


def cmd_research(args) -> None:
    from app.retrieval import pipeline

    session = SessionLocal()
    try:
        result = pipeline.retrieve(
            session, args.question, patient_id=args.patient, force_web=True
        )
        print("plan:", result.plan.rationale)
        for e in result.evidence:
            print(f"  [{e.ranking}] {e.source_type} {e.relevance_score} :: {e.title}")
            if e.citation:
                print(f"       {e.citation}")
    finally:
        session.close()


def cmd_evidence(args) -> None:
    from app.retrieval import pipeline

    session = SessionLocal()
    try:
        result = pipeline.retrieve(session, args.question, patient_id=args.patient)
        print(json.dumps(result.plan.model_dump(), indent=2))
        for e in result.evidence:
            print(f"  [{e.ranking}] {e.source_type} {e.relevance_score} :: {e.title}")
    finally:
        session.close()


def cmd_memory(args) -> None:
    from app.memory import store

    session = SessionLocal()
    try:
        memories = store.get_case_memories(session, patient_id=args.patient)
        for m in memories:
            flag = "approved" if m.approved else "pending"
            safe_finding = (
                str(m.finding)
                .replace("\u2011", "-")
                .replace("\u2013", "-")
                .replace("\u2014", "-")
                .replace("\u202f", " ")
                .replace("\u00a0", " ")
            )
            print(f"  [{flag}] {safe_finding}")
        if not memories:
            print("  (no case memories)")
    finally:
        session.close()


def cmd_trace(args) -> None:
    from app.observability import tracer

    session = SessionLocal()
    try:
        trace = tracer.get_trace(session, args.run_id)
        print(json.dumps(trace, indent=2, default=str))
    finally:
        session.close()


def cmd_serve(args) -> None:
    import uvicorn

    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=False)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="dental-ai", description="Dental Clinical Intelligence CLI"
    )
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("seed", help="seed demo data").set_defaults(func=cmd_seed)

    def _add_q(sp):
        sp.add_argument("question")
        sp.add_argument("--patient", type=int, default=None)
        sp.add_argument("--doctor", default=None)

    sp = sub.add_parser("ask", help="full analysis with review")
    _add_q(sp)
    sp.add_argument("--no-review", action="store_true")
    sp.set_defaults(func=cmd_ask)

    sp = sub.add_parser("analyze", help="run to draft report")
    _add_q(sp)
    sp.add_argument("--no-review", action="store_true")
    sp.set_defaults(func=cmd_analyze)

    sp = sub.add_parser("research", help="web research")
    _add_q(sp)
    sp.set_defaults(func=cmd_research)

    sp = sub.add_parser("evidence", help="retrieval only")
    _add_q(sp)
    sp.set_defaults(func=cmd_evidence)

    sp = sub.add_parser("memory", help="list case memories")
    sp.add_argument("--patient", type=int, default=None)
    sp.set_defaults(func=cmd_memory)

    sp = sub.add_parser("trace", help="show run trace")
    sp.add_argument("run_id")
    sp.set_defaults(func=cmd_trace)

    sp = sub.add_parser("serve", help="run the API server")
    sp.add_argument("--host", default="127.0.0.1")
    sp.add_argument("--port", type=int, default=8000)
    sp.set_defaults(func=cmd_serve)

    return p


def main(argv: list[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
