# Pakizzle AI Service

FastAPI + Google Gemini. Endpoints: `/ai/chat` (SSE streaming), `/ai/valuation`, `/ai/search`.

## Run

```bash
uv pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Env

- `GEMINI_API_KEY` — required for live responses (demo mode without).
- `GEMINI_MODEL` — default `gemini-2.0-flash-exp`.
- `JWT_SECRET` — shared with the Go gateway.
- `GATEWAY_URL` — used by tool-use calls.
- `DATABASE_URL`, `REDIS_URL` — chat session persistence (optional).
