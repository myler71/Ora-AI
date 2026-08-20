"""Generate a complete Jupyter notebook for the dental intelligence stack.

Includes: RAG retrieval, multi-agent crew, LangGraph workflow, HITL review.

Run:  python scripts/build_notebook.py
Output: notebooks/Dental_AI_RAG.ipynb
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "notebooks" / "Dental_AI_RAG.ipynb"

# ---------------------------------------------------------------------------
# Cell sources (self-contained, no imports from the app/ package)
# ---------------------------------------------------------------------------

C_SETUP = """# Dental Clinical Intelligence — Complete Demo
# RAG + Multi-Agent + LangGraph Workflow + HITL

import sys, subprocess, os, json
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
from pathlib import Path

def _need(pkg, import_name=None):
    name = import_name or pkg
    try:
        __import__(name)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

for p in ["langchain-text-splitters", "sentence-transformers", "numpy",
          "sqlalchemy", "tavily-python", "python-dotenv", "langgraph", "langchain-groq",
          "networkx", "fastapi", "uvicorn"]:
    _need(p)

import numpy as np
from sqlalchemy import (create_engine, String, Text, Integer, Float, Boolean,
                        DateTime, ForeignKey, select)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column,
                            relationship, Session, sessionmaker)
from langchain_text_splitters import RecursiveCharacterTextSplitter

print("imports ok")"""

C_CONFIG = """# Configuration

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dental_ai_nb.db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
SEMANTIC_TOP_K = 6

print("DB:", DATABASE_URL)
print("Groq key:", "set" if GROQ_API_KEY else "missing")
print("Tavily key:", "set" if TAVILY_API_KEY else "missing")"""

C_MODELS = """# Relational models

class Base(DeclarativeBase):
    pass

def _now():
    return datetime.now(timezone.utc)

class Patient(Base):
    __tablename__ = "patients"
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    dob: Mapped[str | None] = mapped_column(String(20))
    gender: Mapped[str | None] = mapped_column(String(20))
    medical_history: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    allergies: Mapped[list] = relationship(back_populates="patient", cascade="all, delete-orphan")
    medications: Mapped[list] = relationship(back_populates="patient", cascade="all, delete-orphan")
    teeth: Mapped[list] = relationship(back_populates="patient", cascade="all, delete-orphan")
    notes: Mapped[list] = relationship(back_populates="patient", cascade="all, delete-orphan")

class Allergy(Base):
    __tablename__ = "allergies"
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    allergen: Mapped[str] = mapped_column(String(200))
    severity: Mapped[str | None] = mapped_column(String(50))
    reaction: Mapped[str | None] = mapped_column(Text)
    patient: Mapped["Patient"] = relationship(back_populates="allergies")

class Medication(Base):
    __tablename__ = "medications"
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    dosage: Mapped[str | None] = mapped_column(String(100))
    frequency: Mapped[str | None] = mapped_column(String(100))
    indication: Mapped[str | None] = mapped_column(String(300))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    patient: Mapped["Patient"] = relationship(back_populates="medications")

class Tooth(Base):
    __tablename__ = "teeth"
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    tooth_number: Mapped[int] = mapped_column(Integer)
    quadrant: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50))
    notes: Mapped[str | None] = mapped_column(Text)
    patient: Mapped["Patient"] = relationship(back_populates="teeth")

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[str] = mapped_column(String(200), index=True)
    chunk_id: Mapped[str] = mapped_column(String(200))
    title: Mapped[str | None] = mapped_column(String(400))
    source: Mapped[str | None] = mapped_column(String(400))
    publication_date: Mapped[str | None] = mapped_column(String(50))
    specialty: Mapped[str | None] = mapped_column(String(200))
    topic: Mapped[str | None] = mapped_column(String(200))
    procedure: Mapped[str | None] = mapped_column(String(200))
    condition: Mapped[str | None] = mapped_column(String(200))
    drug: Mapped[str | None] = mapped_column(String(200))
    material: Mapped[str | None] = mapped_column(String(200))
    evidence_type: Mapped[str | None] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text)
    embedding_json: Mapped[str | None] = mapped_column(Text)

    def set_embedding(self, v):
        self.embedding_json = json.dumps(v)

    def get_embedding(self):
        return json.loads(self.embedding_json) if self.embedding_json else None

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
Base.metadata.create_all(engine)
print("tables ready")"""

C_EMBED = """# Local embeddings

