# Technical Analysis Report — Ora AI Dental Health Analysis App

**Project:** Mohamed_Ibrahim_Amin_21511760 / AI_PROJECT
**Date:** 2026-08-19
**Scope:** Full-stack web application with integrated AI microservice

---

## 1. Executive Summary

**Ora AI** is an AI-powered dental health analysis web application. Users upload intraoral photos and receive instant automated diagnosis for six oral conditions: Calculus, Caries, Gingivitis, Hypodontia, Tooth Discoloration, and Ulcers. The app also integrates Google Maps to help users locate nearby dentists.

The project is organized as a **3-tier monorepo-style structure**:
- `AI_PROJECT/front/` — React SPA
- `AI_PROJECT/back/` — Express.js REST API
- `AI_PROJECT/ai-service/` — FastAPI ML inference service

---

## 2. Technology Stack

### 2.1 Frontend (`AI_PROJECT/front/`)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | React 18.3.1 | Functional components, hooks |
| **Language** | TypeScript | Strict mode enabled |
| **Build Tool** | Vite 6.3.5 | Dev proxy to backend on `localhost:5000` |
| **Styling** | Tailwind CSS 4.1.12 | Utility-first, uses `@tailwindcss/vite` plugin |
| **Routing** | React Router 7.13.0 | `createBrowserRouter`, lazy-loaded routes |
| **Data Fetching** | TanStack Query 5.97.0 | `usePredictImageMutation`, `usePredictHistoryQuery` |
| **UI Components** | shadcn/ui (Radix primitives) | Dialog, Sheet, Carousel, Accordion, etc. |
| **Icons** | Lucide React 0.487.0 | Consistent icon system |
| **Animations** | Motion (Framer Motion) 12.23.24 | Page transitions & micro-interactions |
| **Maps** | `@vis.gl/react-google-maps` 1.8.3 | Embedded dentist locator map |
| **State** | React `useState` / `localStorage` | Auth state synced via `storage` & `auth-changed` events |
| **HTTP Client** | Axios 1.15.0 | Via custom `axiosInstance` |

**Frontend Routes:**
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with hero, features, testimonials, CTA |
| `/about` | `About` | About page |
| `/features` | `Features` | Feature highlights |
| `/ai-tool` | `AITool` | **Core feature** — image upload → AI analysis → results → dentist map |
| `/blogs` | `Blogs` | Blog listing |
| `/blogs/:id` | `BlogDetail` | Individual blog post |
| `/profile` | `Profile` | User profile management |
| `*` | `NotFound` | 404 fallback |

### 2.2 Backend (`AI_PROJECT/back/`)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | Node.js (CommonJS) | `"type": "commonjs"` in package.json |
| **Framework** | Express.js 5.2.1 | REST API |
| **Database** | MongoDB (Mongoose 9.4.1) | Two collections: `users`, `predictimages` |
| **Auth** | JWT (jsonwebtoken 9.0.3) | Access token (7d expiry), Reset token (10m expiry) |
| **Password Hashing** | bcryptjs 3.0.3 | Salt rounds: 10 |
| **File Upload** | Multer 2.0.2 | 15MB limit, image MIME validation, saved to `assets/predict/` |
| **AI Proxy** | Axios + FormData | Forwards uploaded images to Python AI service |
| **Dev Tooling** | Nodemon 3.1.14 | Hot reload |

**Backend API Routes:**
| Prefix | Methods | Description |
|--------|---------|-------------|
| `/api/auth` | POST | `signup`, `signin`, `forgot-password`, `verify-otp`, `reset-password` |
| `/api/users` | GET/PATCH/DELETE | `me` (profile CRUD, protected) |
| `/api/predict` | POST/GET | `image` (upload + predict), `history`, `history/:id` |

### 2.3 AI Microservice (`AI_PROJECT/ai-service/`)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | FastAPI | Single-file API (`api.py`) |
| **ML Framework** | TensorFlow / Keras | Model: `efficientnet_oral.keras` |
| **Base Model** | EfficientNet | Transfer learning for oral disease classification |
| **Image Processing** | Pillow (PIL) + NumPy | Resize to 224×224, RGB conversion, EfficientNet preprocessing |
| **Server** | Uvicorn | Runs on `0.0.0.0:8000` |

**Model Classes:**
1. Calculus
2. Caries
3. Gingivitis
4. Hypodontia
5. Tooth Discoloration
6. Ulcers

---

## 3. Data Models

