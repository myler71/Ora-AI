"""Tests for CLI commands."""

from unittest.mock import patch

from app.cli import build_parser


def test_cli_parser_seed():
    parser = build_parser()
    args = parser.parse_args(["seed"])
    assert args.command == "seed"


def test_cli_parser_ask():
    parser = build_parser()
    args = parser.parse_args(["ask", "test question", "--patient", "1"])
    assert args.command == "ask"
    assert args.question == "test question"
    assert args.patient == 1


def test_cli_parser_analyze():
    parser = build_parser()
    args = parser.parse_args(["analyze", "test question", "--patient", "1"])
    assert args.command == "analyze"
    assert args.question == "test question"


def test_cli_parser_research():
    parser = build_parser()
    args = parser.parse_args(["research", "test question"])
    assert args.command == "research"


def test_cli_parser_evidence():
    parser = build_parser()
    args = parser.parse_args(["evidence", "test question", "--patient", "1"])
    assert args.command == "evidence"


def test_cli_parser_memory():
    parser = build_parser()
    args = parser.parse_args(["memory", "--patient", "1"])
    assert args.command == "memory"
    assert args.patient == 1


def test_cli_parser_trace():
    parser = build_parser()
    args = parser.parse_args(["trace", "abc123"])
    assert args.command == "trace"
    assert args.run_id == "abc123"


def test_cli_parser_serve():
    parser = build_parser()
    args = parser.parse_args(["serve", "--host", "0.0.0.0", "--port", "9000"])
    assert args.command == "serve"
    assert args.host == "0.0.0.0"
    assert args.port == 9000
