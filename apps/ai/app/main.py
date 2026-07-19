from __future__ import annotations

import asyncio
import json
import time
import uuid
from collections.abc import AsyncIterator
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings
from app.logging_config import (
    bind_request,
    bind_user,
    clear_request,
    configure_logging,
    get_logger,
)

configure_logging()
settings = get_settings()
log = get_logger("pakizzle.ai")

REQUEST_ID_HEADER = "x-request-id"

app = FastAPI(title="Pakizzle AI", version="2.0.0")

_cors_origins = settings.cors_origins_list or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Bind request_id/method/route to contextvars so every log line carries them."""

    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex[:12]
        bind_request(rid, request.method, request.url.path)
        t0 = time.perf_counter()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            response.headers[REQUEST_ID_HEADER] = rid
            return response
        except Exception:
            log.exception("request.unhandled_exception")
            raise
        finally:
            dur_ms = int((time.perf_counter() - t0) * 1000)
            level = "info" if status < 400 else "warning" if status < 500 else "error"
            getattr(log, level)(
                "request",
                status=status,
                duration_ms=dur_ms,
                bytes=int(request.headers.get("content-length") or 0),
            )
            clear_request()


app.add_middleware(RequestContextMiddleware)


@app.on_event("startup")
async def _startup() -> None:
    log.info(
        "boot",
        env=settings.ENV,
        model=settings.GEMINI_MODEL,
        gemini_configured=bool(settings.GEMINI_API_KEY.get_secret_value()),
        gateway_url=settings.GATEWAY_URL,
    )


@app.get("/healthz")
async def healthz() -> dict[str, Any]:
    return {
        "ok": True,
        "env": settings.ENV,
        "model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY.get_secret_value()),
    }


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    sessionId: str | None = None
    messages: list[ChatMessage]


class ValuationRequest(BaseModel):
    makeId: int
    modelId: int
    variantId: int | None = None
    year: int
    mileage: int | None = None
    city: str | None = None
    condition: str | None = None


class ValuationResponse(BaseModel):
    priceMin: int
    priceMax: int
    priceFair: int
    confidence: float
    reasoning: str
    comparables: list[dict[str, Any]] = []


def _gemini_client():
    try:
        from google import genai
    except ImportError:
        log.warning("gemini.sdk_missing")
        return None
    key = settings.GEMINI_API_KEY.get_secret_value()
    if not key:
        return None
    try:
        return genai.Client(api_key=key)
    except Exception as e:
        log.warning("gemini.client_init_failed", err=str(e))
        return None


@app.post("/ai/chat")
async def chat(req: ChatRequest) -> StreamingResponse:
    log.info(
        "chat.request",
        session_id=req.sessionId,
        message_count=len(req.messages),
        last_role=req.messages[-1].role if req.messages else None,
        last_chars=len(req.messages[-1].content) if req.messages else 0,
    )

    async def gen() -> AsyncIterator[bytes]:
        client = _gemini_client()
        user_msg = req.messages[-1].content if req.messages else ""
        t0 = time.perf_counter()
        delta_count = 0
        total_chars = 0

        if client is None:
            log.info("chat.demo_mode")
            preamble = (
                f"(Pakizzle AI demo mode — no Gemini key configured)\n\n"
                f"You asked: {user_msg!r}\n\n"
                "I'm a fuel-efficient sedan recommender for Pakistan. "
                "Once the Gemini API key is wired in, I'll give you real, "
                "data-grounded recommendations against live listings."
            )
            for chunk in preamble.split(" "):
                yield f"data: {json.dumps({'type': 'delta', 'content': chunk + ' '})}\n\n".encode()
                delta_count += 1
                total_chars += len(chunk) + 1
                await asyncio.sleep(0.04)
            yield f"data: {json.dumps({'type': 'done'})}\n\n".encode()
            log.info(
                "chat.completed",
                source="demo",
                duration_ms=int((time.perf_counter() - t0) * 1000),
                delta_count=delta_count,
                total_chars=total_chars,
            )
            return

        try:
            system_prompt = (
                "You are Pakizzle's AI assistant for Pakistani car buyers and sellers. "
                "Use PKR (e.g. 28 lakh, 1.2 crore). If the user mixes Urdu, respond in code-mixed "
                "Urdu/English. Be concise and concrete. Surface comparable listings when relevant."
            )
            contents = []
            for m in req.messages:
                role = "user" if m.role == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m.content}]})

            stream = await client.aio.models.generate_content_stream(
                model=settings.GEMINI_MODEL,
                contents=contents,
                config={"system_instruction": system_prompt},
            )
            async for ev in stream:
                txt = getattr(ev, "text", None)
                if txt:
                    delta_count += 1
                    total_chars += len(txt)
                    yield f"data: {json.dumps({'type': 'delta', 'content': txt})}\n\n".encode()
            yield f"data: {json.dumps({'type': 'done'})}\n\n".encode()
            log.info(
                "chat.completed",
                source="gemini",
                model=settings.GEMINI_MODEL,
                duration_ms=int((time.perf_counter() - t0) * 1000),
                delta_count=delta_count,
                total_chars=total_chars,
            )
        except Exception as e:
            log.exception(
                "chat.stream_failed",
                duration_ms=int((time.perf_counter() - t0) * 1000),
                delta_count=delta_count,
                err=str(e),
            )
            yield f"data: {json.dumps({'type': 'error', 'message': 'AI generation failed'})}\n\n".encode()
            yield f"data: {json.dumps({'type': 'done'})}\n\n".encode()

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/ai/valuation", response_model=ValuationResponse)
async def valuation(req: ValuationRequest) -> ValuationResponse:
    log.info(
        "valuation.request",
        make_id=req.makeId,
        model_id=req.modelId,
        year=req.year,
        city=req.city,
        mileage=req.mileage,
        condition=req.condition,
    )
    client = _gemini_client()
    fallback_price = max(500_000, 3_500_000 - max(0, 2026 - req.year) * 180_000)
    t0 = time.perf_counter()

    if client is None:
        resp = ValuationResponse(
            priceMin=int(fallback_price * 0.85),
            priceMax=int(fallback_price * 1.15),
            priceFair=int(fallback_price),
            confidence=0.4,
            reasoning="Demo-mode estimate based on age depreciation. Configure GEMINI_API_KEY for grounded valuation.",
        )
        log.info(
            "valuation.completed",
            source="demo",
            price_fair=resp.priceFair,
            duration_ms=int((time.perf_counter() - t0) * 1000),
        )
        return resp

    prompt = (
        f"Estimate fair-market PKR price range for a used car in Pakistan.\n"
        f"makeId={req.makeId} modelId={req.modelId} year={req.year} "
        f"mileage={req.mileage or 'unknown'} city={req.city or 'unknown'} "
        f"condition={req.condition or 'unknown'}.\n\n"
        "Respond with strict JSON: "
        '{"priceMin": int_pkr, "priceMax": int_pkr, "priceFair": int_pkr, '
        '"confidence": 0..1, "reasoning": "two sentences"}'
    )
    try:
        result = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        data = json.loads(result.text)
        resp = ValuationResponse(**data, comparables=[])
        log.info(
            "valuation.completed",
            source="gemini",
            model=settings.GEMINI_MODEL,
            price_fair=resp.priceFair,
            duration_ms=int((time.perf_counter() - t0) * 1000),
        )
        return resp
    except Exception as e:
        log.warning(
            "valuation.gemini_failed",
            err=str(e),
            duration_ms=int((time.perf_counter() - t0) * 1000),
        )
        return ValuationResponse(
            priceMin=int(fallback_price * 0.85),
            priceMax=int(fallback_price * 1.15),
            priceFair=int(fallback_price),
            confidence=0.3,
            reasoning=f"AI call failed; depreciation-only estimate. ({e})",
        )


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


@app.post("/ai/search")
async def search(req: SearchRequest) -> dict[str, Any]:
    if not req.query.strip():
        log.warning("search.empty_query")
        raise HTTPException(400, "query required")
    log.info("search.request", query_chars=len(req.query), limit=req.limit)
    return {
        "items": [],
        "interpretation": f"Stub: would parse '{req.query}' into structured filters + run pgvector search.",
    }


# Silence noisy ASGI lifespan log on dev shutdown
@app.on_event("shutdown")
async def _shutdown() -> None:
    log.info("shutdown")
    _ = bind_user  # keep import used
