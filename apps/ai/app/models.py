from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Role = Literal["user", "assistant", "system", "tool"]
ListingStatus = Literal["draft", "active", "sold", "suspended"]
Condition = Literal["excellent", "good", "fair", "poor"]
Transmission = Literal["manual", "automatic", "cvt"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class FlexibleModel(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


class ErrorEnvelope(StrictModel):
    error: str
    code: str


class ChatMessage(StrictModel):
    role: Role
    content: str


class ChatRequest(StrictModel):
    sessionId: str | None = None
    messages: list[ChatMessage] = Field(min_length=1)


class ValuationRequest(StrictModel):
    makeId: int
    modelId: int
    variantId: int | None = None
    year: int = Field(ge=1900, le=2100)
    mileage: int | None = Field(default=None, ge=0)
    city: str | None = None
    condition: Condition | None = None


class Listing(FlexibleModel):
    id: int
    sellerId: int | None = None
    makeId: int | None = None
    modelId: int | None = None
    variantId: int | None = None
    title: str | None = None
    description: str | None = None
    price: int
    year: int
    mileage: int | None = None
    city: str | None = None
    condition: Condition | None = None
    transmission: Transmission | None = None
    fuelType: str | None = None
    color: str | None = None
    images: list[str] = Field(default_factory=list)
    status: ListingStatus | None = None
    createdAt: datetime | None = None


class ValuationResponse(StrictModel):
    priceMin: int
    priceMax: int
    priceFair: int
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    comparables: list[Listing] = Field(default_factory=list)


class SearchRequest(StrictModel):
    query: str = Field(min_length=1, max_length=500)
    limit: int = Field(default=10, ge=1, le=50)


class SearchFilters(StrictModel):
    makeId: int | None = None
    modelId: int | None = None
    minPrice: int | None = None
    maxPrice: int | None = None
    city: str | None = None
    transmission: Transmission | None = None
    fuelType: str | None = None
    minYear: int | None = None
    maxYear: int | None = None
    q: str | None = None


class SearchInterpretation(StrictModel):
    filters: SearchFilters
    summary: str


class SearchResponse(StrictModel):
    items: list[Listing]
    interpretation: str
    filters: SearchFilters


class AuthUser(StrictModel):
    sub: str
    email: str | None = None
    role: str = "user"
    raw: dict[str, Any] = Field(default_factory=dict)


class HealthStatus(StrictModel):
    status: Literal["ok", "degraded", "error"]
    version: str
    env: str
    checks: dict[str, str]


class SSEEvent(StrictModel):
    type: Literal["delta", "tool_call", "tool_result", "done", "error"]
    content: str | None = None
    name: str | None = None
    args: dict[str, Any] | None = None
    result: Any | None = None
    message: str | None = None
    messageId: str | None = None
