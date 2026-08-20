"""Web research (Tavily) tests — best-effort, tolerate offline/empty."""

from __future__ import annotations

import pytest

from app.config import settings
from app.retrieval import web


@pytest.mark.skipif(not settings.tavily_api_key, reason="no TAVILY_API_KEY")
def test_web_search_returns_evidence():
    results = web.search_web(
        "recent dental caries management recommendations", max_results=3
    )
    assert isinstance(results, list)
    for item in results:
        assert item.source_type == "web"
        assert item.citation
        assert item.content
