# Ora AI — Complete Vercel Production Deployment Plan

**Project:** Ora AI Clinical Dental Workspace & Diagnostic System  
**Author:** Marwan Ammar (Myler71)  
**Repository:** [https://github.com/myler71/Ora-AI.git](https://github.com/myler71/Ora-AI.git)  
**Target Platform:** **Vercel** (Frontend + Serverless API) + Cloud Backing Services  

---

## 1. Executive Summary & Deployment Architecture

Ora AI is a three-tier clinical dental diagnosis and workspace platform combining a React 18 / Vite SPA, an Express.js clinical REST API, and a Python FastAPI multi-agent AI microservice (EfficientNet CNN + Groq LLM + LangGraph RAG).

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
         │     (M0 Free / M10 Dedicated)│        │   FastAPI + EfficientNet     │
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

## 2. Platform Component Breakdown

| Component | Technology | Target Hosting | Production Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 4, shadcn/ui | **Vercel (Vite Preset)** | Serves global CDN edge-cached UI, clinical dashboards, odontogram SVG, and patient management. |
| **Backend** | Node.js, Express.js 5, Mongoose 9, JWT | **Vercel Serverless Function** (or Node Container) | Handles authentication, patient CRUD, appointments, odontogram state, and proxies predictions. |
| **Database** | MongoDB (Mongoose) | **MongoDB Atlas** | Managed cloud database storing users, patients, clinical events, and diagnostic history. |
| **AI Microservice** | FastAPI, Uvicorn, TensorFlow/Keras, LangGraph, Groq | **Render / Hugging Face / Cloud Run / Railway** | Executes image classification (EfficientNet 28.5MB CNN) and multi-agent clinical case reasoning. |

---

## 3. Step-by-Step Vercel Deployment

### Method A: Deploying via Vercel Dashboard (Recommended)

#### Step 1: Import GitHub Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select the repository **`myler71/Ora-AI`** and click **Import**.

#### Step 2: Configure Frontend Project Settings
- **Project Name:** `ora-ai` (or your custom name)
- **Framework Preset:** `Vite`
- **Root Directory:** `./front` (or leave as `./` with root `vercel.json`)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Step 3: Configure Environment Variables in Vercel
Under the **Environment Variables** section of the Vercel project, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://ora-ai-api.vercel.app` (or your deployed API domain) | Backend API endpoint URL |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSy...` | Google Maps API key for clinic locator |
| `DEV` | `false` | Production flag |

#### Step 4: Click Deploy
Click **Deploy**. Vercel will build the React SPA in ~25 seconds and assign a production URL like `https://ora-ai.vercel.app`.

---

### Method B: Deploying Backend as Vercel Serverless Functions

To deploy the Express backend API on Vercel as a dedicated serverless service:

#### Step 1: Create a Second Vercel Project for Backend
1. In Vercel, click **"Add New..."** → **"Project"**.
2. Select **`myler71/Ora-AI`**.
3. Configure:
   - **Project Name:** `ora-ai-api`
   - **Framework Preset:** `Other`
   - **Root Directory:** `./back`
   - **Build Command:** *(leave blank or default)*
   - **Output Directory:** *(leave blank)*

#### Step 2: Add Backend Environment Variables in Vercel
In the `ora-ai-api` Vercel project settings:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port setting |
| `MONGO_URI` | `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/ai-ora?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `JWT_SECRET` | `generate-a-strong-256-bit-random-secret-key` | JWT signing secret |
| `PREDICT_SERVICE_URL` | `https://ora-ai-service.onrender.com` (your deployed AI microservice URL) | Python AI service endpoint |
| `CORS_ORIGIN` | `https://ora-ai.vercel.app` | Whitelist frontend domain |

The backend includes `back/api/index.js` and `back/vercel.json` which automatically handle routing all incoming requests through Express with cached MongoDB serverless connection pooling.

---

### Method C: Deploying via Vercel CLI

You can also deploy directly from your local terminal using the Vercel CLI:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy Frontend
cd front
vercel --prod

# 4. Deploy Backend
cd ../back
vercel --prod
```

---

## 4. Deploying the AI Microservice (`ai-service`)

The Python AI service contains TensorFlow/Keras and LangGraph dependencies and is packaged with a dedicated `Dockerfile`. Because ML dependencies require container runtimes, host `ai-service` on any container platform:

### Option 1: Render.com (Recommended Free/Standard Tier)
1. Go to [Render.com](https://render.com) and select **New Web Service**.
2. Connect `https://github.com/myler71/Ora-AI.git`.
3. Set **Root Directory** to `ai-service`.
4. Select **Docker** environment (or Python 3.11 with `uvicorn api:app --host 0.0.0.0 --port $PORT`).
5. Add Environment Variables:
   - `GROQ_API_KEY`: `gsk_...`
   - `GROQ_MODEL`: `openai/gpt-oss-120b` or `llama-3.3-70b-versatile`
   - `TAVILY_API_KEY`: `tvly-...`
   - `DATABASE_URL`: `sqlite:///./dental_ai.db`
6. Deploy service. Copy the assigned URL (e.g. `https://ora-ai-service.onrender.com`) and paste it as `PREDICT_SERVICE_URL` in the Vercel Backend settings.

### Option 2: Hugging Face Spaces (Free Cloud GPU/CPU)
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) with **Docker SDK**.
2. Push the `ai-service` folder.
3. Configure secrets for `GROQ_API_KEY` and `TAVILY_API_KEY`.

