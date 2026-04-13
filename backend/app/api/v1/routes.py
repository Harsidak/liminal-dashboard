import os
import uuid
import traceback

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.core.models import User, Portfolio, Simulation, CASUpload, Holding
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.core.config import settings
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    PortfolioCreate, PortfolioResponse
)
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.schemas.explainer import AssetExplainRequest, ExplainerResponse
from app.schemas.cas import CASUploadResponse, HoldingResponse, PortfolioSummary, AllocationResponse
from app.schemas.stock import StockPriceResponse, StockHistoryResponse, BatchPriceRequest, BatchPriceResponse
from app.services.explainer_service import explain_asset
from app.services.simulation_service import create_simulation, get_simulation
from app.services.cas_parser import decrypt_and_parse
from app.services.stock_service import get_stock_price, get_stock_history, get_batch_prices, update_holding_prices
from app.services.analytics_service import get_portfolio_summary, get_allocation

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
        full_name=body.full_name,
        pan_hash=hash_password(body.pan_card),  # Store PAN as bcrypt hash
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
    # Verify PAN matches stored hash
    if not verify_password(body.pan_card, user.pan_hash):
        raise HTTPException(status_code=401, detail="Invalid PAN card number")
    token = create_access_token({"sub": user.id, "pan": body.pan_card})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            has_pan=True,
            created_at=user.created_at,
        )
    )


@router.get("/auth/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        has_pan=bool(current_user.pan_hash),
        created_at=current_user.created_at,
    )


# ─── CAS PDF UPLOAD ──────────────────────────────────────────────────────────

@router.post("/cas/upload", response_model=CASUploadResponse, status_code=201)
async def upload_cas(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Upload and parse a CAS PDF. The user's PAN (from JWT) is used to decrypt."""
    # Get user and PAN from token
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    pan = payload.get("pan")
    
    if not pan:
        raise HTTPException(status_code=400, detail="PAN not found in token. Please re-login.")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Validate file
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Create upload record
    upload = CASUpload(
        id=str(uuid.uuid4()),
        user_id=user_id,
        filename=file.filename,
        status="pending",
    )
    db.add(upload)
    await db.commit()
    
    try:
        # Read file bytes
        pdf_bytes = await file.read()
        
        # Save file to uploads directory
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, f"{upload.id}.pdf")
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)
        
        # Parse CAS PDF with PAN as password
        holdings_data = decrypt_and_parse(pdf_bytes, pan)
        
        # Update holdings with real-time prices
        holdings_data = await update_holding_prices(holdings_data)
        
        # Clear existing holdings for this user and save new ones
        await db.execute(delete(Holding).where(Holding.user_id == user_id))
        
        for h in holdings_data:
            holding = Holding(
                id=str(uuid.uuid4()),
                user_id=user_id,
                cas_upload_id=upload.id,
                symbol=h["symbol"],
                name=h["name"],
                isin=h.get("isin"),
                quantity=h["quantity"],
                avg_cost=h.get("avg_cost"),
                current_price=h.get("current_price"),
                market_value=h.get("market_value"),
                asset_type=h.get("asset_type", "equity"),
                sector=h.get("sector"),
                pnl=h.get("pnl"),
                pnl_percent=h.get("pnl_percent"),
            )
            db.add(holding)
        
        upload.status = "parsed"
        upload.holdings_count = len(holdings_data)
        await db.commit()
        await db.refresh(upload)
        
        return upload
        
    except ValueError as e:
        upload.status = "failed"
        upload.error_message = str(e)
        await db.commit()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        upload.status = "failed"
        upload.error_message = f"Unexpected error: {str(e)}"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process CAS PDF: {str(e)}")


@router.get("/cas/uploads", response_model=list[CASUploadResponse])
async def list_cas_uploads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CASUpload).where(CASUpload.user_id == current_user.id)
    )
    return result.scalars().all()


# ─── PORTFOLIO / HOLDINGS ────────────────────────────────────────────────────

@router.get("/portfolio/holdings", response_model=list[HoldingResponse])
async def list_holdings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all holdings parsed from CAS uploads."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/portfolio/summary", response_model=PortfolioSummary)
async def portfolio_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overall portfolio P&L summary."""
    return await get_portfolio_summary(db, current_user.id)


@router.get("/portfolio/allocation", response_model=AllocationResponse)
async def portfolio_allocation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get portfolio allocation by sector and asset type."""
    return await get_allocation(db, current_user.id)


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


# ─── STOCK PRICES ─────────────────────────────────────────────────────────────

@router.get("/stocks/price/{symbol}", response_model=StockPriceResponse)
async def stock_price(
    symbol: str,
    current_user: User = Depends(get_current_user),
):
    """Get current price for a single stock."""
    try:
        return await get_stock_price(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/stocks/history/{symbol}", response_model=StockHistoryResponse)
async def stock_history(
    symbol: str,
    period: str = Query("6mo", description="1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max"),
    current_user: User = Depends(get_current_user),
):
    """Get historical OHLCV data for a stock."""
    try:
        return await get_stock_history(symbol, period)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/stocks/batch-prices", response_model=BatchPriceResponse)
async def batch_prices(
    body: BatchPriceRequest,
    current_user: User = Depends(get_current_user),
):
    """Fetch prices for multiple symbols at once."""
    results, errors = await get_batch_prices(body.symbols)
    return BatchPriceResponse(prices=results, errors=errors)


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