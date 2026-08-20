"""RAG retrieval tests: structured, semantic, router, fusion, pipeline."""

from __future__ import annotations

from app.retrieval import semantic, structured
from app.retrieval.fusion import fuse
from app.retrieval.pipeline import retrieve
from app.retrieval.router import RetrievalRouter
from app.schemas.retrieval import EvidenceItem, RetrievalPlan


# --- Structured (SQL) retrieval -------------------------------------------


def test_structured_retrieval_returns_patient_context(session):
    ctx = structured.get_patient_context(session, 1)
    assert ctx is not None
    assert ctx.demographics["last_name"] == "Hassan"
    assert any("diabetes" in h.lower() for h in ctx.medical_history)
    assert any(a["allergen"] == "Penicillin" for a in ctx.allergies)
    assert any(m["name"] == "Metformin" for m in ctx.medications)
    assert any(t["tooth_number"] == 36 and t["status"] == "restored" for t in ctx.teeth)
    assert any(e["tooth_number"] == 36 for e in ctx.tooth_events)


def test_structured_retrieval_unknown_patient(session):
    assert structured.get_patient_context(session, 9999) is None


def test_structured_medications(session):
    meds = structured.get_medications(session, 2)
    names = {m["name"] for m in meds}
    assert {"Apixaban", "Alendronate"} <= names


# --- Semantic (vector) retrieval ------------------------------------------


def test_semantic_retrieval_endodontics(session):
    hits = semantic.search_knowledge(
        session,
        "What does the literature say about root canal treatment for irreversible pulpitis?",
    )
    assert hits, "expected semantic hits"
    top = hits[0]
    assert top.source_type == "semantic"
    assert top.relevance_score > 0.3
    assert "pulp" in top.content.lower() or "endodon" in top.content.lower()


def test_semantic_retrieval_materials(session):
    hits = semantic.search_knowledge(
        session, "composite versus amalgam restorative material selection"
    )
    assert hits
    joined = " ".join(h.content.lower() for h in hits)
    assert "composite" in joined


def test_semantic_retrieval_returns_ranked_scores(session):
    hits = semantic.search_knowledge(session, "management of dental caries")
    scores = [h.relevance_score for h in hits if h.relevance_score is not None]
    assert scores == sorted(scores, reverse=True)
    for i, h in enumerate(hits, start=1):
        assert h.ranking == i


def test_semantic_metadata_filter(session):
    hits = semantic.search_knowledge(
        session, "periodontitis treatment", filters={"specialty": "Periodontics"}
    )
    assert hits
    assert all(h.metadata.get("specialty") == "Periodontics" for h in hits)


# --- Router ----------------------------------------------------------------


def test_router_patient_question():
    plan = RetrievalRouter().plan("What happened to tooth 36 for this patient?")
    assert plan.patient_context is True


def test_router_literature_question():
    plan = RetrievalRouter().plan(
        "What does the literature say about implant survival?"
    )
    assert plan.semantic_knowledge is True


def test_router_recent_question():
    plan = RetrievalRouter().plan(
        "What are the recent recommendations for caries management?"
    )
    assert plan.web_research is True
    assert plan.semantic_knowledge is True


def test_router_medication_question():
    plan = RetrievalRouter().plan(
        "Are this patient's medications relevant to an extraction?"
    )
    assert plan.medication_knowledge is True
    assert plan.patient_context is True


# --- Fusion ----------------------------------------------------------------


def test_fusion_deduplicates_and_ranks():
    a = EvidenceItem(
        source_type="web", source_id="u1", title="A", content="x", relevance_score=0.5
    )
    b = EvidenceItem(
        source_type="semantic",
        source_id="k1",
        title="B",
        content="y",
        relevance_score=0.9,
    )
    dup = EvidenceItem(
        source_type="web", source_id="u1", title="A", content="x", relevance_score=0.5
    )
    merged = fuse([[a, dup], [b]])
    assert len(merged) == 2
    assert merged[0].title == "B"
    assert merged[0].ranking == 1
    assert merged[1].ranking == 2


def test_fusion_empty():
    assert fuse([]) == []


# --- Pipeline --------------------------------------------------------------


def test_pipeline_full_retrieval(session):
    result = retrieve(
        session,
        "Give me a clinical briefing for this patient, including medication considerations",
        patient_id=1,
    )
    assert result.plan.patient_context is True
    assert result.patient_context is not None
    assert result.evidence, "expected fused evidence"

    types = {e.source_type for e in result.evidence}
    assert "semantic" in types


def test_pipeline_context_builder(session):
    from app.retrieval.context_builder import build_context

    result = retrieve(session, "caries management evidence", patient_id=1)
    block = build_context(
        result.plan, result.patient_context, result.evidence, role="clinical_analyst"
    )
    assert "Patient Context" in block
    assert "Retrieved Evidence" in block
