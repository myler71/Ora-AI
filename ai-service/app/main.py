"""FastAPI application entrypoint.

Run:  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router
from app.db.engine import init_db

app = FastAPI(
    title="Dental Clinical Intelligence API",
    description="Decision-support AI layer for dental clinicians (RAG + multi-agent).",
    version="0.1.0",
)

app.include_router(router)


@app.on_event("startup")
def _startup() -> None:
    init_db()
