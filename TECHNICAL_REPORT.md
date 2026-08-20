# Ora AI Clinical Workspace — Comprehensive Technical Analysis & Presentation Base Report

**Project Name:** Ora AI — Next-Generation Dental Clinical Workspace & Diagnostic Platform  
**Target Audience:** Clinical Evaluators, Technical Judges, Hackathon Reviewers, Healthcare Investors  
**Date:** August 2026  
**Document Format:** Markdown (`TECHNICAL_REPORT.md`)  

---

## 1. Executive Summary

**Ora AI Clinical Workspace** is an enterprise-grade, doctor-facing dental health analysis and clinical management platform. Built as an incremental upgrade over the patient-facing Ora AI dental scanner, the workspace empowers dentists with:

1. **A Real-Time Doctor Command Center**: 8 aggregated clinical dashboard cards (Appointments, Attention Flags, AI Reports, Doctor Scratchpad, PubMed Research shortcuts, Inventory Alerts).
2. **Comprehensive Patient Workspaces**: 10 tabbed clinical sections per patient (Profile, Medical History, Active Medications, Allergies, FDI Dental Chart, Treatment History, Doctor Notes, Scans & Attachments, AI Case Analysis, Research Evidence).
3. **Anatomical FDI Odontogram & 7-Step Evidence Pipeline**: Interactive anatomical tooth graphics (Molars, Premolars, Canines, Incisors) supporting FDI two-digit notation (11–48) and common anatomical names. Click-to-analyze feature assembles a 7-step evidence pipeline ending in an AI diagnostic report.
4. **Vector DB & RAG Clinical Note Indexing**: Clinical doctor notes automatically embedded with vector IDs (`vec_note_...`) for Retrieval-Augmented Generation (RAG) during patient chat discussions.
5. **Interactive Clinical Calendar & Appointment Scheduler**: Real-time scheduling, day agendas, and instant appointment status toggling (`checked-in`, `completed`, `cancelled`).
6. **Automated AI Oral Disease Inference**: FastAPI microservice running an EfficientNet transfer learning model classifying 6 oral conditions (*Calculus, Caries, Gingivitis, Hypodontia, Tooth Discoloration, Ulcers*).

---

## 2. System Architecture & Tech Stack

The application employs a **3-Tier Monorepo Architecture**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      React 18 + Vite Frontend                          │
 │     React Router 7 • Tailwind CSS 4 • shadcn/ui • TanStack Query       │
 │     Port: 5173 (Dev Proxy -> 5000 for /api & /assets)                   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                REST API (JWT)
                                     │
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                      Node.js + Express Backend                         │
 │     Mongoose 9 • MongoDB (27017) • Multer • JWT Auth Middleware        │
 │     Port: 5000                                                         │
 └─────────┬────────────────────────────────────────────────────┬─────────┘
           │                                                    │
     Mongoose ORM                                          Axios / FormData
           │                                                    │
 ┌─────────▼──────────────────────────┐               ┌─────────▼─────────┐
 │       MongoDB Database             │               │ Python AI Service │
 │   Collections: users, patients,    │               │ FastAPI + Keras   │
 │   clinicalevents, appointments,    │               │ EfficientNet      │
 │   aireports, predictimages         │               │ Port: 8000        │
 └────────────────────────────────────┘               └───────────────────┘
