import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SolveSphere"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "solvesphere-secret-key-change-in-production-min-32-chars-long"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./solvesphere.db"
    SYNC_DATABASE_URL: str = "sqlite:///./solvesphere.db"
    DB_ENGINE: str = "sqlite"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & Auth
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    # File Storage
    MAX_IMAGE_SIZE_MB: int = 5
    MAX_PDF_SIZE_MB: int = 10
    MAX_VIDEO_SIZE_MB: int = 50
    UPLOAD_DIR: str = "./storage/uploads"

    # AI Configuration & Vector Thresholds
    AI_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    DUPLICATE_STRONG_THRESHOLD: float = 0.85
    AI_DUPLICATE_SIMILARITY_THRESHOLD: float = 0.70
    AI_REVIEW_SIMILARITY_THRESHOLD: float = 0.60
    OPENAI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )



settings = Settings()
