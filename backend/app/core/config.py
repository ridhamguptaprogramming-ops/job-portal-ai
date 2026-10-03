import os
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "openroles-fastapi"
    FIREBASE_PROJECT_ID: str = "job-portal-ai-818f8"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # PostgreSQL Configuration (Supports managed Render PostgreSQL via DATABASE_URL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/careermatch"
    )
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # The current production origin is allowed; Render can override this with a JSON array.
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: [
        "https://job-portal-ai-one.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ])

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
