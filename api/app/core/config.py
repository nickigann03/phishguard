"""
Application Configuration Management

Uses Pydantic Settings to load configuration from environment variables.
Supports different environments: development, testing, production.
"""

from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes are automatically loaded from:
    1. Environment variables
    2. .env file (if present)
    """
    
    # ============================================================================
    # APPLICATION SETTINGS
    # ============================================================================
    APP_NAME: str = "PhishGuard"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "testing", "production"] = "development"
    DEBUG: bool = True
    
    # ============================================================================
    # DATABASE SETTINGS
    # ============================================================================
    DATABASE_URL: str
    # Example: postgresql://user:password@localhost:5432/phishguard
    
    # ============================================================================
    # REDIS SETTINGS
    # ============================================================================
    REDIS_URL: str
    # Example: redis://localhost:6379/0
    
    # ============================================================================
    # SECURITY SETTINGS
    # ============================================================================
    SECRET_KEY: str
    # For JWT signing - must be a strong, random string in production!
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ============================================================================
    # CORS SETTINGS
    # ============================================================================
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    # Frontend URLs that can access the API
    
    # ============================================================================
    # AI SERVICE SETTINGS
    # ============================================================================
    AI_PROVIDER: Literal["openai", "anthropic", "gemini", "groq", "local"] = "groq"
    AI_API_KEY: str = ""
    AI_MODEL: str = "llama3-70b-8192"
    
    # ============================================================================
    # EMAIL SERVICE SETTINGS (for sending phishing simulations)
    # ============================================================================
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    MICROSOFT_TENANT_ID: str = ""
    
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # ============================================================================
    # SMS SERVICE SETTINGS
    # ============================================================================
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # ============================================================================
    # CELERY SETTINGS (for background tasks)
    # ============================================================================
    CELERY_BROKER_URL: str = ""  # Usually same as REDIS_URL
    CELERY_RESULT_BACKEND: str = ""  # Usually same as REDIS_URL
    
    # ============================================================================
    # STORAGE SETTINGS (S3 or MinIO for files)
    # ============================================================================
    S3_BUCKET: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_ENDPOINT_URL: str = ""  # For MinIO
    
    # ============================================================================
    # PYDANTIC SETTINGS CONFIG
    # ============================================================================
    model_config = SettingsConfigDict(
        env_file="../.env",  # Look in parent directory
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # Ignore extra env vars
    )
    
    # ============================================================================
    # COMPUTED PROPERTIES
    # ============================================================================
    
    @property
    def async_database_url(self) -> str:
        """Convert sync PostgreSQL URL to async (asyncpg)"""
        return self.DATABASE_URL.replace(
            "postgresql://",
            "postgresql+asyncpg://"
        )
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses lru_cache to ensure we only create one Settings instance,
    avoiding repeated file reads and environment variable parsing.
    
    Returns:
        Settings: The application settings
    """
    return Settings()


# Global settings instance
settings = get_settings()
