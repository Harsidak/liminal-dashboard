# Liminal Backend (Python + uv)

## Quickstart

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

From the monorepo root:

```bash
uv sync --project backend --directory backend
uv run --project backend --directory backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /health` - health check
- `POST /api/v1/simulations/chrono-sandbox` - synthetic scenario preview
- `POST /api/v1/explainer/portfolio` - explainability payload for a portfolio

## Project Layout

```text
backend/
  app/
    api/v1/
    core/
    schemas/
    services/
    main.py
```