### Option 3: Google Cloud Run / AWS App Runner
```bash
# Build and push to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ora-ai-service ./ai-service
# Deploy to Cloud Run with 2GB RAM
gcloud run deploy ora-ai-service --image gcr.io/YOUR_PROJECT_ID/ora-ai-service --platform managed --memory 2Gi --allow-unauthenticated
```

---

## 5. Managed Database Setup (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Security** → **Database Access** and create a user with Read/Write permissions.
3. Go to **Network Access** → **Add IP Address** → choose **"Allow Access from Anywhere" (`0.0.0.0/0`)** (required for Vercel dynamic serverless IPs).
4. Go to **Database** → **Connect** → **Drivers** and copy the URI string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-ora?retryWrites=true&w=majority
   ```
5. Seed initial clinical dataset (10 rich patients, odontogram states, medical history) from local or via script:
   ```bash
   cd back
   MONGO_URI="your-atlas-connection-string" npm run seed:clinical
   ```

---

## 6. Security Hardening Checklist

- [x] **Connection Pooling:** Serverless DB connection caching configured in `back/src/config/db.js`.
- [x] **CORS Origin Restriciton:** Backend accepts `CORS_ORIGIN` environment variable matching Vercel frontend domain.
- [x] **Password Protection:** Passwords hashed with bcrypt (10 salt rounds) and excluded (`select: false`) from queries.
- [x] **JWT Expiration:** 7-day access token expiry with dedicated reset tokens.
- [x] **Google Maps Referrer Restriction:** In Google Cloud Console, restrict `VITE_GOOGLE_MAPS_API_KEY` to `https://*.vercel.app/*` and your custom domain.
- [x] **Vercel Security Headers:** Added `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` to `vercel.json`.

---

## 7. Post-Deployment Verification Guide

After deployment, perform these end-to-end verification checks:

1. **Frontend Landing & Routing:**
   - Navigate to `https://ora-ai.vercel.app` → check hero, features, and navigation links.
   - Test deep routes (`/patients`, `/calendar`, `/ai-tool`, `/blogs`) to ensure SPA routing rewrites work without 404.
2. **Authentication Flow:**
   - Sign up a new user at `/ai-tool` or sign in.
   - Verify JWT token is received and stored.
3. **Clinical Workspace:**
   - Visit `/dashboard` to verify 8 command-center metric cards load from API.
   - Visit `/patients` → inspect anatomical FDI odontogram teeth render correctly.
4. **AI Vision & Diagnostic Pipeline:**
   - Upload a dental image on `/ai-tool`.
   - Verify EfficientNet inference returns top class prediction + confidence percentage.
5. **Multi-Agent RAG Chat:**
   - Send a query in the `/chatbot` interface.
   - Verify Groq LLM responds with dental clinical guidance and citations.

---

## 8. Continuous Integration & Deployment (CI/CD)

The repository includes `.github/workflows/ci.yml`. On every push to `main` or pull request:
1. Installs frontend dependencies and verifies `npm run build` succeeds cleanly.
2. Verifies backend Node.js modules and syntax.
3. Runs AI service test suite (`pytest`).
4. Automatic Vercel deployment preview is created on every branch push.
