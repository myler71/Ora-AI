"""Semantic (vector) dental-knowledge retrieval.

Default backend is "numpy": embeddings are stored as JSON in `knowledge_chunks`
and cosine similarity is computed in-process with NumPy. This keeps the demo
fully local (no pgvector extension, no Docker). A pgvector backend can be added
by setting VECTOR_BACKEND=pgvector against a Postgres instance with the
extension installed.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import KnowledgeChunk
from app.retrieval.embeddings import embed_query
from app.schemas.retrieval import EvidenceItem


@dataclass
class SemanticHit:
    chunk: KnowledgeChunk
    score: float


def _numpy_search(
    session: Session,
    query_embedding: list[float],
    top_k: int,
    filters: dict | None = None,
) -> list[SemanticHit]:
    stmt = select(KnowledgeChunk)
    if filters:
        for key, value in filters.items():
            if value and hasattr(KnowledgeChunk, key):
                stmt = stmt.where(getattr(KnowledgeChunk, key) == value)
    chunks = list(session.execute(stmt).scalars())

    qvec = np.asarray(query_embedding, dtype=np.float32)
    scored: list[SemanticHit] = []
    for chunk in chunks:
        emb = chunk.get_embedding()
        if emb is None:
            continue
        vec = np.asarray(emb, dtype=np.float32)
        denom = float(np.linalg.norm(qvec) * np.linalg.norm(vec))
        score = float(np.dot(qvec, vec) / denom) if denom else 0.0
        scored.append(SemanticHit(chunk=chunk, score=score))

    scored.sort(key=lambda h: h.score, reverse=True)
    return scored[:top_k]


def search_knowledge(
    session: Session,
    question: str,
    top_k: int | None = None,
    filters: dict | None = None,
) -> list[EvidenceItem]:
    top_k = top_k or settings.semantic_top_k
    query_embedding = embed_query(question)

    hits = _numpy_search(session, query_embedding, top_k, filters)

    evidence: list[EvidenceItem] = []
    for i, hit in enumerate(hits):
        c = hit.chunk
        evidence.append(
            EvidenceItem(
                source_type="semantic",
                source_id=c.chunk_id,
                title=c.title,
                content=c.content,
                relevance_score=round(hit.score, 4),
                citation=_citation(c),
                publication_date=c.publication_date,
                evidence_type=c.evidence_type,
                ranking=i + 1,
                metadata={
                    "document_id": c.document_id,
                    "specialty": c.specialty,
                    "topic": c.topic,
                    "procedure": c.procedure,
                    "condition": c.condition,
                },
            )
        )
    return evidence


def _citation(c: KnowledgeChunk) -> str:
    parts = [p for p in (c.title, c.source, c.publication_date) if p]
    return " | ".join(parts) if parts else c.chunk_id


def count_chunks(session: Session) -> int:
    return int(session.query(KnowledgeChunk).count())
