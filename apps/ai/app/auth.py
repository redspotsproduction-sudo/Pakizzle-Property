from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.config import Settings, get_settings
from app.logging_config import get_logger
from app.models import AuthUser

logger = get_logger(__name__)


def _extract_bearer(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "missing authorization header", "code": "auth_missing"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "malformed authorization header", "code": "auth_malformed"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    return parts[1]


def verify_token(token: str, settings: Settings) -> AuthUser:
    try:
        payload: dict[str, object] = jwt.decode(
            token,
            settings.JWT_SECRET.get_secret_value(),
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError as exc:
        logger.info("jwt.invalid", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid token", "code": "auth_invalid"},
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    sub = payload.get("sub") or payload.get("user_id") or payload.get("id")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "token missing subject", "code": "auth_missing_sub"},
        )

    return AuthUser(
        sub=str(sub),
        email=payload.get("email") if isinstance(payload.get("email"), str) else None,
        role=str(payload.get("role") or "user"),
        raw=payload,
    )


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,  # type: ignore[assignment]
) -> AuthUser:
    token = _extract_bearer(authorization)
    return verify_token(token, settings)


async def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,  # type: ignore[assignment]
) -> AuthUser | None:
    if not authorization:
        return None
    try:
        token = _extract_bearer(authorization)
        return verify_token(token, settings)
    except HTTPException:
        return None


def get_bearer_token(authorization: Annotated[str | None, Header()] = None) -> str | None:
    if not authorization:
        return None
    try:
        return _extract_bearer(authorization)
    except HTTPException:
        return None