from sentence_transformers import SentenceTransformer

_model = SentenceTransformer(EMBEDDING_MODEL)

def embed_texts(texts):
    if not texts:
        return []
    vecs = _model.encode(texts, batch_size=32, normalize_embeddings=True, show_progress_bar=False)
    return [v.tolist() for v in vecs]

def cosine(a, b):
    va, vb = np.asarray(a, dtype=np.float32), np.asarray(b, dtype=np.float32)
    d = float(np.linalg.norm(va) * np.linalg.norm(vb))
    return float(np.dot(va, vb) / d) if d else 0.0

print("embedding model:", EMBEDDING_MODEL)"""

C_DOCS = """# Dental knowledge base (inline)

DOCS = {
    "DENT-001": {
        "title": "Caries Management — Clinical Reference",
        "specialty": "Operative Dentistry", "topic": "caries",
        "condition": "caries", "evidence_type": "guideline",
        "text": "Dental caries is a biofilm-mediated, sugar-driven, multifactorial disease that causes demineralization of tooth structure. Early lesions can remineralize; cavitated lesions require operative intervention. Risk assessment precedes treatment planning. Low-risk patients may be managed with fluoride, sealants, and dietary counseling; high-risk patients need more frequent recall. Restorative decisions depend on lesion extent. For enamel-confined or just-beyond lesions, minimally invasive techniques such as resin infiltration or small composite restorations are appropriate. Deeper lesions with pulpal involvement require indirect restorations or endodontic referral.",
    },
    "DENT-002": {
        "title": "Endodontic Treatment of Irreversible Pulpitis",
        "specialty": "Endodontics", "topic": "pulpitis",
        "procedure": "root canal", "condition": "irreversible pulpitis",
        "evidence_type": "guideline",
        "text": "Irreversible pulpitis is characterized by spontaneous pain, lingering thermal sensitivity, and referred pain. When the pulp is irreversibly inflamed, accepted definitive treatment is pulpectomy or full root canal therapy. Diagnosis relies on history, thermal and percussion testing, and radiographs. Chemomechanical debridement followed by three-dimensional obturation is standard. Sodium hypochlorite is the primary irrigant; rubber dam isolation is mandatory. Postoperative pain is common and usually managed with analgesics.",
    },
    "DENT-003": {
        "title": "Periodontal Disease — Staging and Management",
        "specialty": "Periodontics", "topic": "periodontitis",
        "condition": "periodontitis", "evidence_type": "guideline",
        "text": "Periodontitis is a chronic inflammatory disease that destroys the supporting apparatus of the teeth, leading to attachment loss and, when untreated, tooth loss. Initial therapy is non-surgical: scaling and root planing with oral hygiene instruction and risk-factor control. Smoking and poorly controlled diabetes are major modifiable risk factors. Re-evaluation occurs four to six weeks later; residual probing depths of 5 mm or more with bleeding may require surgical therapy. Maintenance at individualized intervals is essential for stability.",
    },
    "DENT-004": {
        "title": "Restorative Materials — Composite vs Amalgam",
        "specialty": "Operative Dentistry", "topic": "restorative materials",
        "material": "composite", "evidence_type": "reference",
        "text": "Resin composite offers adhesion and aesthetics and permits conservative cavity design, but is technique-sensitive and requires moisture control. It is preferred for visible surfaces. Dental amalgam is durable and cost-effective in load-bearing posterior restorations but has declined for aesthetic and environmental reasons. Glass-ionomer cements release fluoride and bond chemically, useful as liners, bases, and for atraumatic restorative treatment. Material selection should account for lesion size, load, isolation, caries risk, and patient preference.",
    },
    "DENT-005": {
        "title": "Medication Considerations in Dental Care",
        "specialty": "Oral Medicine", "topic": "medication safety",
        "drug": "anticoagulant", "evidence_type": "reference",
        "text": "Anticoagulated patients require care coordination before surgical procedures. Most routine dental procedures do not require discontinuation of anticoagulation; invasive surgery may. Bisphosphonates and other antiresorptive agents are associated with a risk of medication-related osteonecrosis of the jaw (MRONJ), particularly after extractions. A thorough drug history is essential before dentoalveolar surgery. Antibiotic prophylaxis is reserved for specific high-risk cardiac and joint indications.",
    },
}

