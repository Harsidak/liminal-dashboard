# backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError, jwt

from ...core import models, database, security, config
from ...schemas import user as user_schemas

router = APIRouter()

# Dependency: Define the URL where the token is obtained (for Swagger UI auth)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{config.settings.API_V1_STR}/auth/login")

# Dependency: Get the current authenticated user for protected routes
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. Decode the JWT token
        payload = jwt.decode(token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = user_schemas.TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
        
    # 2. Find the user in the database
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=user_schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """Logs in a user and returns a JWT access token."""
    
    # 1. Authenticate the user
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 2. Create and return the token
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=user_schemas.UserResponse)
def register_user(user_in: user_schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Registers a new user."""
    
    # 1. Check if user already exists
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists."
        )
        
    # 2. Hash the password and create the user
    hashed_password = security.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email, 
        full_name=user_in.full_name, 
        hashed_password=hashed_password
    )
    
    # 3. Also create an empty portfolio for the user
    db_portfolio = models.Portfolio(user=db_user)
    
    db.add(db_user)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_user)
    return db_user
