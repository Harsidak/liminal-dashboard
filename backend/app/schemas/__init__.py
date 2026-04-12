from pydantic import BaseModel, EmailStr  
from typing import Optional
from datetime import datetime

# --- Auth schemas ---
class UserRegister(BaseModel):
    email: EmailStr         
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr          
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: EmailStr          
    full_name: Optional[str]
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