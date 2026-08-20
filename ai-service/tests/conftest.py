"""Shared fixtures: ensure DB is seeded (idempotent), provide a session."""

from __future__ import annotations

import pytest

from app.db import seed
from app.db.engine import SessionLocal, init_db


@pytest.fixture(scope="session", autouse=True)
def _seed_db():
    init_db()
    session = SessionLocal()
    try:
        seed.seed_knowledge(session)
        seed.seed_patients(session)
        seed.seed_materials(session)
    finally:
        session.close()
    yield


@pytest.fixture
def session():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()