print("docs:", len(DOCS))"""

C_SEED = """# Seed: chunk + embed knowledge, insert demo patients

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=60)

def seed_knowledge(session):
    if session.query(KnowledgeChunk).count() > 0:
        return
    for doc_id, d in DOCS.items():
        texts = splitter.split_text(d["text"])
        embs = embed_texts(texts)
        for i, (txt, emb) in enumerate(zip(texts, embs)):
            c = KnowledgeChunk(
                document_id=doc_id, chunk_id=f"{doc_id}-{i:03d}",
                title=d["title"], source="internal",
                publication_date="2024", specialty=d.get("specialty"),
                topic=d.get("topic"), procedure=d.get("procedure"),
                condition=d.get("condition"), drug=d.get("drug"),
                material=d.get("material"), evidence_type=d.get("evidence_type"),
                content=txt,
            )
            c.set_embedding(emb)
            session.add(c)
    session.commit()

def add_patient(session, first, last, dob, gender, history, allergies, meds, teeth, notes):
    p = Patient(first_name=first, last_name=last, dob=dob, gender=gender,
                medical_history=json.dumps(history))
    session.add(p); session.flush()
    for allergen, sev, react in allergies:
        session.add(Allergy(patient_id=p.id, allergen=allergen, severity=sev, reaction=react))
    for name, dosage, freq, ind, active in meds:
        session.add(Medication(patient_id=p.id, name=name, dosage=dosage, frequency=freq, indication=ind, active=active))
    for number, quad, status, note in teeth:
        session.add(Tooth(patient_id=p.id, tooth_number=number, quadrant=quad, status=status, notes=note))
    for ntype, content in notes:
        session.add(Tooth(patient_id=p.id, tooth_number=0, quadrant=0, status="note", notes=f"{ntype}: {content}"))
    return p

def seed_patients(session):
    if session.query(Patient).count() > 0:
        return
    add_patient(
        session, "Sara", "Hassan", "1985-04-12", "female",
        ["type 2 diabetes (well controlled)", "hypertension"],
        [("Penicillin", "severe", "anaphylaxis"), ("Latex", "mild", "contact dermatitis")],
        [("Metformin", "850 mg", "twice daily", "type 2 diabetes", True),
         ("Lisinopril", "10 mg", "once daily", "hypertension", True)],
        [(16,1,"present",None),(17,1,"present",None),(27,2,"carious","occlusal caries"),
         (36,3,"restored","amalgam restoration 2021"),(47,4,"missing","extracted 2020")],
        [("clinical","Sensitivity to cold on lower right."),
         ("clinical","Existing amalgam on 36 intact; monitor.")],
    )
    add_patient(
        session, "Omar", "El-Sayed", "1972-09-30", "male",
        ["atrial fibrillation", "osteoporosis"],
        [("Sulfonamides", "moderate", "rash")],
        [("Apixaban", "5 mg", "twice daily", "atrial fibrillation", True),
         ("Alendronate", "70 mg", "weekly", "osteoporosis", True)],
        [(11,1,"present",None),(22,2,"carious","cervical caries"),(31,3,"present",None)],
        [("clinical","On apixaban and alendronate — consult before extractions. MRONJ risk noted.")],
    )
    session.commit()

session = SessionLocal()
seed_knowledge(session)
seed_patients(session)
print("knowledge chunks:", session.query(KnowledgeChunk).count())
print("patients:", session.query(Patient).count())"""

C_RETRIEVE = """# Retrieval: router, structured, semantic, web, fusion

@dataclass
class RetrievalPlan:
    patient_context: bool = False
    semantic_knowledge: bool = False
    web_research: bool = False
    medication_knowledge: bool = False
    rationale: str = ""

