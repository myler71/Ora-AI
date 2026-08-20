"""LLM factory (Groq) with structured JSON output.

Uses Groq JSON mode (`response_format={"type":"json_object"}`) plus a Pydantic
schema injected into the prompt, then validates the response. This is more
reliable across Groq models than tool-calling-based structured output.
"""

from __future__ import annotations

import json
import re
from typing import Type, TypeVar

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel

from app.config import settings

T = TypeVar("T", bound=BaseModel)

_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def _llm(temperature: float = 0.1, json_mode: bool = True) -> ChatGroq:
    kwargs = {}
    if json_mode:
        kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}
    return ChatGroq(
        model=settings.groq_model,
        api_key=settings.groq_api_key,
        temperature=temperature,
        **kwargs,
    )


def _clean_json(text: str) -> str:
    text = text.strip()
    text = _FENCE.sub("", text).strip()
    return text


def generate_structured(
    system: str,
    human: str,
    schema: Type[T],
    *,
    temperature: float = 0.1,
) -> T:
    """Run an LLM call returning a validated pydantic model (JSON mode)."""
    schema_json = json.dumps(schema.model_json_schema(), ensure_ascii=False)
    full_system = (
        system
        + "\n\nRespond with ONLY a valid JSON object (no prose, no markdown) that "
        + "conforms exactly to this JSON schema:\n"
        + schema_json
    )
    llm = _llm(temperature=temperature, json_mode=True)
    resp = llm.invoke([SystemMessage(content=full_system), HumanMessage(content=human)])
    return schema.model_validate_json(_clean_json(resp.content))


def generate_text(system: str, human: str, *, temperature: float = 0.1) -> str:
    return (
        _llm(temperature=temperature, json_mode=False)
        .invoke([SystemMessage(content=system), HumanMessage(content=human)])
        .content
    )
