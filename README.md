<div align="center">

# 🦷 Ora AI — Clinical Dental Workspace & Diagnostic Intelligence System

### *Next-Generation Computer Vision, Multi-Agent Clinical RAG & Interactive Dental Electronic Health Records (EHR)*

[![GitHub Repo](https://img.shields.io/badge/GitHub-myler71%2FOra--AI-181717?style=for-the-badge&logo=github)](https://github.com/myler71/Ora-AI)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![React 18](https://img.shields.io/badge/React%2018-Vite%206-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-Modern-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express 5](https://img.shields.io/badge/Express.js_5-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras_CNN-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Groq LangGraph](https://img.shields.io/badge/Groq-LangGraph_Multi--Agent-F55036?style=for-the-badge)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-key-features"><b>Explore Features</b></a> •
  <a href="#-system-architecture"><b>Architecture</b></a> •
  <a href="#-quickstart-guide"><b>Quickstart</b></a> •
  <a href="#-vercel-production-deployment"><b>Vercel Deployment</b></a> •
  <a href="#-api-reference"><b>API Docs</b></a> •
  <a href="#-author--academic-credentials"><b>Academic Credits</b></a>
</p>

---

</div>

## 📖 Executive Summary

**Ora AI** is an enterprise-grade, full-stack clinical dental platform designed to bridge diagnostic computer vision, agentic artificial intelligence, and electronic dental health records.

By combining a fine-tuned **EfficientNet CNN** computer vision classifier with a **LangGraph multi-agent RAG engine** powered by Groq-accelerated LLMs, an interactive **FDI Anatomical Odontogram**, and a **10-patient pre-seeded EHR workspace**, Ora AI empowers clinicians and patients with automated diagnostics, treatment planning, and real-time clinical reasoning.

---

## 🌟 Key Features

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ORA AI FEATURE MATRIX                                  │
├──────────────────────────────┬──────────────────────────────┬────────────────────────────┤
│ 👁️ Vision Diagnostic Engine  │ 🩺 Clinical EHR Workspace    │ 🤖 Multi-Agent RAG Engine  │
│  • EfficientNet CNN Model    │  • 10 Rich Patient Profiles  │  • Groq Llama-3.3/GPT-OSS  │
│  • 6 Oral Pathologies        │  • 11 Workspace Modules      │  • LangGraph State Machine │
│  • Real-time Confidence      │  • 8-Metric Command Center   │  • FDI Tooth 36 Deep Agent │
├──────────────────────────────┼──────────────────────────────┼────────────────────────────┤
│ 🦷 FDI Vector Odontogram     │ 🗺️ Clinic & Dentist Map      │ 📅 Smart Scheduling        │
│  • Anatomical Teeth 11–48    │  • Google Maps Integration   │  • Day / Agenda Timelines  │
│  • Gold Crown & Fillings     │  • Geolocation & Direction   │  • Status Quick-Toggles    │
│  • Tooth Case Analysis       │  • Clinic Directory Search   │  • Appointment State Sync  │
└──────────────────────────────┴──────────────────────────────┴────────────────────────────┘
```

### 1. 👁️ Automated Dental Vision Classifier
- **Deep Learning Model:** Fine-tuned **EfficientNet CNN** (`efficientnet_oral.keras`, 28.5 MB) with RGB 224×224 image preprocessing.
- **6 Detectable Conditions:**
  1. 🪨 **Calculus** — Supragingival & subgingival tartar formation.
  2. 🕳️ **Caries** — Dental enamel & dentin decay.
  3. 🩸 **Gingivitis** — Periodontal inflammation and bleeding.
  4. 🦷 **Hypodontia** — Congenitally missing dentition.
  5. 🎨 **Tooth Discoloration** — Extrinsic and intrinsic staining.
  6. 🩹 **Mouth Ulcers** — Aphthous ulcers and mucosal lesions.
- Instant classification with percentage confidence breakdown and recommended clinical pathways.

### 2. 🦷 Anatomical FDI Odontogram (Teeth 11–48)
- Scalable SVG vector representation of adult human dentition (quadrants 1 to 4 in FDI notation).
- **Pathology & Restoration Visualizer:** Gold crowns, amalgam/composite black dot restorations, caries markers, and missing tooth indicators.
- **Tooth-Specific Case Analyzer:** Direct integration with LangGraph agent for deep tooth-level case reasoning (e.g., Tooth 36 restorative prognosis).

### 3. 🩺 Complete Clinical Workspace & Patient Records
- **10 Rich Pre-Seeded Patients** (`npm run seed:clinical`) covering diverse clinical demographics and dental histories.
- **11 Integrated Workspace Modules:**
  - 📋 *Patient Summary & Demographics*
  - ⏱️ *Clinical Timeline & Encounters*
  - 📉 *Periodontal Pocket Depth Charting*
  - 📷 *Radiograph & Intraoral Photo Vault*
  - 📝 *Treatment Plans & Phased Interventions*
  - 🔬 *Laboratory Orders & CAD/CAM Fabrication*
  - 💊 *Prescription & Medication Manager*
  - ✍️ *Doctor Clinical Notes & SOAP Records*
  - 💳 *Billing, Insurance & Invoice Ledger*
  - 💬 *Case Discussion & AI Consultations*
  - 📜 *Audit Logs & Medical History*

### 4. 🤖 Multi-Agent Dental AI RAG Engine
- **LLM Engine:** Ultra-low latency inference via **Groq** (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`).
- **LangGraph Multi-Agent Architecture:**
  - **Supervisor Agent:** Orchestrates query decomposition and specialist routing.
  - **Clinical Specialist:** Synthesizes evidence-based dental care guidelines.
  - **Comparator Agent:** Evaluates patient history against scientific literature.
  - **Tavily Research Tool:** Web search tool for latest peer-reviewed dental literature.
- **Vector Retrieval:** Semantic search with `all-MiniLM-L6-v2` embeddings over dental clinical reference knowledge.

### 5. 🗺️ Integrated Dentist & Clinic Locator
- Embedded **Google Maps JavaScript API** with custom dental clinic markers, user geolocation, address search, and instant routing directions.

### 6. 📅 Interactive Scheduling & Calendar
- Day, week, and agenda calendar views with real-time status management (Scheduled, In-Progress, Completed, Cancelled).

---

## 🏗️ System Architecture

Ora AI is architected as a **3-tier monorepo**:

```
                               ┌────────────────────────────────────────────────┐
                               │              VERCEL EDGE NETWORK               │
                               │                                                │
                               │   ┌────────────────────────────────────────┐   │
                               │   │         Ora AI Frontend (SPA)          │   │
                               │   │      React 18 + Vite 6 + Tailwind 4     │   │
                               │   │          https://ora-ai.vercel.app     │   │
                               │   └───────────────────┬────────────────────┘   │
                               │                       │                        │
                               │         Rewrites / API Proxy (/api/*)          │
                               │                       │                        │
                               │   ┌───────────────────▼────────────────────┐   │
                               │   │        Ora AI Backend API              │   │
                               │   │     Vercel Serverless Function         │   │
                               │   │     Express 5 + Mongoose + JWT         │   │
                               │   └───────┬────────────────────────┬───────┘   │
                               └───────────┼────────────────────────┼───────────┘
                                           │                        │
                           MongoDB Driver  │                        │ HTTP Proxy / Axios
                                           ▼                        ▼
                ┌──────────────────────────────┐        ┌──────────────────────────────┐
                │     MongoDB Atlas Cluster    │        │      AI Microservice         │
                │     (M0 Free / M10 Cloud)    │        │   FastAPI + EfficientNet     │
                │   Patients, Users, History   │        │   Groq LLM + LangGraph RAG   │
                │   mongodb+srv://...          │        │  (Render / HF / Cloud Run)   │
                └──────────────────────────────┘        └──────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                        ┌──────────────────────────────┐
                                                        │      External AI APIs        │
                                                        │   - Groq API (LLM Engine)    │
                                                        │   - Tavily API (Search)      │
                                                        │   - Google Maps API (Locate) │
                                                        └──────────────────────────────┘
```

---

## 📂 Repository Structure

```tree
Ora-AI/
├── front/                          # Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/         # UI Primitives (shadcn/ui, Radix, Lucide)
│   │   │   ├── pages/              # AITool, PatientWorkspace, Odontogram, Calendar
│   │   │   ├── queries/            # TanStack Query server-state hooks
│   │   │   └── services/           # Axios API services
│   │   ├── styles/                 # Tailwind CSS 4 & custom themes
│   │   └── main.tsx                # React application entrypoint
│   ├── vercel.json                 # Vercel SPA routing fallback & security headers
│   ├── vite.config.ts              # Vite 6 configuration & path aliases
│   └── package.json
│
├── back/                           # Clinical REST API Backend
│   ├── src/
│   │   ├── controllers/            # Auth, Clinical, AI, Chat, Predict controllers
│   │   ├── models/                 # Patient, ClinicalEvent, AIReport, User schemas
│   │   ├── routes/                 # Protected API endpoints
│   │   ├── middlewares/            # JWT auth, Multer file upload, error handlers
│   │   ├── config/                 # Mongoose connection with serverless pooling
│   │   └── seed/                   # 10-patient idempotent clinical database seeder
│   ├── api/index.js                # Vercel Serverless Function entrypoint
│   ├── vercel.json                 # Vercel Serverless routing configuration
│   ├── Dockerfile                  # Container build for standalone hosting
│   └── package.json
│
├── ai-service/                     # Python AI & Machine Learning Microservice
│   ├── app/
│   │   ├── agents/                 # Multi-agent LangGraph workflow & prompts
│   │   ├── retrieval/              # Vector embeddings, RAG fusion, web research
│   │   ├── db/                     # SQLite / PostgreSQL session persistence
│   │   └── schemas/                # Pydantic data contracts
│   ├── data/sample_knowledge/      # Dental clinical guidelines corpus
│   ├── efficientnet_oral.keras     # Fine-tuned EfficientNet vision classifier
│   ├── api.py                      # FastAPI application entrypoint
│   ├── requirements.txt            # Python ML runtime dependencies
│   └── Dockerfile                  # Containerized deployment for Render / HF Spaces
│
├── docs/                           # Technical Analysis & Clinical Reports
│   └── TECHNICAL_ANALYSIS_REPORT.md# Full architecture & code audit report
├── .github/workflows/              # GitHub Actions CI/CD Pipeline
│   └── ci.yml                      # Automated build, test, and typecheck
├── DEPLOYMENT.md                   # Complete Vercel Production Runbook
├── docker-compose.yml              # Local multi-service orchestration
└── vercel.json                     # Root monorepo deployment configuration
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Highlights |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18.3** + **TypeScript** | Functional components, strict mode, custom hooks |
| **Build & Tooling** | **Vite 6.3** + **PNPM/NPM** | Sub-second HMR, optimized tree-shaken production bundles |
| **Design System** | **Tailwind CSS 4.1** + **shadcn/ui** | Radix UI accessible primitives, Framer Motion animations |
| **State & Queries** | **TanStack Query 5.97** | Server cache synchronization, optimistic mutations |
| **Backend Framework**| **Express.js 5.2** (Node.js) | MVC structure, CommonJS, RESTful routing |
| **Database & ODM** | **MongoDB** + **Mongoose 9.4** | Connection pooling for serverless execution, soft deletes |
| **Authentication** | **JWT** + **bcryptjs** | 7-day access tokens, purpose-scoped reset tokens |
| **File Processing** | **Multer 2.0** | Multipart image uploads with MIME validation |
| **AI Microservice** | **FastAPI** + **Uvicorn** (Python 3.11)| Asynchronous endpoints, Pydantic validation |
| **Computer Vision** | **TensorFlow 2.15** / **Keras** | EfficientNet CNN transfer learning classifier |
| **LLM & Multi-Agent**| **Groq SDK** + **LangGraph 1.0** | Graph state workflows, multi-agent supervisor pattern |
| **Information Retrieval**| **Sentence-Transformers** + **NumPy**| In-memory cosine similarity RAG pipeline |
| **Cloud Hosting** | **Vercel** + **MongoDB Atlas** | Edge CDN, Serverless Functions, global availability |

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js:** v18.0+ or v20.0+
- **Python:** v3.10 or v3.11
- **MongoDB:** Local instance (`mongodb://localhost:27017`) or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### Option 1: One-Command Start with Docker Compose
```bash
# Clone repository
git clone https://github.com/myler71/Ora-AI.git
cd Ora-AI

# Spin up MongoDB, AI Microservice, Backend API, and Frontend SPA
docker-compose up --build
```
- **Frontend SPA:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:5000`
- **AI Microservice:** `http://localhost:8000`

---

### Option 2: Manual Local Setup

#### 1. Setup Environment Variables
```bash
# Frontend
cp front/.env.example front/.env

# Backend
cp back/.env.example back/.env

# AI Service
cp ai-service/.env.example ai-service/.env
```

#### 2. Start Backend & Seed Database
```bash
cd back
npm install
npm run seed:clinical   # Seeds 10 rich clinical patient records
npm run dev             # Starts Express server on port 5000
```

#### 3. Start AI Microservice
```bash
cd ../ai-service
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

#### 4. Start Frontend
```bash
cd ../front
npm install
npm run dev             # Starts Vite development server on port 5173
```

---

## 🚀 Vercel Production Deployment

Ora AI is natively engineered for **Vercel** deployment with dedicated `vercel.json` configurations.

👉 **Read the comprehensive deployment runbook in [DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Deployment Steps:

1. **Deploy Frontend to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new) → Import `myler71/Ora-AI`.
   - Set **Root Directory** to `front`.
   - Framework Preset: `Vite`.
   - Add environment variables:
     - `VITE_API_BASE_URL`: `https://your-backend-api.vercel.app`
     - `VITE_GOOGLE_MAPS_API_KEY`: `AIzaSy...`
   - Click **Deploy**.

2. **Deploy Backend API to Vercel (Serverless):**
   - Import `myler71/Ora-AI` as a second project.
   - Set **Root Directory** to `back`.
   - Add environment variables:
     - `MONGO_URI`: `mongodb+srv://admin:...@cluster0.mongodb.net/ai-ora?retryWrites=true&w=majority`
     - `JWT_SECRET`: `<secure-256-bit-key>`
     - `PREDICT_SERVICE_URL`: `<url-of-ai-service>`
     - `CORS_ORIGIN`: `https://your-frontend.vercel.app`
   - Click **Deploy**.

3. **Deploy AI Microservice:**
   - Connect repository to **[Render.com](https://render.com)** or **[Hugging Face Spaces](https://huggingface.co/spaces)** (Docker SDK).
   - Set Root Directory to `ai-service`.
   - Supply `GROQ_API_KEY` and `TAVILY_API_KEY`.
   - Paste the generated URL into the backend's `PREDICT_SERVICE_URL`.

---

## 📡 API Reference

### Authentication & Users (`/api/auth`, `/api/users`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new doctor / patient user account |
| `POST` | `/api/auth/signin` | Public | Authenticate user & return 7-day JWT token |
| `POST` | `/api/auth/forgot-password` | Public | Generate 6-digit verification OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP & return password-reset JWT |
| `POST` | `/api/auth/reset-password` | Public | Update password using reset token |
| `GET` | `/api/users/me` | Bearer JWT | Fetch authenticated user profile |
| `PATCH`| `/api/users/me` | Bearer JWT | Update user profile information |

### Clinical Records & Patients (`/api/clinical`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/clinical/patients` | Bearer JWT | List all patients with search & filtering |
| `GET` | `/api/clinical/patients/:id` | Bearer JWT | Fetch full patient EHR (Odontogram, Timeline, Perio) |
| `POST`| `/api/clinical/patients` | Bearer JWT | Create new clinical patient record |
| `POST`| `/api/clinical/events` | Bearer JWT | Add encounter event to patient timeline |
| `GET` | `/api/clinical/appointments` | Bearer JWT | Fetch clinical appointments for calendar |
| `PATCH`| `/api/clinical/appointments/:id` | Bearer JWT | Update appointment status (Completed, Cancelled) |

### AI Diagnostic & RAG Endpoints (`/api/predict`, `/api/ai`)
| Method | Endpoint | Handler | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/predict/image` | Backend → FastAPI | Upload intraoral image for EfficientNet classification |
| `GET` | `/api/predict/history` | Backend | Retrieve user's historical AI diagnostic reports |
| `POST` | `/api/chat` | FastAPI | Multi-agent RAG clinical conversation with patient binding |
| `POST` | `/api/tooth/analyze` | FastAPI | Multi-agent FDI deep case analysis for specific tooth ID |

---

## 🔒 Security Hardening

- 🛡️ **Password Encryption:** Salted bcrypt hashing (10 rounds).
- 🔑 **Cryptographic JWT:** Signed access tokens with expiry and purpose claims.
- 🌐 **CORS Protection:** Configurable whitelist origins for production domains.
- 📦 **Mongoose Connection Pooling:** Serverless-safe connection reuse to prevent socket leaks.
- 🛡️ **Vercel Security Headers:** Pre-configured `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `X-XSS-Protection`.

---

## 📚 Documentation & Research Reports

- 📄 **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** — Production Vercel Deployment Plan & Runbook
- 📄 **[`docs/TECHNICAL_ANALYSIS_REPORT.md`](./docs/TECHNICAL_ANALYSIS_REPORT.md)** — Comprehensive Code Audit & Architecture Review
- 📄 **[`TECHNICAL_REPORT.md`](./TECHNICAL_REPORT.md)** — Clinical Intelligence Architecture & FDI Model Specifications
- 📄 **[`INVESTOR_EXECUTIVE_PITCH.md`](./INVESTOR_EXECUTIVE_PITCH.md)** — Business Value Proposition & Market Fit
- 📄 **[`PROGRESS.md`](./PROGRESS.md)** — Engineering Milestone & Verification Ledger

---

## 👨‍💻 Author & Academic Credentials

- **Project Lead & Author:** Marwan Ammar ([@myler71](https://github.com/myler71))
- **Project:** Ora AI — Dental Health Analysis & Clinical EHR System
- **Repository:** [https://github.com/myler71/Ora-AI.git](https://github.com/myler71/Ora-AI.git)
- **License:** [MIT License](LICENSE)

<div align="center">
  <sub>Built with ❤️ for clinical precision, intelligent diagnostics, and seamless dentistry.</sub>
</div>