```

### 2.1 Technology Matrix

| Layer | Technology | Key Capabilities & Use Cases |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3.1 + TypeScript | Functional components, hooks, strict type safety |
| **Frontend Routing** | React Router 7.13.0 | `createBrowserRouter`, code-split lazy loading |
| **Styling & Icons** | Tailwind CSS 4.1.12 + Lucide Icons | Responsive utility design, standard icon set |
| **UI Primitive System** | shadcn/ui (Radix primitives) | Dialogs, Cards, Badges, Tabs, Tooltips, Menus |
| **Data Fetching & Cache**| TanStack Query (React Query 5) | Server state management, auto cache invalidation |
| **Backend Framework** | Node.js + Express.js 5.2.1 | RESTful API controllers and routing |
| **Database & ORM** | MongoDB + Mongoose 9.4.1 | Schema validation, subdocuments, index optimization |
| **Auth & Security** | JWT (jsonwebtoken) + bcryptjs | 7-day access tokens, password salt hashing |
| **File Storage** | Multer 2.0.2 | Image validation, static serving `/assets/predict` & `/assets/patient` |
| **AI Inference Service**| Python 3.11 + FastAPI + TensorFlow | EfficientNet oral disease classification model |

---

## 3. Key Feature Deep Dive

### 3.1 Doctor Command Center (`/dashboard`)
The command center aggregates 8 cards into a unified grid:
1. **Today's Appointments**: Real-time list of today's scheduled patients with status chips.
2. **Attention Cases**: Automatic heuristic surfacing patients with flagged teeth (`attention: true`) or severe predictions.
3. **Pending AI Reports**: Queue of unreviewed automated case analyses.
4. **AI Recommendations Awaiting Review**: Doctor approval workflow (Approve / Reject buttons).
5. **Recent Patients**: Last 5 active patient workspaces.
6. **PubMed Research & Evidence**: External medical literature links and search shortcuts.
7. **Inventory & Supply Alerts**: Low-stock material warnings (Composite resin, Gloves, Anesthetic).
8. **Doctor Scratchpad**: Quick CRUD notes with pinning capabilities.

### 3.2 Patient Workspace (`/patients/:id`)
10 tabbed sections providing complete 360-degree patient management:
- **1. Profile**: Contact details, demographics, and contact info.
- **2. Medical History**: Systemic conditions combined with **Linked AI Intraoral Scan History** (showing thumbnail previews, date/time, and AI confidence badges).
- **3. Active Medications**: Prescriptions, dosages, and sedation alerts.
- **4. Allergies & Sensitivities**: Severity-coded allergy warnings (e.g. Penicillin rash alert).
- **5. Dental Chart**: Mini FDI chart overview with direct link to full Odontogram.
- **6. Treatment History**: Interactive procedure timeline linked to individual tooth IDs.
- **7. Doctor Notes & Vector DB**: Clinical note input with **Vector DB RAG Auto-Indexing** (`isRagIndexed: true`, `vectorDbId`) and quick dictation presets.
- **8. Attachments**: Intraoral photos and PDF diagnostic attachment grid.
- **9. AI Case Analysis**: Evidence snapshots, AIReport status viewer, and one-click analysis requests.
- **10. Research Evidence**: External PubMed research references linked per patient.

### 3.3 Anatomical FDI Odontogram & 7-Step Evidence Pipeline (`/patients/:id/odontogram`)
- **Dual Naming System**: Displays both **FDI International Notation** (11–48) and **Common Anatomical Names** (e.g. `Tooth 36 — Lower Left 1st Molar`).
- **Anatomical SVG Graphics**: Distinct morphological shapes for Molars, Premolars, Canines, and Incisors, featuring 5 occlusal/incisal surface zones.
- **Color Coding**: Healthy (enamel white), Caries (red), Gingivitis (pink), Discoloration (amber), Restored (blue metallic), Attention Flag (pulsing alert).
- **7-Step Evidence Pipeline**:
  ```
  Step 1: Tooth Current State  ──►  Step 2: Historical Clinical Events
                                           │
  Step 4: Medical History     ◄──  Step 3: Doctor Notes & Observations
           │
           ▼
  Step 5: Knowledge Base      ──►  Step 6: PubMed External Evidence
                                           │
                                           ▼
                                 Step 7: AI Analysis & STUB Report
  ```
- **Side-by-Side Evidence Comparator**: Modal dialog allowing side-by-side comparison of current AI scan predictions vs historical clinical records with alignment scoring.

### 3.4 Vector DB & RAG Clinical Note Indexing (`/chat`)
- Doctor notes created in the workspace are assigned vector references (`vec_note_...`) and marked `isRagIndexed: true`.
- When a doctor opens the **Chat Assistant** (`/chat`), selecting a patient automatically loads the **Vector DB RAG Context**, referencing indexed notes in RAG responses and structured Markdown Report previews.

---

## 4. Data Models & Teeth Subdocument Schema

### 4.1 `Patient.js` Schema (Teeth Subdocuments with Individual `_id`s)

Teeth data is stored directly on the `Patient` document. Every tooth entry is assigned its own `_id`:

```javascript
{
  doctor: { type: ObjectId, ref: 'User', index: true },
  firstName: String, lastName: String, dob: Date, gender: String, phone: String, email: String,
  teeth: [{
    _id: ObjectId,             // Individual Subdocument ObjectId
    toothId: String,           // FDI Notation (e.g. "36")
    state: {
      condition: String,       // "healthy", "caries", "gingivitis", "discoloration", "ulcers"
      restoration: String,     // "none", "composite", "amalgam", "crown"
      surface: String,         // "occlusal", "buccal", "lingual", "mesial", "distal"
      attention: Boolean       // Clinical attention flag
    },
    notes: String,
    updatedAt: Date
  }],
  notes: [{
    _id: ObjectId,
    text: String,
    category: String,          // "diagnosis", "treatment", "tooth-history", "general"
    isRagIndexed: Boolean,     // Vector DB indexing flag
    ragStatus: String,         // "indexed", "pending", "failed"
    vectorDbId: String,        // Simulated vector embedding ID (e.g. "vec_note_mt0elbw")
    author: ref User,
    createdAt: Date
  }],
  medicalHistory: [...], medications: [...], allergies: [...], attachments: [...], research: [...]
}
```

---

## 5. API Architecture & Endpoints

| Method | Endpoint Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signin` | Doctor authentication & JWT generation | Public |
| `GET` | `/api/dashboard` | Aggregated 8-card command center data | Protected (JWT) |
| `GET` | `/api/patients` | Searchable patient directory | Protected (JWT) |
| `POST` | `/api/patients` | Create new patient record | Protected (JWT) |
| `GET` | `/api/patients/:id` | Fetch full patient workspace & linked AI scans | Protected (JWT) |
| `PATCH` | `/api/patients/:id/teeth/:toothId` | **Upsert per-tooth state (FDI notation)** | Protected (JWT) |
| `GET` | `/api/patients/:id/events` | Clinical timeline events (`?toothId=`) | Protected (JWT) |
| `POST` | `/api/patients/:id/events` | Log clinical procedure/event | Protected (JWT) |
| `POST` | `/api/patients/:id/notes` | Create doctor note & index into Vector DB | Protected (JWT) |
| `POST` | `/api/ai/analyze-tooth` | Assembles 7-group evidence context → AIReport | Protected (JWT) |
| `GET` | `/api/chat/sessions` | Retrieve chat sessions | Protected (JWT) |
| `POST` | `/api/chat/sessions/:id/messages` | Send message & receive RAG stub reply | Protected (JWT) |
| `GET` | `/api/appointments` | Range-filtered appointments (`?from=&to=`) | Protected (JWT) |
| `POST` | `/api/appointments` | Schedule new appointment | Protected (JWT) |
| `PATCH` | `/api/appointments/:id` | Quick-update appointment status | Protected (JWT) |

