# Dental Clinical Intelligence AI Stack

Decision-support AI layer for dental clinicians — RAG + multi-agent orchestration with human-in-the-loop review.

## Features

- **Structured retrieval**: Patient SQL (demographics, allergies, medications, odontogram, tooth events, notes)
- **Semantic retrieval**: Vector search over dental knowledge base (pgvector-ready, numpy fallback)
- **Web research**: Tavily integration for fresh/external evidence
- **Retrieval router**: Classifies questions into retrieval plans
- **Multi-agent crew**: 5 specialist agents (clinical analyst, evidence specialist, research specialist, medication specialist, materials specialist) + case synthesizer
- **LangGraph orchestration**: Full workflow with HITL review (approve/modify/reject)
- **Memory**: Case memory, doctor preferences, feedback, durable instructions
- **Knowledge graph**: Local NetworkX adapter (Neo4j-ready)
- **Safety guardrails**: Prohibited-claim detection, citation validation, uncertainty disclosure
- **Observability**: Run/step traces for "why this report?" debugging
- **API**: FastAPI with endpoints for analyze, review, research, evidence, memory, feedback
- **CLI**: Command-line interface for all operations

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
GROQ_API_KEY=your-key-here
GROQ_MODEL=openai/gpt-oss-120b
TAVILY_API_KEY=your-key-here
DATABASE_URL=sqlite:///./dental_ai.db
```

### 3. Seed demo data

```bash
python -m app.cli seed
```

This creates:
- 3 demo patients (with realistic dental histories, allergies, medications)
- 13 embedded knowledge chunks (caries, endodontics, periodontics, materials, medications)
- 8 inventory items

### 4. Run the demo

```bash
python scripts/run_demo.py
```

Or use the CLI:

```bash
python -m app.cli ask "Clinical briefing for this patient: medication considerations and caries evidence" --patient 1
```

### 5. Start the API server

```bash
python -m app.cli serve
# or
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

API endpoints:
- `POST /ai/cases/{case_id}/analyze` — start analysis (returns draft + thread_id)
- `POST /ai/cases/{case_id}/review` — submit review (approve/modify/reject)
- `POST /ai/cases/{case_id}/research` — web research
- `POST /ai/cases/{case_id}/feedback` — save feedback
- `GET /ai/cases/{case_id}/memory` — get case memory
- `GET /ai/cases/{case_id}/evidence` — get evidence
- `GET /ai/runs/{run_id}/trace` — get run trace

## Architecture

### Retrieval Pipeline

```
Question → RetrievalRouter (RetrievalPlan)
         → {Patient SQL | Dental RAG (pgvector) | Graph (Neo4j) | Web (Tavily) | Memory}
         → Evidence Fusion (dedup + rank)
         → Context Builder (role-specific)
         → Dental Crew (5 agents)
         → Case Synthesizer (14-section report)
         → Human Review (LangGraph interrupt)
         → Final Output → Feedback/Memory
```

### LangGraph Workflow

```
route → retrieve → clinical_analyst → evidence_specialist
      → research_specialist? → medication_specialist? → materials_specialist?
      → synthesize → human_review (interrupt) → finalize
```

The workflow uses `MemorySaver` for checkpointing. HITL is implemented via LangGraph's `interrupt()` — the graph pauses at `human_review`, and resumes with `Command(resume=review_dict)`.

### Agents

Each agent has:
- Role, mission, backstory, instructions (per spec Section 14)
- Input: role-specific context (patient data, evidence, etc.)
- Output: validated Pydantic schema (JSON via Groq)
- Tools: retrieval sources (SQL, semantic, web, graph, memory)

### Safety

- Decision-support only (no autonomous diagnosis/prescription)
- Prohibited-claim detection (regex patterns)
- Citation validation (evidence must have citations)
- Uncertainty disclosure (must include uncertainties/missing info)
- Dentist review required (must include questions_for_dentist)

## Testing

```bash
pytest tests/ -v
```

47 tests covering:
- Retrieval (structured, semantic, router, fusion, pipeline)
- Agents (mock LLM)
- Workflow (mock agents, HITL)
- Memory (store/retrieve)
- Graph (build/query)
- Safety (guardrails)
- CLI (parser)
- Web (Tavily)

## Project Structure

```
dental-ai/
├── app/
│   ├── agents/          # LLM factory, prompts, specialists
│   ├── api/             # FastAPI routes
│   ├── db/              # SQLAlchemy models, engine, seed
│   ├── graph/           # LangGraph workflow, knowledge graph
│   ├── memory/          # Case/doctor/feedback/instruction memory
│   ├── observability/   # Run/step tracer
│   ├── retrieval/       # Router, structured, semantic, web, fusion, context
│   ├── safety/          # Guardrails
│   ├── schemas/         # Pydantic models (retrieval, agents)
│   ├── cli.py           # CLI
│   ├── config.py        # Settings
│   ├── graph_state.py   # LangGraph state
│   └── main.py          # FastAPI app
├── data/
│   └── sample_knowledge/  # Dental guideline excerpts
├── notebooks/
│   └── Dental_AI_RAG.ipynb  # Self-contained RAG demo
├── scripts/
│   ├── build_notebook.py
│   ├── rag_demo.py
│   └── run_demo.py
├── tests/
└── artifacts/           # Generated reports
```

## Database

Default: SQLite (zero setup, no admin, no Docker).

For production: PostgreSQL + pgvector. Set `DATABASE_URL=postgresql+psycopg2://...` and `VECTOR_BACKEND=pgvector` in `.env`.

## Limitations

- **pgvector**: Not installed on Windows (no prebuilt binaries, no admin). Using numpy cosine fallback. Production: use Postgres + pgvector.
- **Neo4j**: Using local NetworkX adapter. Production: replace with Neo4j driver.
- **Embeddings**: Local sentence-transformers (all-MiniLM-L6-v2). Production: consider larger models or hosted embeddings.
- **LLM**: Groq (openai/gpt-oss-120b). Production: consider fine-tuning or multiple models.

## Deliverables

- ✅ Architecture diagrams (see docs/)
- ✅ RAG pipeline (structured + semantic + web + fusion)
- ✅ LangGraph workflow (10 nodes, HITL)
- ✅ Multi-agent crew (5 specialists + synthesizer)
- ✅ Memory (4 types)
- ✅ Knowledge graph (local adapter)
- ✅ Safety guardrails
- ✅ Observability (tracer)
- ✅ API (FastAPI)
- ✅ CLI
- ✅ Tests (47 passing)
- ✅ End-to-end demo (live LLM)
- ✅ Sample report (artifacts/sample_report.json)

## License

Internal project.