PATIENT_TERMS = ("patient","tooth","teeth","history","allerg","medication")
SEMANTIC_TERMS = ("literature","guideline","evidence","study","briefing","analyze","consideration")
WEB_TERMS = ("recent","latest","current","2024","2025","new research")
MED_TERMS = ("drug","medication","interaction","anticoagulant","bisphosphonate")

def route(question):
    q = question.lower(); p = RetrievalPlan(); reasons = []
    if any(t in q for t in PATIENT_TERMS): p.patient_context = True; reasons.append("patient")
    if any(t in q for t in SEMANTIC_TERMS): p.semantic_knowledge = True; reasons.append("evidence")
    if any(t in q for t in WEB_TERMS): p.web_research = True; reasons.append("recent")
    if any(t in q for t in MED_TERMS): p.medication_knowledge = True; reasons.append("medication")
    p.rationale = "; ".join(reasons) or "general"
    return p

def get_patient_context(session, patient_id):
    p = session.get(Patient, patient_id)
    if p is None:
        return None
    hist = json.loads(p.medical_history) if p.medical_history else []
    return {
        "demographics": {"first_name": p.first_name, "last_name": p.last_name, "dob": p.dob, "gender": p.gender},
        "medical_history": hist,
        "allergies": [{"allergen": a.allergen, "severity": a.severity} for a in session.query(Allergy).filter(Allergy.patient_id == patient_id)],
        "medications": [{"name": m.name, "dosage": m.dosage, "frequency": m.frequency} for m in session.query(Medication).filter(Medication.patient_id == patient_id)],
        "teeth": [{"tooth_number": t.tooth_number, "status": t.status} for t in session.query(Tooth).filter(Tooth.patient_id == patient_id)],
    }

@dataclass
class EvidenceItem:
    source_type: str
    source_id: str = None
    title: str = None
    content: str = ""
    relevance_score: float = None
    citation: str = None
    ranking: int = None

def search_knowledge(session, question, top_k=SEMANTIC_TOP_K):
    qvec = np.asarray(embed_texts([question])[0], dtype=np.float32)
    hits = []
    for c in session.query(KnowledgeChunk).all():
        emb = c.get_embedding()
        if emb is None:
            continue
        score = cosine(qvec, emb)
        hits.append((score, c))
    hits.sort(key=lambda x: x[0], reverse=True)
    out = []
    for i, (score, c) in enumerate(hits[:top_k]):
        out.append(EvidenceItem(
            source_type="semantic", source_id=c.chunk_id, title=c.title, content=c.content,
            relevance_score=round(score, 4), citation=f"{c.title} | {c.source}", ranking=i + 1))
    return out

def search_web(question, max_results=5):
    if not TAVILY_API_KEY:
        return []
    from tavily import TavilyClient
    client = TavilyClient(api_key=TAVILY_API_KEY)
    resp = client.search(query=question, search_depth="advanced", max_results=max_results)
    out = []
    for i, r in enumerate(resp.get("results", [])):
        out.append(EvidenceItem(
            source_type="web", source_id=r.get("url"), title=r.get("title"),
            content=r.get("content", ""), relevance_score=r.get("score"),
            citation=r.get("url"), ranking=i + 1))
    return out

def fuse(groups):
    seen, merged = set(), []
    for group in groups:
        for item in group:
            k = (item.source_type, item.source_id, item.title)
            if k in seen:
                continue
            seen.add(k); merged.append(item)
    merged.sort(key=lambda i: (i.relevance_score if i.relevance_score is not None else -1.0), reverse=True)
    for rank, item in enumerate(merged, 1):
        item.ranking = rank
    return merged

def retrieve(question, patient_id=None):
    plan = route(question)
    ctx = get_patient_context(session, patient_id) if (patient_id and plan.patient_context) else None
    groups = []
    if plan.semantic_knowledge:
        groups.append(search_knowledge(session, question))
    if plan.web_research:
        groups.append(search_web(question))
    return plan, ctx, fuse(groups)

print("retrieval ready")"""

C_AGENTS = """# Agents: LLM factory + specialist functions

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field
import re

_FENCE = re.compile(r"^```(?:json)?\\s*|\\s*```$", re.IGNORECASE)