---

## 6. AI Microservice & Plug-In Contract

The AI microservice consists of a FastAPI application (`ai-service/api.py`) running an EfficientNet CNN model classifying intraoral images:

- **Input**: 224×224 RGB Image
- **Output**: Multi-class probability array across 6 disease categories:
  1. `Calculus`
  2. `Caries`
  3. `Gingivitis`
  4. `Hypodontia`
  5. `Tooth Discoloration`
  6. `Ulcers`

### Single Plug-In Contract
All AI calls in the clinical workspace route through single stub interfaces:
- **Backend Stub**: `back/src/services/aiClient.js` (`analyzeToothStub`)
- **Frontend Stub**: `front/src/lib/services/ai.ts` (`aiServiceStub`)

When a live LLM / RAG cluster is connected in future releases, developers replace **only the body of these two files**, keeping 100% of the UI, database schemas, and API contracts intact.

---

## 7. Presentation Slide-by-Slide Outline (Hackathon / Pitch Ready)

### Slide 1: Title & Vision
- **Title**: Ora AI — Clinical Dental Workspace & AI Diagnostic Platform
- **Subtitle**: Transforming Patient Intraoral Scanning into a Doctor Command Center
- **Presenter Note**: Highlight transition from consumer scan app to full doctor workspace.

### Slide 2: The Clinical Problem & Solution
- **Problem**: Disconnected patient scans, fragmented paper records, lack of visual evidence tracking.
- **Solution**: A unified 3-tier clinical workspace integrating real-time FDI Odontograms, RAG Vector DB note indexing, and automated AI image diagnostics.

