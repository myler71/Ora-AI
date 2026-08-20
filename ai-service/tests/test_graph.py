"""Tests for local knowledge graph adapter."""

from app.db.engine import SessionLocal, init_db
from app.graph.knowledge_graph import KnowledgeGraph, build_graph


def test_knowledge_graph_add_and_query():
    kg = KnowledgeGraph()
    kg.add("patient:1", "TAKES", "medication:Metformin")
    kg.add("medication:Metformin", "TREATS", "condition:diabetes")
    neighbors = kg.neighbors("patient:1")
    assert len(neighbors) >= 1
    assert any(n["relation"] == "TAKES" for n in neighbors)


def test_build_graph_from_db():
    init_db()
    session = SessionLocal()
    try:
        kg = build_graph(session)
        assert len(kg.g.nodes) > 0
        assert len(kg.g.edges) > 0
        relationships = kg.relationships_for_patient(1)
        assert len(relationships) >= 1
    finally:
        session.close()


def test_graph_to_dict():
    kg = KnowledgeGraph()
    kg.add("A", "REL", "B")
    d = kg.to_dict()
    assert "nodes" in d
    assert "edges" in d
    assert len(d["nodes"]) == 2
    assert len(d["edges"]) == 1
    assert d["edges"][0]["relation"] == "REL"
