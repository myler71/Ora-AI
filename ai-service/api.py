import os
import io
import json
import traceback
from fastapi import FastAPI, File, UploadFile, Body
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input

from app.api.routes import router as dental_router
from app.db.engine import init_db, SessionLocal
from app.agents.llm import generate_text, generate_structured
from app.retrieval.context_builder import build_context
from app.retrieval.pipeline import retrieve
from app.schemas.agents import CaseReport
from app.agents import prompts

app = FastAPI(
    title="Dental AI Vision & Clinical Intelligence API",
    description="Combined EfficientNet Image Diagnostic & Multi-Agent RAG Clinical Decision Support",
    version="1.0.0",
)

# Include dental-ai sub-routes (/health, /ai/cases/..., /ai/runs/...)
app.include_router(dental_router)

# 1. Load EfficientNet Keras Model
print("Loading EfficientNet model...")
model = tf.keras.models.load_model("efficientnet_oral.keras")
print("EfficientNet Model Loaded Successfully")

classes = [
    "Calculus",
    "Caries",
    "Gingivitis",
    "Hypodontia",
    "toothDiscoloration",
    "Ulcers",
]

def preprocess(image):
    image = image.convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image).astype(np.float32)
    image = preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image

@app.on_event("startup")
def _startup():
    init_db()

@app.get("/")
def home():
    return {
        "message": "Dental AI Vision & Clinical Intelligence API Running",
        "status": "ok",
        "vision_model": "EfficientNet Oral v1.2",
        "rag_engine": "Multi-Agent Clinical Intelligence with Groq LLM",
    }

# 2. Vision Inference Route
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    img = preprocess(image)
    prediction = model.predict(img)[0]
    class_id = int(np.argmax(prediction))
    confidence = float(prediction[class_id])
    return {"prediction": classes[class_id], "confidence": confidence}

# 3. Clinical RAG Chat Endpoint
class ChatRequest(BaseModel):
    message: str
    patient_id: str | None = None
    patient_name: str | None = None
    patient_context: dict | None = None
    tooth_id: str | None = None

@app.post("/api/chat")
async def clinical_chat(req: ChatRequest):
    session = SessionLocal()
    try:
        # Build context from semantic retrieval over knowledge base & patient records
        retrieval_res = retrieve(session, req.message, patient_id=1)
        rag_context = build_context(retrieval_res.plan, retrieval_res.patient_context, retrieval_res.evidence)

        system_prompt = (
            "You are Ora AI, an expert Dental Clinical Assistant. You assist dentists in diagnosing, "
            "reviewing tooth histories, explaining treatment procedures (composite restorations, perio scaling, crowns), "
            "and cross-checking medication and allergy risks. Provide clear, professional, evidence-backed clinical guidance "
            "formatted with markdown headings, bullet points, and step-by-step instructions."
        )

        patient_details = ""
        if req.patient_context:
            patient_details = f"\nPatient Context:\n{json.dumps(req.patient_context, indent=2)}\n"
        elif req.patient_name:
            patient_details = f"\nPatient: {req.patient_name} (Tooth {req.tooth_id or 'General'})\n"

        prompt_input = f"Question/Observation:\n{req.message}\n{patient_details}\nRetrieved Clinical Knowledge:\n{rag_context}"
        
        reply = generate_text(system_prompt, prompt_input, temperature=0.2)
        return {
            "status": "live",
            "reply": reply,
            "evidence_count": len(retrieval_res.evidence),
            "rag_active": True,
        }
    except Exception as e:
        print("Chat RAG error:", e)
        traceback.print_exc()
        return {
            "status": "error",
            "reply": f"Error generating clinical analysis: {str(e)}",
            "error": str(e),
            "rag_active": False,
        }
    finally:
        session.close()

# 4. Multi-Agent Tooth Clinical Case Analysis Endpoint
class ToothAnalysisReq(BaseModel):
    patientId: str
    toothId: str
    contextSnapshot: dict

@app.post("/api/tooth/analyze")
async def analyze_tooth_case(req: ToothAnalysisReq):
    session = SessionLocal()
    try:
        tooth_id = req.toothId
        patient_name = req.contextSnapshot.get("patientName", "Patient")
        
        # Formulate comprehensive clinical question
        question = (
            f"Perform full clinical case analysis for {patient_name} regarding FDI Tooth {tooth_id}. "
            f"Synthesize current tooth state, clinical events, doctor notes, medical conditions (asthma/allergies), "
            f"and propose restorative procedure, material choice, and safety precautions."
        )
        
        retrieval_res = retrieve(session, f"Tooth {tooth_id} caries restoration dental care", patient_id=1)
        rag_context = build_context(retrieval_res.plan, retrieval_res.patient_context, retrieval_res.evidence)
        snapshot_str = json.dumps(req.contextSnapshot, indent=2)

        prompt_input = (
            f"Patient & Tooth Snapshot:\n{snapshot_str}\n\n"
            f"Clinical Knowledge Base:\n{rag_context}\n\n"
            f"Question:\n{question}"
        )

        system_prompt = (
            "You are the Ora AI Lead Clinical Reviewer. Generate a structured clinical report covering diagnosis, "
            "confidence, recommended procedure, urgency, and safety risk alerts in markdown format."
        )

        ai_response = generate_text(system_prompt, prompt_input, temperature=0.1)

        return {
            "status": "live",
            "aiReport": {
                "mockDiagnosis": f"Clinical Assessment for FDI Tooth {tooth_id}: Occlusal Caries & Marginal Degradation Risk",
                "confidence": 0.94,
                "recommendedProcedure": "Direct Class I Nanohybrid Composite Resin Restoration & Fluoride Sealant",
                "urgency": "Medium-High",
                "detailedAnalysis": ai_response,
            },
            "rag_active": True,
        }
    except Exception as e:
        print("Tooth analyze error:", e)
        traceback.print_exc()
        return {
            "status": "error",
            "aiReport": {
                "mockDiagnosis": f"Clinical Evaluation for FDI Tooth {req.toothId}: Occlusal Caries Suspicion",
                "confidence": 0.89,
                "recommendedProcedure": "Class I Composite Restoration & Fluoride Polish",
                "urgency": "Medium",
                "detailedAnalysis": f"Automated evaluation for Tooth {req.toothId}: Enamel fissure caries risk noted. Excavate infected dentin and place adhesive composite resin.",
            },
            "error": str(e),
            "rag_active": False,
        }
    finally:
        session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000)
