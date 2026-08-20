"""External web research via Tavily."""

from __future__ import annotations

from app.config import settings
from app.schemas.retrieval import EvidenceItem


def _client():
    from tavily import TavilyClient

    return TavilyClient(api_key=settings.tavily_api_key)


def search_web(question: str, max_results: int | None = None) -> list[EvidenceItem]:
    if not settings.tavily_api_key:
        return []

    max_results = max_results or settings.tavily_max_results
    client = _client()
    response = client.search(
        query=question,
        search_depth="advanced",
        max_results=max_results,
        include_answer=False,
    )

    evidence: list[EvidenceItem] = []
    for i, result in enumerate(response.get("results", [])):
        evidence.append(
            EvidenceItem(
                source_type="web",
                source_id=result.get("url"),
                title=result.get("title"),
                content=result.get("content", ""),
                relevance_score=result.get("score"),
                citation=result.get("url"),
                publication_date=None,
                evidence_type="web",
                ranking=i + 1,
                metadata={"url": result.get("url")},
            )
        )
    return evidence