def _llm(temperature=0.1, json_mode=True):
    kwargs = {}
    if json_mode:
        kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}
    return ChatGroq(
        model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
        api_key=GROQ_API_KEY,
        temperature=temperature,
        **kwargs,
    )

def _clean_json(text):
    text = text.strip()
    text = _FENCE.sub("", text).strip()
    return text

def generate_structured(system, human, schema, temperature=0.1):
    schema_json = json.dumps(schema.model_json_schema(), ensure_ascii=False)
    full_system = (
        system + "\\n\\nRespond with ONLY a valid JSON object (no prose, no markdown) that "
        + "conforms exactly to this JSON schema:\\n" + schema_json
    )
    llm = _llm(temperature=temperature, json_mode=True)
    resp = llm.invoke([SystemMessage(content=full_system), HumanMessage(content=human)])
    return schema.model_validate_json(_clean_json(resp.content))

# Agent output schemas
class ClinicalAnalysis(BaseModel):
    case_summary: str = ""
    documented_findings: list[str] = Field(default_factory=list)
    questions_for_dentist: list[str] = Field(default_factory=list)

class EvidenceAnalysis(BaseModel):
    evidence_summary: str = ""
    key_findings: list[str] = Field(default_factory=list)
    citations: list[str] = Field(default_factory=list)

class CaseReport(BaseModel):
    case_overview: str = ""
    documented_findings: list[str] = Field(default_factory=list)
    evidence_summary: list[str] = Field(default_factory=list)
    medication_considerations: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    questions_for_dentist: list[str] = Field(default_factory=list)
    draft_conclusion: str = ""

# Specialist functions
def clinical_analyst(question, context):
    return generate_structured(
        "You are a Senior Dental Clinical Case Analyst. Build a structured understanding of the case.",
        f"Question:\\n{question}\\n\\nContext:\\n{context}",
        ClinicalAnalysis,
    )

def evidence_specialist(question, context):
    return generate_structured(
        "You are a Dental Evidence Specialist. Find and synthesize relevant evidence.",
        f"Question:\\n{question}\\n\\nContext:\\n{context}",
        EvidenceAnalysis,
    )

def synthesize(question, specialist_outputs):
    return generate_structured(
        "You are a Senior Dental Case Intelligence Synthesizer. Combine specialist findings into a briefing.",
        f"Question:\\n{question}\\n\\nSpecialist findings:\\n{specialist_outputs}",
        CaseReport,
    )

print("agents ready")"""

C_WORKFLOW = """# LangGraph workflow (simplified for notebook)

from typing import TypedDict, Any

class ClinicalGraphState(TypedDict, total=False):
    question: str
    patient_id: int | None
    retrieval_plan: dict[str, Any]
    patient_context: dict[str, Any] | None
    evidence: list[dict[str, Any]]
    clinical_analysis: dict[str, Any]
    evidence_analysis: dict[str, Any]
    synthesized_report: dict[str, Any]
    human_review: dict[str, Any]
    final_output: dict[str, Any]

def route_node(state):
    plan = route(state["question"])
    return {"retrieval_plan": plan.__dict__}

def retrieve_node(state):
    plan_dict = state.get("retrieval_plan", {})
    plan = RetrievalPlan(**plan_dict)
    ctx = get_patient_context(session, state.get("patient_id")) if (state.get("patient_id") and plan.patient_context) else None
    groups = []
    if plan.semantic_knowledge:
        groups.append(search_knowledge(session, state["question"]))
    if plan.web_research:
        groups.append(search_web(state["question"]))
    evidence = fuse(groups)
    return {
        "patient_context": ctx,
        "evidence": [e.__dict__ for e in evidence],
    }

def clinical_analyst_node(state):
    ctx = state.get("patient_context") or {}
    evidence = state.get("evidence", [])
    context_str = f"Patient: {ctx.get('demographics', {})}\\nEvidence: {len(evidence)} items"
    out = clinical_analyst(state["question"], context_str)
    return {"clinical_analysis": out.model_dump()}

def evidence_specialist_node(state):
    evidence = state.get("evidence", [])
    context_str = f"Evidence items: {len(evidence)}"
    out = evidence_specialist(state["question"], context_str)
    return {"evidence_analysis": out.model_dump()}

