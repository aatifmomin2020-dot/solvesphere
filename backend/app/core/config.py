import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SolveSphere API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "solvesphere_secret_key_sih2026_super_secure_key_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for easy demoing
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./solvesphere.db").replace("sqlite+aiosqlite://", "sqlite://")
    USE_PGVECTOR: bool = os.getenv("USE_PGVECTOR", "false").lower() == "true"

settings = Settings()
