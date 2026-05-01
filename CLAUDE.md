# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Build for production → dist/
npm install       # Install dependencies
```

No test runner is configured. No lint script is defined in package.json.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TAX_READER_URL=   # Optional: Google Cloud Run OCR service
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Supabase

**Routing (React Router 7):**

| Path | Component | Auth |
|------|-----------|------|
| `/` | `PublicHome` | Public |
| `/demo` | Dashboard (demo mode) | Public |
| `/login` | `LoginPage` | Public |
| `/app/dashboard` | `Dashboard` | Protected |
| `/app/profil` | `Profil` | Protected |
| `/app/varianten` | `Varianten` | Protected |
| `/app/einstellungen` | `Einstellungen` | Protected |
| `/wissen` | Knowledge articles | Public |

Protected routes check the Supabase session via a `ProtectedRoute` wrapper in `src/app/App.tsx`.

**State management:** React hooks + `localStorage`. No Redux or global state library. Two storage keys per user (keyed by Supabase user ID):
- `ProfilSnapshot` — user's financial profile (~70 fields: income, assets, debts, canton, etc.)
- `Variante[]` — list of planning scenarios

Helper functions for loading/saving are in `src/app/lib/finance-data.ts` (`loadStoredProfile`, `loadStoredVarianten`).

**Core business logic lives in two files:**

- `src/app/lib/finance-data.ts` (893 lines) — all financial data types, tax estimation, AHV/PK projections, 30-year wealth forecasts. `analyseVariante()` is the central calculation function.
- `src/app/lib/dashboard-recommendations.ts` — `buildDashboardRecommendations()` generates prioritized actionable insights from a `VariantenAnalyse`.

**i18n:** `src/app/lib/i18n.tsx` — `LanguageProvider` context with a `chromeCopy` object containing all UI strings in `de-CH` (default), `en`, `fr-CH`, `it-CH`. Language preference stored in `localStorage`. All pages consume this via `useLanguage()`.

**UI components:** shadcn/ui primitives live in `src/app/components/ui/`. Custom wrappers in `src/app/components/`. Charts use `recharts`. Drag-and-drop uses `react-dnd`.

**PDF/OCR:** `src/lib/tax-document.ts` — extracts text from uploaded tax PDFs via `pdfjs-dist`, with `tesseract.js` OCR fallback for scanned documents. An optional Cloud Run service (`cloud-run-tax-reader/`) handles server-side OCR.

**Auth:** Supabase email/password only, client initialized in `src/lib/supabase.ts`.

**Deployment:** Vercel (frontend) + Supabase (DB/auth). `vercel.json` rewrites all paths to `index.html` for SPA routing.

## Domain Context

This is a **Swiss personal financial planning app** (FinPlan). Key domain terms:
- **BVG / Pensionskasse (PK):** Swiss occupational pension (2nd pillar)
- **AHV:** Swiss state pension (1st pillar)
- **Säule 3a:** Tax-advantaged private retirement savings (3rd pillar)
- **Kanton:** Swiss canton — used for cantonal tax multiplier calculations
- **Variante:** A planning scenario (different retirement ages, savings rates, life events)
- **Ereignis:** A life event within a scenario (e.g., property purchase, income change)

UI copy defaults to German; never change German terminology to English equivalents unless inside the i18n system.

## Design System

Defined in `guidelines/Guidelines.md`:
- Desktop-first, card-based layouts
- Colors: primary dark blue/petrol, secondary green, warning orange, neutral greys
- Tone: calm, professional, empowering — never alarming or sales-driven
- Real-time KPI updates as users adjust inputs; line charts for projections