### 3.1 User Schema (`back/src/models/User.js`)
```javascript
{
  name: String (optional, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, min 8 chars, select: false),
  otpCode: String (default null),
  otpExpiresAt: Date (default null),
  isDeleted: Boolean (default false),
  deletedAt: Date (default null)
}
```
- **Soft delete** pattern — users are marked `isDeleted` rather than removed.
- **Password exclusion** — `select: false` prevents password from being returned in queries by default.
- **Pre-save hook** — automatically hashes password with bcrypt (10 rounds) on creation/password change.
- **Timestamps** — `createdAt`, `updatedAt` auto-managed by Mongoose.

### 3.2 PredictImage Schema (`back/src/models/PredictImage.js`)
```javascript
{
  user: ObjectId (ref: User, required, indexed),
  prediction: String (trimmed),
  confidence: Number,
  imageUrl: String (required)
}
```
- Links predictions to authenticated users.
- Stores the relative file path of the uploaded image under `assets/predict/`.

---

## 4. Authentication & Authorization Flow

### 4.1 Signup / Signin
1. Client sends credentials to `/api/auth/signup` or `/api/auth/signin`.
2. Backend validates input, checks for existing users (case-insensitive email).
3. Password is compared/hashed via bcrypt.
4. JWT access token (7-day expiry) is returned.
5. Frontend stores token and attaches it as `Authorization: Bearer <token>` header.

### 4.2 Password Reset (OTP-based)
1. `/api/auth/forgot-password` — generates 6-digit OTP, stores it on user document with 10-minute expiry.
2. `/api/auth/verify-otp` — validates OTP, returns short-lived reset JWT (10 minutes, purpose: `password-reset`).
3. `/api/auth/reset-password` — verifies reset token, updates password, clears OTP fields.

### 4.3 Middleware
- **`protect`** — Requires valid Bearer token, loads active user (`isDeleted: false`) onto `req.user`.
- **`optionalProtect`** — Same as protect but passes through unauthenticated requests (used for anonymous predictions).

---

## 5. AI Prediction Flow

```
Frontend (React)
    │
    │  POST /api/predict/image (multipart/form-data)
    ▼
Backend (Express + Multer)
    │  - Validates image MIME type
    │  - Saves file to assets/predict/
    │  - Forwards via Axios/FormData to AI service
    ▼
AI Service (FastAPI)
    │  - Loads image via PIL
    │  - Preprocesses: RGB → 224×224 → EfficientNet normalization
    │  - Runs inference: model.predict()
    │  - Returns top class + confidence
    ▼
Backend
    │  - Stores prediction record in MongoDB (if authenticated)
    │  - Returns result to frontend
    ▼
Frontend
    │  - Displays result with confidence percentage
    │  - Optionally shows dentist map
```

**Anonymous Trial System:**
- Non-logged-in users get `AI_TOOL_FREE_TRIAL_LIMIT` free predictions (tracked via `localStorage`).
- Authenticated users have unlimited predictions and full history access.

---

## 6. Frontend Architecture

### 6.1 Component Structure
- **Layout** — Shared shell with Navbar, Footer, and outlet for pages.
- **Pages** — Thin wrappers; most page logic lives in `components/pages/`.
- **AI Tool** — Multi-step wizard: `UploadStep` → `ProcessingStep` → `ResultsStep`.
- **Map** — Embedded Google Maps with dentist markers, search bar, and fullscreen toggle.
- **Blogs** — Static content with category filtering and detail view.

### 6.2 State Management
- **TanStack Query** — Server state (predictions, history, auth).
- **React State** — Local UI state (current step, modals, map visibility).
- **localStorage** — Auth token persistence, anonymous trial count, trial welcome dismissal.

### 6.3 Styling Approach
- **Tailwind CSS 4** — All styling via utility classes.
- **shadcn/ui** — Pre-built Radix-based accessible components (buttons, dialogs, sheets, etc.).
- **Custom components** — `Button`, `Card`, `Layout`, `FAQ` with variant props.

---

## 7. Configuration & Environment

### 7.1 Backend (`.env.example`)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/myapp
JWT_SECRET=change_this_to_a_strong_secret
```
Additional env vars used in code:
- `PREDICT_SERVICE_URL` — defaults to `http://localhost:8000`
- `PREDICT_FORM_FIELD` — defaults to `"file"`

