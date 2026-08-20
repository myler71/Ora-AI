"""Seed the database with demo clinical data and embed the knowledge base.

Run:  python -m app.db.seed
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.orm import Session

from app.config import settings
from app.db.engine import SessionLocal, init_db
from app.db.models import (
    Allergy,
    Appointment,
    DoctorNote,
    KnowledgeChunk,
    Material,
    Medication,
    Patient,
    Tooth,
    ToothEvent,
)
from app.retrieval.embeddings import embed_texts

KNOWLEDGE_DIR = (
    Path(__file__).resolve().parent.parent.parent / "data" / "sample_knowledge"
)

_FRONTMATTER = re.compile(r"^---\s*\n(?P<fm>.*?)\n---\s*\n", re.DOTALL)


def _parse_document(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    meta: dict = {}
    body = text
    m = _FRONTMATTER.match(text)
    if m:
        body = text[m.end() :]
        for line in m.group("fm").splitlines():
            line = line.strip()
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
    return meta, body


def seed_knowledge(session: Session) -> int:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500, chunk_overlap=60, separators=["\n\n", "\n", ". ", " "]
    )

    existing = session.query(KnowledgeChunk).count()
    if existing > 0:
        return existing

    docs = sorted(KNOWLEDGE_DIR.glob("*.md"))
    chunks: list[tuple[dict, str]] = []
    for path in docs:
        meta, body = _parse_document(path)
        doc_id = meta.get("document_id", path.stem)
        texts = splitter.split_text(body)
        for i, chunk_text in enumerate(texts):
            chunk_meta = dict(meta)
            chunk_meta["_chunk_id"] = f"{doc_id}-{i:03d}"
            chunks.append((chunk_meta, chunk_text))

    embeddings = embed_texts([c for _, c in chunks])

    for (meta, text), emb in zip(chunks, embeddings):
        chunk = KnowledgeChunk(
            document_id=meta.get("document_id", ""),
            chunk_id=meta["_chunk_id"],
            title=meta.get("title"),
            author=meta.get("author"),
            source=meta.get("source"),
            publication_date=meta.get("publication_date"),
            specialty=meta.get("specialty"),
            topic=meta.get("topic"),
            procedure=meta.get("procedure"),
            condition=meta.get("condition"),
            drug=meta.get("drug"),
            material=meta.get("material"),
            evidence_type=meta.get("evidence_type"),
            content=text,
        )
        chunk.set_embedding(emb)
        session.add(chunk)

    session.commit()
    return len(chunks)


def _patient(
    session: Session,
    first: str,
    last: str,
    dob: str,
    gender: str,
    history: list[str],
    allergies: list[tuple],
    meds: list[tuple],
    teeth: list[tuple],
    events: list[tuple],
    notes: list[tuple],
    appointments: list[tuple],
) -> Patient:
    import json

    p = Patient(
        first_name=first,
        last_name=last,
        dob=dob,
        gender=gender,
        medical_history=json.dumps(history),
    )
    session.add(p)
    session.flush()

    for allergen, severity, reaction, note in allergies:
        session.add(
            Allergy(
                patient_id=p.id,
                allergen=allergen,
                severity=severity,
                reaction=reaction,
                notes=note,
            )
        )
    for name, dosage, freq, indication, active in meds:
        session.add(
            Medication(
                patient_id=p.id,
                name=name,
                dosage=dosage,
                frequency=freq,
                indication=indication,
                active=active,
            )
        )
    tooth_objs: dict[int, Tooth] = {}
    for number, quadrant, status, note in teeth:
        t = Tooth(
            patient_id=p.id,
            tooth_number=number,
            quadrant=quadrant,
            status=status,
            notes=note,
        )
        session.add(t)
        session.flush()
        tooth_objs[number] = t
    for tooth_no, etype, desc, days_ago in events:
        session.add(
            ToothEvent(
                patient_id=p.id,
                tooth_id=(
                    tooth_objs.get(tooth_no).id if tooth_no in tooth_objs else None
                ),
                event_type=etype,
                description=desc,
                performed_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            )
        )
    for ntype, content, days_ago in notes:
        session.add(
            DoctorNote(
                patient_id=p.id,
                note_type=ntype,
                content=content,
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            )
        )
    for days_ahead, reason, status in appointments:
        session.add(
            Appointment(
                patient_id=p.id,
                scheduled_at=datetime.now(timezone.utc) + timedelta(days=days_ahead),
                reason=reason,
                status=status,
            )
        )
    return p


def seed_patients(session: Session) -> int:
    if session.query(Patient).count() > 0:
        return session.query(Patient).count()

    _patient(
        session,
        "Sara",
        "Hassan",
        "1985-04-12",
        "female",
        ["type 2 diabetes (well controlled)", "hypertension"],
        [
            ("Penicillin", "severe", "anaphylaxis", "confirmed childhood reaction"),
            ("Latex", "mild", "contact dermatitis", None),
        ],
        [
            ("Metformin", "850 mg", "twice daily", "type 2 diabetes", True),
            ("Lisinopril", "10 mg", "once daily", "hypertension", True),
        ],
        [
            (16, 1, "present", None),
            (17, 1, "present", None),
            (18, 1, "present", None),
            (26, 2, "present", None),
            (27, 2, "carious", "occlusal caries"),
            (36, 3, "restored", "amalgam restoration 2021"),
            (46, 4, "present", None),
            (47, 4, "missing", "extracted 2020"),
        ],
        [
            (36, "restoration", "Amalgam restoration placed", 800),
            (47, "extraction", "Extraction of tooth 47 due to fracture", 1100),
        ],
        [
            (
                "clinical",
                "Reports sensitivity to cold on lower right. Diabetes well controlled per latest HbA1c.",
                30,
            ),
            ("clinical", "Existing amalgam on 36 intact; monitor.", 200),
        ],
        [
            (10, "Scheduled cleaning and examination", "scheduled"),
        ],
    )

    _patient(
        session,
        "Omar",
        "El-Sayed",
        "1972-09-30",
        "male",
        ["atrial fibrillation", "osteoporosis"],
        [
            ("Sulfonamides", "moderate", "rash", None),
        ],
        [
            ("Apixaban", "5 mg", "twice daily", "atrial fibrillation", True),
            ("Alendronate", "70 mg", "weekly", "osteoporosis", True),
        ],
        [
            (11, 1, "present", None),
            (12, 1, "present", None),
            (21, 2, "present", None),
            (22, 2, "carious", "cervical caries"),
            (31, 3, "present", None),
            (32, 3, "present", None),
            (41, 4, "present", None),
            (42, 4, "present", None),
        ],
        [
            (22, "restoration", "Composite restoration tooth 22", 400),
        ],
        [
            (
                "clinical",
                "On apixaban and alendronate — consult before extractions. MRONJ risk noted.",
                60,
            ),
        ],
        [
            (
                5,
                "Extraction of tooth 22 — pre-operative medical consult required",
                "scheduled",
            ),
        ],
    )

    _patient(
        session,
        "Laila",
        "Mostafa",
        "1995-01-22",
        "female",
        ["none"],
        [],
        [],
        [
            (16, 1, "present", None),
            (17, 1, "present", None),
            (26, 2, "present", None),
            (36, 3, "present", None),
            (37, 3, "present", None),
            (46, 4, "present", None),
        ],
        [],
        [
            (
                "clinical",
                "New patient intake. No known conditions. Interested in orthodontic options.",
                5,
            )
        ],
        [(3, "Orthodontic consultation", "scheduled")],
    )

    session.commit()
    return session.query(Patient).count()


def seed_materials(session: Session) -> int:
    if session.query(Material).count() > 0:
        return session.query(Material).count()

    items = [
        ("Resin composite (A2)", "restorative", 12.0, "syringes", 4.0),
        ("Resin composite (A3)", "restorative", 3.0, "syringes", 4.0),
        ("Dental amalgam capsules", "restorative", 40.0, "capsules", 20.0),
        ("Glass-ionomer cement", "restorative", 8.0, "tubs", 4.0),
        ("Sodium hypochlorite 5.25%", "endodontic", 6.0, "bottles", 3.0),
        ("Gutta-percha points", "endodontic", 150.0, "points", 60.0),
        ("Articaine 4% cartridges", "anesthetic", 30.0, "cartridges", 15.0),
        ("Composite bond (adhesive)", "restorative", 9.0, "bottles", 4.0),
    ]
    for name, category, qty, unit, threshold in items:
        session.add(
            Material(
                name=name,
                category=category,
                quantity=qty,
                unit=unit,
                reorder_threshold=threshold,
                last_updated=datetime.now(timezone.utc),
            )
        )
    session.commit()
    return len(items)


def main() -> None:
    init_db()
    session = SessionLocal()
    try:
        n_knowledge = seed_knowledge(session)
        n_patients = seed_patients(session)
        n_materials = seed_materials(session)
        print(
            f"Seeded: {n_knowledge} knowledge chunks, "
            f"{n_patients} patients, {n_materials} materials."
        )
        print(
            f"Embedding model: {settings.embedding_model}, dim {settings.embedding_dim}"
        )
    finally:
        session.close()


if __name__ == "__main__":
    main()