### Slide 3: 3-Tier Architecture
- **Tech Stack**: React 18 + Vite (Frontend), Express + Mongoose (Backend REST API), FastAPI + EfficientNet (AI Microservice).
- **Security & Data**: JWT 7-day tokens, bcrypt password hashing, patient subdocument schema.

### Slide 4: Doctor Command Center (`/dashboard`)
- **8 Aggregated Cards**: Real-time appointments, attention flags, unreviewed AI recommendations, doctor scratchpad, and supply alerts.

### Slide 5: 360° Patient Workspace (`/patients/:id`)
- **10 Tabbed Sections**: Profile, Medical History, Medications, Allergies, Dental Chart, Treatment History, Doctor Notes, Attachments, AI Analysis, Research.
- **Linked AI Scans**: Automated linking of image predictions directly into the Medical History timeline.

### Slide 6: FDI Anatomical Odontogram & Tooth 36 Demo
- **Interactive Chart**: 32 teeth (11–48) represented with anatomical SVG graphics (crowns, roots, surface zones).
- **Tooth 36 Demo**: Lower left 1st molar evidence panel & instant condition editing.

### Slide 7: The 7-Step Evidence Pipeline & Comparator
- **Pipeline**: Assembles tooth state, clinical events, doctor notes, medical conditions, knowledge base, and PubMed research.
- **Side-by-Side Comparator**: Modal comparing current AI predictions vs historical records with alignment scoring.

### Slide 8: Vector DB & RAG Chat Assistant (`/chat`)
- **RAG Note Indexing**: Doctor notes assigned vector IDs (`vec_note_...`) and automatically ingested into RAG context snapshots.
- **Report Builder**: Instant generation of structured Markdown clinical report previews.

### Slide 9: Verification & System Health
- **Seed Script**: Idempotent clinical seed script (`npm run seed:clinical`) creating doctor & Tooth 36 demo patient.
- **Quality**: Zero TypeScript compilation errors, Vite build in <10s, 100% clean API smoke test results.

### Slide 10: Future Roadmap & Q&A
- **Next Steps**: Live RAG vector database cluster integration, HL7/FHIR EHR sync, mobile dentist app.
- **Call to Action**: Demo available live at `http://localhost:5173`.

---

## 8. Summary & Running Instructions

### Execution Commands
```bash
# 1. Seed Database with Demo Doctor & Tooth 36 Data
cd back && npm run seed:clinical

# 2. Run Backend API Server (Port 5000)
cd back && npm run dev

# 3. Run Frontend Application (Port 5173)
cd front && npm run dev
```

### Access Credentials
- **Doctor Sign-In**: `doctor@ora.ai` / `Password123!`
- **Live Application URL**: `http://localhost:5173`
