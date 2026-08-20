# WATCHDOG — Context Budget & Scope Rules for coding agents

This file exists because an agent once tried to read 2 GB of files. Any agent working on this repo MUST follow these rules without exception.

## Never read / open / traverse
- `node_modules/`, `dist/`, `.git/`
- `assets/predict/` (uploaded patient photos), `assets/patient/`
- `*.keras` and any model/weights/checkpoint files
- `package-lock.json` (use `package.json`), `.env` files
- Images, PDFs, binaries. Any file > 100 KB: grep it, never read it whole.

## Operating rules
- Locate with grep first; open only exact files; read targeted line ranges for files > 500 lines.
- Session budget: < 40 file reads, < 10 full-file reads.
- Scope: this is a 3-tier app — `front/` (React+TS+Vite+Tailwind4+shadcn+TanStack Query), `back/` (Express5+Mongoose, MVC in `src/`), `ai-service/` (FastAPI — **do not touch**).
- AI features are STUBBED behind `front/src/lib/services/ai.ts` and `back/src/services/aiClient.js`. Do not implement real AI; extend those interfaces only.
- Extend, don't rebuild: match existing patterns (shadcn/ui, axiosInstance, TanStack Query, controller/route/model split, JWT `protect` middleware).
- No new dependencies without explicit approval. No refactors, no reformatting of untouched code. Verify with `tsc --noEmit` in `front/` and targeted endpoint smoke tests — not full monorepo builds.

## Teeth data contract
- FDI notation (11–48). Tooth state lives on the Patient document (`teeth[]` subdocs, each with its own `_id`), updated via `PATCH /api/patients/:id/teeth/:toothId`.
- Tooth history = `teeth[]` + `clinicalevents` filtered by `toothId`.

## Multi-Model Fallback Tiering & Cascading Rules
- **Level 0 (Advisor)**: `claude-opus-4-6` — Plan & Orchestration ONLY. Immediately switches worker after plan approval.
- **Level 1 (Primary)**: `gemini-3.7-flash-tiered`
- **Level 2 (Fallback 1)**: `gemini-3.7-flash`
- **Level 3 (Fallback 2)**: `gemini-3.6-flash`
- **Level 4 (Fallback 3)**: `opencode-go/deepseek-v4-flash`