def synthesize_node(state):
    specialist_outputs = f"Clinical Analysis: {state.get('clinical_analysis', {})}\\nEvidence Analysis: {state.get('evidence_analysis', {})}"
    report = synthesize(state["question"], specialist_outputs)
    return {"synthesized_report": report.model_dump()}

def human_review_node(state):
    # In a real workflow, this would call interrupt() and wait for review
    # For the notebook demo, we auto-approve
    return {"human_review": {"action": "approve", "note": "auto-approved for demo"}}

def finalize_node(state):
    review = state.get("human_review", {})
    report = state.get("synthesized_report", {})
    final = {
        "report": report,
        "review_action": review.get("action", "approve"),
        "disclaimer": "This output is decision-support material for a licensed dentist.",
    }
    return {"final_output": final}

# Build workflow (sequential for simplicity)
def run_workflow(question, patient_id=None):
    state = {"question": question, "patient_id": patient_id}
    state.update(route_node(state))
    state.update(retrieve_node(state))
    state.update(clinical_analyst_node(state))
    state.update(evidence_specialist_node(state))
    state.update(synthesize_node(state))
    state.update(human_review_node(state))
    state.update(finalize_node(state))
    return state

print("workflow ready")"""

C_DEMO = """# End-to-end demo

QUESTION = "Clinical briefing for this patient: medication considerations and caries evidence"
PATIENT_ID = 1

print("Running full workflow...")
result = run_workflow(QUESTION, patient_id=PATIENT_ID)

print("\\n===== FINAL REPORT =====")
report = result.get("final_output", {}).get("report", {})
for key in ["case_overview", "documented_findings", "evidence_summary", "medication_considerations", "uncertainties", "questions_for_dentist", "draft_conclusion"]:
    val = report.get(key)
    if not val:
        continue
    print(f"\\n## {key.replace('_', ' ').title()}")
    if isinstance(val, list):
        for item in val:
            print(f"  - {item}")
    else:
        print(f"  {val}")

print(f"\\n===== REVIEW =====")
print(f"Action: {result.get('final_output', {}).get('review_action')}")
print(f"Disclaimer: {result.get('final_output', {}).get('disclaimer')}")"""

MD_TITLE = """# Dental Clinical Intelligence — Complete Demo

Single self-contained notebook for the full AI stack:

- **Structured retrieval** (patient SQL: history, allergies, medications, odontogram)
- **Semantic retrieval** (vector search over dental knowledge base)
- **Web research** (Tavily) when fresh/external evidence is needed
- **Multi-agent crew** (clinical analyst, evidence specialist, synthesizer)
- **LangGraph workflow** with human-in-the-loop review

Runs fully local (SQLite + local sentence-transformers embeddings). No Docker, no pgvector extension, no admin."""

MD_NOTES = """## Notes

- Set `GROQ_API_KEY` / `TAVILY_API_KEY` in a `.env` next to this notebook or in the environment.
- Embedding model downloads once (~90 MB) and is cached.
- Production: swap `DATABASE_URL` to Postgres and enable pgvector for scale.
- This notebook demonstrates the full pipeline; for production, use the `app/` package with proper LangGraph checkpointing and HITL interrupt."""

# ---------------------------------------------------------------------------


def cell(mtype: str, source: str) -> dict:
    return {
        "cell_type": mtype,
        "metadata": {},
        "source": source.splitlines(keepends=True),
        "outputs": [],
        "execution_count": None,
    }


cells = [
    cell("markdown", MD_TITLE),
    cell("code", C_SETUP),
    cell("code", C_CONFIG),
    cell("code", C_MODELS),
    cell("code", C_EMBED),
    cell("code", C_DOCS),
    cell("code", C_SEED),
    cell("code", C_RETRIEVE),
    cell("code", C_AGENTS),
    cell("code", C_WORKFLOW),
    cell("code", C_DEMO),
    cell("markdown", MD_NOTES),
]

notebook = {
    "nbformat": 4,
    "nbformat_minor": 5,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "version": "3.11"},
    },
    "cells": cells,
}


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(notebook, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
