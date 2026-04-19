from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re

# --- Auth schemas ---
class UserRegister(BaseModel):
    email: EmailStr         
    password: str
    full_name: Optional[str] = None
    pan_card: str  # PAN card number (format: AAAAA0000A)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        from app.core.config import settings
        if len(v) < settings.PASSWORD_MIN_LENGTH:
            raise ValueError(f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long")
        return v

    @field_validator("pan_card")
    @classmethod
    def validate_pan(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", v):
            raise ValueError("PAN must be in format AAAAA0000A (e.g., ABCDE1234F)")
        return v

class UserLogin(BaseModel):
    email: EmailStr          
    password: str
    pan_card: str  # Required for CAS PDF decryption

    @field_validator("pan_card")
    @classmethod
    def validate_pan(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", v):
            raise ValueError("PAN must be in format AAAAA0000A")
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional["UserResponse"] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr          
    full_name: Optional[str]
    has_pan: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

# --- Portfolio schemas ---
class AssetItem(BaseModel):
    symbol: str
    allocation: float
    asset_type: str = "equity"

class PortfolioCreate(BaseModel):
    name: str
    assets: list[AssetItem]
    total_value: float = 100000.0

class PortfolioResponse(BaseModel):
    id: str
    name: str
    assets: list
    total_value: float
    created_at: datetime

    class Config:
        from_attributes = True