### 7.2 Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDiw6jwpIJyJ4_ttMaJ84oj2oz3neLbXw8
DEV=true
```

### 7.3 AI Service
- Model file: `efficientnet_oral.keras` (bundled with service).

---

## 8. Security Analysis

### 8.1 Strengths
- **Password hashing** — bcrypt with 10 salt rounds.
- **JWT secret validation** — throws explicit error if `JWT_SECRET` is missing.
- **Soft delete** — prevents deleted users from authenticating.
- **Password field exclusion** — `select: false` in Mongoose schema.
- **File type validation** — Multer restricts to `image/*` MIME types.
- **Token purpose claim** — reset tokens carry `purpose: "password-reset"` to prevent misuse.

### 8.2 Weaknesses & Recommendations

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **OTP returned in API response** | High | Never return OTP in JSON. Use email/SMS provider. |
| **No rate limiting** | High | Add rate limiting on auth endpoints to prevent brute-force. |
| **No input validation library** | Medium | Integrate Joi/Zod for request schema validation. |
| **No refresh tokens** | Medium | Implement refresh token rotation for long-lived sessions. |
| **No token revocation** | Medium | Maintain a token blacklist for logout/compromise scenarios. |
| **JWT secret in `.env.example`** | Low | Use a placeholder, not a guessable string. |
| **Google Maps API key in `.env`** | Low | Restrict key by HTTP referrer in Google Cloud Console. |
| **No HTTPS enforcement** | Medium | Enforce HTTPS in production; set `secure` cookie flags if using cookies. |
| **CORS wide open** | Medium | Restrict `cors()` to specific origins in production. |
| **No request logging/audit** | Low | Add security event logging for auth actions. |
| **Anonymous prediction trust** | Medium | `localStorage` count is client-side and easily tampered with. |

---

## 9. Code Quality Assessment

### 9.1 Backend
- **Structure** — Clean MVC separation: `controllers/`, `routes/`, `models/`, `middlewares/`.
- **Error handling** — Try/catch in all controllers with consistent JSON error responses.
- **Async/await** — Used consistently; no callback pyramids.
- **Documentation** — `AUTH_CYCLE.md` provides clear auth flow documentation.
- **Soft delete** — Properly implemented with middleware checks.

### 9.2 Frontend
- **Modern patterns** — Lazy loading, React Router data APIs, TanStack Query mutations.
- **Component reusability** — shadcn/ui primitives + custom wrapper components.
- **TypeScript** — Strict mode, proper type imports.
- **Path aliases** — `@` alias configured in Vite for clean imports.
- **Dev proxy** — Vite proxies `/api` and `/assets` to backend, avoiding CORS during development.

### 9.3 AI Service
- **Simplicity** — Single-file FastAPI app is easy to deploy and maintain.
- **Preprocessing** — Correctly follows EfficientNet expectations (224×224, RGB, `preprocess_input`).
- **Stateless** — No session management; pure inference endpoint.

---

## 10. Potential Improvements

### 10.1 Architecture
- **Containerization** — Add Dockerfiles for all three services and a `docker-compose.yml`.
- **API Gateway** — Consider a gateway (Kong/NGINX) to route `/predict` to the AI service instead of backend proxying.
- **CI/CD** — Add GitHub Actions pipeline.

### 10.2 Backend
- **Validation** — Add Zod/Joi schemas for all request bodies.
- **Testing** — Add unit tests and integration tests.
- **Logging** — Add structured logging (Winston/Pino).
- **Rate limiting** — `express-rate-limit` on auth and predict endpoints.
- **Environment config** — Centralize config with `dotenv` + validation.

### 10.3 Frontend
- **Error boundaries** — Wrap lazy-loaded routes for graceful failure.
- **Accessibility** — Ensure all Radix dialogs/sheets have proper ARIA labels.
- **Image preview** — Clean up object URLs to avoid memory leaks.
- **Offline support** — Add service worker for PWA capabilities.

### 10.4 AI Service
- **Model versioning** — Track model versions and allow A/B testing.
- **Batch inference** — Support multiple images per request for efficiency.
- **Health checks** — Add `/health` endpoint for Kubernetes/service mesh readiness probes.
- **Model explainability** — Add Grad-CAM or similar to highlight affected regions in the dental image.

---

## 11. Deployment Readiness

| Component | Current State | Production Ready? |
|-----------|--------------|-------------------|
| **Frontend** | Vite build output (`dist/` exists) | Partially — needs production API URL config |
| **Backend** | Express app with `.env` | Partially — needs env var hardening, CORS restriction, rate limiting |
| **AI Service** | Standalone FastAPI with model file | Partially — needs containerization, health checks, GPU support for TensorFlow |
| **Database** | MongoDB connection string | Needs production MongoDB (Atlas or self-hosted) with backups |

---

## 12. Summary

**Ora AI** is a well-architected, modern full-stack application with a clear separation between presentation (React), business logic (Express), and AI inference (FastAPI). The codebase follows reasonable conventions, uses established libraries, and implements core security practices (hashing, JWT, soft delete).

**Overall Rating: B+** — Solid foundation, production-ready with targeted security and DevOps improvements.
