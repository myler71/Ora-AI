"""Application configuration via environment variables (.env supported)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "sqlite:///./dental_ai.db"

    # LLM (Groq)
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    # Embeddings (local sentence-transformers)
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dim: int = 384
    embedding_batch_size: int = 32

    # Vector backend: "numpy" (in-process cosine, no pgvector extension) is the
    # default. When DATABASE_URL points at a Postgres instance with pgvector
    # installed, set vector_backend="pgvector".
    vector_backend: str = "numpy"

    # Web research
    tavily_api_key: str = ""
    tavily_max_results: int = 5

    # Retrieval
    semantic_top_k: int = 6
    patient_top_k: int = 20

    # Observability (optional)
    langsmith_tracing: bool = False
    langsmith_api_key: str = ""
    langsmith_project: str = "dental-ai"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
