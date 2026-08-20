"""Evidence fusion: normalize, deduplicate, rank."""

from __future__ import annotations

from datetime import datetime, timezone

from app.schemas.retrieval import EvidenceItem


def _key(item: EvidenceItem) -> str:
    return f"{item.source_type}:{item.source_id or ''}:{item.title or ''}"


def fuse(
    sources: list[list[EvidenceItem]],
    *,
    rerank: bool = True,
) -> list[EvidenceItem]:
    """Merge evidence from multiple sources, dedupe, and rank by score."""
    seen: set[str] = set()
    merged: list[EvidenceItem] = []
    for group in sources:
        for item in group:
            k = _key(item)
            if k in seen:
                continue
            seen.add(k)
            merged.append(item)

    if rerank:
        merged.sort(
            key=lambda i: (
                i.relevance_score if i.relevance_score is not None else -1.0
            ),
            reverse=True,
        )
        for rank, item in enumerate(merged, start=1):
            item.ranking = rank

    for item in merged:
        if item.retrieved_at is None:
            item.retrieved_at = datetime.now(timezone.utc)
    return merged
