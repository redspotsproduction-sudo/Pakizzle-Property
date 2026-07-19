from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    ENV: Literal["development", "staging", "production", "test"] = "development"
    LOG_LEVEL: str = "INFO"

    GEMINI_API_KEY: SecretStr = Field(default=SecretStr(""))
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"
    GEMINI_EMBED_MODEL: str = "text-embedding-004"

    JWT_SECRET: SecretStr = Field(default=SecretStr("change-me"))
    JWT_ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql://pakizzle:pakizzle@localhost:5432/pakizzle"
    DATABASE_POOL_MIN: int = 1
    DATABASE_POOL_MAX: int = 10

    REDIS_URL: str = "redis://localhost:6379/0"

    GATEWAY_URL: str = "http://localhost:8080"
    GATEWAY_TIMEOUT_SECONDS: float = 10.0

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    EMBEDDING_DIM: int = 768
    CHAT_SESSION_TTL_SECONDS: int = 60 * 60 * 24 * 7

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
