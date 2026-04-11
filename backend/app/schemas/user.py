from pydantic import BaseModel, EmailStr
from typing import Optional

# Base schema for both Login and CreateUser
class UserBase(BaseModel):
    email: EmailStr

# Schema for creating a new user (received from frontend)
class UserCreate(UserBase):
    full_name: str
    password: str

# Schema returned to the frontend (excludes password)
class UserResponse(UserBase):
    id: int
    full_name: str
    
    # Required for SQLAlchemy models to integrate smoothly
    class Config:
        form_mode = True

# Schema for JWT Token data
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    # Data stored within the token (usually user ID)
    user_id: Optional[str] = None