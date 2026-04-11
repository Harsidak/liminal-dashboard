import uuid
import traceback

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.models import User, Portfolio, Simulation
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    PortfolioCreate, PortfolioResponse
)
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.schemas.explainer import AssetExplainRequest, ExplainerResponse
from app.services.explainer_service import explain_asset
from app.services.simulation_service import create_simulation, get_simulation

router = APIRouter()
bearer_scheme = HTTPBearer()


# ─── Dependency: get current logged-in user ───────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── AUTH ─────────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/auth/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token)


@router.get("/auth/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


# ─── PORTFOLIO ────────────────────────────────────────────────────────────────

@router.post("/portfolio", response_model=PortfolioResponse, status_code=201)
async def create_portfolio(
    body: PortfolioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = sum(a.allocation for a in body.assets)
    if abs(total - 100.0) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Asset allocations must sum to 100%, got {total}%"
        )
    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=body.name,
        assets=[a.model_dump() for a in body.assets],
        total_value=body.total_value
    )
    db.add(portfolio)
    await db.commit()
    await db.refresh(portfolio)
    return portfolio


@router.get("/portfolio", response_model=list[PortfolioResponse])
async def list_portfolios(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/portfolio/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.id
        )
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


# ─── SIMULATION ───────────────────────────────────────────────────────────────

@router.post("/simulation", response_model=SimulationResponse, status_code=201)
async def start_simulation(
    body: SimulationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        sim = await create_simulation(db, current_user.id, body.portfolio_id, body.years)
        return sim
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/simulation/{sim_id}", response_model=SimulationResponse)
async def check_simulation(
    sim_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sim = await get_simulation(db, sim_id)
    if not sim or sim.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


# ─── XAI EXPLAINER ────────────────────────────────────────────────────────────

@router.post("/explain", response_model=ExplainerResponse)
async def explain(
    body: AssetExplainRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        return await explain_asset(body)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ─── BEHAVIORAL COACH ─────────────────────────────────────────────────────────

@router.post("/behavioral/panic-check")
async def panic_check(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    score = payload.get("agitation_score", 0)
    if score >= 0.8:
        return {
            "panic_detected": True,
            "block_trade": True,
            "message": (
                "Take a breath. Markets recover. Selling now locks in your loss "
                "permanently. Historical data shows 89% of dips recover within 12 months."
            ),
            "cognitive_bias": "loss_aversion"
        }
    return {
        "panic_detected": False,
        "block_trade": False,
        "message": "You're making a calm decision. Proceed when ready."
    }