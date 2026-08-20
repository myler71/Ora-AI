"""Smoke tests for CLI and API (no live LLM calls)."""

import pytest
from fastapi.testclient import TestClient

from app.cli import build_parser
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_api_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_api_admin_seed(client):
    response = client.post("/admin/seed")
    assert response.status_code == 200
    data = response.json()
    assert "knowledge_chunks" in data
    assert "patients" in data
    assert "materials" in data


def test_api_evidence(client):
    response = client.get("/ai/cases/1/evidence?question=caries")
    assert response.status_code == 200
    data = response.json()
    assert "evidence" in data
    assert "plan" in data


def test_api_memory(client):
    response = client.get("/ai/cases/1/memory")
    assert response.status_code == 200
    data = response.json()
    assert "memories" in data


def test_cli_parser_all_commands():
    parser = build_parser()
    commands = [
        ["seed"],
        ["ask", "test", "--patient", "1"],
        ["analyze", "test", "--patient", "1"],
        ["research", "test"],
        ["evidence", "test", "--patient", "1"],
        ["memory", "--patient", "1"],
        ["trace", "abc123"],
        ["serve", "--host", "0.0.0.0", "--port", "9000"],
    ]
    for cmd in commands:
        args = parser.parse_args(cmd)
        assert args.command == cmd[0]
