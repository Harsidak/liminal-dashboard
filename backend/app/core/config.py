
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    # --- Basic App Settings ---
    APP_NAME: str = "Liminal AI"
    API_V1_STR: str = "/api/v1"
    
    # --- Security ---
    SECRET_KEY: str = "super-secret-key-that-should-be-changed" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # --- Gemini API Key (Required) ---
    GEMINI_API_KEY: str

    # --- CORS settings ---
    ALLOWED_ORIGINS: List[str] = ["*"]

    # --- The "Extra" Fields (From your .env) ---
    # We add these here so Pydantic doesn't throw a "ValidationError"
    DEBUG: bool = True
    DATABASE_URL: Optional[str] = None
    REDIS_URL: Optional[str] = None
    KAFKA_BOOTSTRAP_SERVERS: Optional[str] = None
    
    # --- Config ---
    # env_file=".env" tells Pydantic to look for a file named .env
    # extra="ignore" is a safety net that lets the app run even if .env has more stuff
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Create a settings instance to be used by other files
settings = Settings()