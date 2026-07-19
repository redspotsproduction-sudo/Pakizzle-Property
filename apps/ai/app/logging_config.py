"""Structured JSON logging for the AI service.

Shared schema with the Go gateway:
    time, level, msg, service, request_id, route, method, user_id, ...

Per-request fields propagate via contextvars (set by RequestContextMiddleware).
"""
from __future__ import annotations

import logging
import sys
from contextvars import ContextVar

import structlog


# Per-request context. Populated by middleware in app/main.py.
_request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)
_route_ctx: ContextVar[str | None] = ContextVar("route", default=None)
_method_ctx: ContextVar[str | None] = ContextVar("method", default=None)
_user_id_ctx: ContextVar[str | None] = ContextVar("user_id", default=None)


def bind_request(request_id: str, method: str, route: str) -> None:
    _request_id_ctx.set(request_id)
    _method_ctx.set(method)
    _route_ctx.set(route)


def bind_user(user_id: str | int | None) -> None:
    _user_id_ctx.set(str(user_id) if user_id is not None else None)


def clear_request() -> None:
    _request_id_ctx.set(None)
    _route_ctx.set(None)
    _method_ctx.set(None)
    _user_id_ctx.set(None)


def _inject_request_ctx(_logger, _name, event_dict):
    if (rid := _request_id_ctx.get()) is not None:
        event_dict["request_id"] = rid
    if (rt := _route_ctx.get()) is not None:
        event_dict["route"] = rt
    if (mt := _method_ctx.get()) is not None:
        event_dict["method"] = mt
    if (uid := _user_id_ctx.get()) is not None:
        event_dict["user_id"] = uid
    event_dict.setdefault("service", "ai")
    return event_dict


def configure_logging() -> None:
    """Idempotent — safe to call from main.py and from imports."""
    from app.config import get_settings

    settings = get_settings()
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True, key="time")
    shared: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        _inject_request_ctx,
        structlog.processors.add_log_level,
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    renderer: structlog.types.Processor = (
        structlog.processors.JSONRenderer()
        if settings.is_production
        else structlog.dev.ConsoleRenderer(colors=sys.stderr.isatty())
    )

    structlog.configure(
        processors=[*shared, renderer],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
        force=True,
    )

    # Quiet down framework noise — we have our own per-request log line.
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(max(level, logging.WARNING))


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name or "pakizzle.ai")
