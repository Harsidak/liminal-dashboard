# Liminal AI Dashboard

Liminal AI is a mobile-first fintech platform for the Finvasia Innovation Hackathon 2026 that helps reduce investing fear using simulation, explainability, and behavioral coaching.

## Monorepo Layout

```text
liminal-dashboard/
  frontend/          # React + Vite + Tailwind + shadcn/ui
  backend/           # FastAPI (Python) managed by uv
  Documents/         # Hackathon brief, PRD, tech blueprint, rulebook
```

Start with `Documents/README.md` for a guided reading order. Large PDFs in `Documents/` are gitignored to keep the repo small—keep them locally for citations.

## Product Scope (from project documents)

- Chrono-Sandbox (TimeGAN-inspired multiverse simulation)
- AI Portfolio Explainer (SHAP/LIME-oriented narrative explanations)
- Loss Probability / VaR visualization
- Behavioral guardrails for panic-driven actions

## Run Frontend

```bash
npm install
npm run dev
```

## Run Backend (uv)

```bash
npm run backend:sync
npm run backend:dev
```

Requires `uv` installed locally. Backend docs live in `backend/README.md`.

## Frontend Theme

The UI follows a neon-violet glassmorphism style inspired by mobile neobank apps:

- Background wash: `#1A162D -> #000000`
- Accent gradient: `#5D7CFF -> #A076FF`
- Semi-transparent glass cards with blur and soft borders
