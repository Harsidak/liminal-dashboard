from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "FinSim AI"
    DEBUG: bool = False
    SECRET_KEY: str = "changeme"
    DATABASE_URL: str = "sqlite+aiosqlite:///./finsim.db"
    REDIS_URL: str = "redis://localhost:6379"
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    GEMINI_API_KEY: str = ""         
    GROQ_API_KEY: str = ""
    NEWS_API: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    UPLOAD_DIR: str = "./uploads"    # Directory for CAS PDF uploads
    
    # Security/Logic Flags
    FALLBACK_TO_DEMO: bool = False
    PASSWORD_MIN_LENGTH: int = 8

    class Config:
        env_file = ".env"
        extra = "ignore"              
settings = Settings()