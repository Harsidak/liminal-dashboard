import os
import uuid
import traceback
import logging

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
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
from app.schemas.stock import StockPriceResponse, StockHistoryResponse, BatchPriceRequest, BatchPriceResponse
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse, WatchlistSimpleResponse, WatchlistItemAdd
from app.schemas.cas import CASUploadResponse, HoldingResponse, PortfolioSummary, AllocationResponse
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.schemas.explainer import AssetExplainRequest, ExplainerResponse
from app.schemas.stress import StressTestResponse
from app.schemas.chat import ChatRequest, ChatHistoryResponse, ChatMessageResponse

from app.services.stress_test_service import stress_test_service
from app.services.stock_service import get_stock_price, get_stock_history, get_batch_prices, update_holding_prices, search_tickers
from app.services.analytics_service import get_portfolio_summary, get_allocation
from app.services.news_service import fetch_market_news
from app.services.chatbot_service import chat_with_user
from app.services.cas_parser import decrypt_and_parse
from app.services.simulation_service import create_simulation, get_simulation
from app.services.explainer_service import explain_asset

from typing import List
from pydantic import BaseModel

router = APIRouter()
bearer_scheme = HTTPBearer()


# ─── Dependency: get current logged-in user ───────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        if not payload:
            logger.warning(f"Auth failed: Invalid or expired token. Token starts with: {credentials.credentials[:10]}...")
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"Auth failed: User not found for ID: {user_id}")
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Auth system error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication system error")


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
    # DO NOT include sensitive data like PAN in JWT (it's base64 and easily decoded)
    token = create_access_token({"sub": user.id})
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

@router.post("/cas/upload", response_model=CASUploadResponse)
async def upload_cas(
    file: UploadFile = File(...),
    pan: str = Form(..., description="PAN card number for PDF decryption"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and parse a CAS PDF. PAN must be provided directly."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    user_id = current_user.id
    pan = pan.strip().upper()
    
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
        print(traceback.format_exc())
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
async def stock_price(symbol: str):
    """Get current price for a single stock."""
    try:
        return await get_stock_price(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/stocks/history/{symbol}", response_model=StockHistoryResponse)
async def stock_history(
    symbol: str,
    period: str = Query("6mo", description="1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max"),
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



@router.post("/portfolio/stress-test", response_model=StressTestResponse)
async def portfolio_stress_test(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run a PPO-backed stress test for the user's portfolio."""
    return await stress_test_service.run_stress_test(db, current_user.id)

# ─── MARKET DATA, NEWS & WATCHLIST ───────────────────────────────────────────

@router.get("/market/snapshot")
async def market_snapshot():
    # NIFTY 50, SENSEX, BANK NIFTY
    symbols = ["^NSEI", "^BSESN", "^NSEBANK"]
    results, _ = await get_batch_prices(symbols)
    return results

@router.get("/market/movers")
async def market_movers():
    # For a real app, query NSE top gainers/losers API.
    # Here, we'll check a preset top liquid stocks.
    symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "SBIN.NS", "BHARTIARTL.NS"]
    results, _ = await get_batch_prices(symbols)
    
    # Sort by percentage change
    sorted_res = sorted(results, key=lambda x: x.change_percent, reverse=True)
    return {
        "gainers": sorted_res[:3],
        "losers": sorted_res[-3:]
    }

@router.get("/news")
async def market_news():
    return await fetch_market_news()

@router.get("/stocks/search")
async def search_stocks(query: str = Query(..., min_length=2)):
    """Search for tickers by name."""
    return await search_tickers(query)

@router.get("/stocks/collection/{theme}")
async def get_collection(theme: str):
    """Get thematic stock collections."""
    collections = {
        "Technology": ["TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "LTIM.NS"],
        "EVs": ["TATAMOTORS.NS", "M&M.NS", "ASHOKLEY.NS", "SONACOMS.NS", "OLECTRA.NS"],
        "Banking": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "AXISBANK.NS", "KOTAKBANK.NS"],
        "Green Energy": ["ADANIGREEN.NS", "TATAPOWER.NS", "IREDA.NS", "SUZLON.NS", "NHPC.NS"]
    }
    symbols = collections.get(theme, [])
    if not symbols:
        raise HTTPException(status_code=404, detail="Collection not found")
    results, _ = await get_batch_prices(symbols)
    return results

# ─── WATCHLISTS (MULTI-LIST) ──────────────────────────────────────────────────

@router.get("/watchlists", response_model=List[WatchlistSimpleResponse])
async def list_watchlists(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    from app.services.watchlist_service import get_user_watchlists
    lists = await get_user_watchlists(db, current_user.id)
    return [
        WatchlistSimpleResponse(
            id=l.id,
            name=l.name,
            item_count=len(l.items),
            created_at=l.created_at
        ) for l in lists
    ]

@router.post("/watchlists", response_model=WatchlistSimpleResponse)
async def create_new_watchlist(
    body: WatchlistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.watchlist_service import create_watchlist
    l = await create_watchlist(db, current_user.id, body.name)
    return WatchlistSimpleResponse(
        id=l.id,
        name=l.name,
        item_count=0,
        created_at=l.created_at
    )

@router.get("/watchlists/{watchlist_id}", response_model=WatchlistResponse)
async def get_watchlist_details(
    watchlist_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.watchlist_service import get_watchlist_by_id, get_watchlist_items
    l = await get_watchlist_by_id(db, current_user.id, watchlist_id)
    if not l:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    symbols = await get_watchlist_items(db, watchlist_id)
    prices = []
    if symbols:
        prices, _ = await get_batch_prices(symbols)
        
    return WatchlistResponse(
        id=l.id,
        user_id=l.user_id,
        name=l.name,
        items=prices,
        created_at=l.created_at
    )

@router.delete("/watchlists/{watchlist_id}")
async def remove_watchlist_list(
    watchlist_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.watchlist_service import delete_watchlist
    success = await delete_watchlist(db, current_user.id, watchlist_id)
    if not success:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    return {"message": "Watchlist deleted"}

@router.post("/watchlists/{watchlist_id}/items")
async def add_item_to_list(
    watchlist_id: str,
    body: WatchlistItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.watchlist_service import get_watchlist_by_id, add_to_watchlist
    l = await get_watchlist_by_id(db, current_user.id, watchlist_id)
    if not l:
        raise HTTPException(status_code=404, detail="Watchlist not found")
        
    added = await add_to_watchlist(db, watchlist_id, body.symbol.upper())
    if not added:
        raise HTTPException(status_code=400, detail="Symbol already in list")
    return {"message": "Added to watchlist"}

@router.delete("/watchlists/{watchlist_id}/items/{symbol}")
async def remove_item_from_list(
    watchlist_id: str,
    symbol: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.watchlist_service import remove_from_watchlist
    success = await remove_from_watchlist(db, watchlist_id, symbol.upper())
    if not success:
        raise HTTPException(status_code=404, detail="Symbol not found in list")
    return {"message": "Removed from watchlist"}

# Legacy endpoints for backward compatibility
@router.get("/watchlist")
async def get_default_watchlist(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.services.watchlist_service import get_user_watchlists, get_watchlist_items
    lists = await get_user_watchlists(db, current_user.id)
    if not lists: return []
    symbols = await get_watchlist_items(db, lists[0].id)
    if not symbols: return []
    prices, _ = await get_batch_prices(symbols)
    return prices

# ─── CHATBOT ────────────────────────────────────────────────────────────────────

@router.get("/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve user's chat history."""
    from app.core.models import ChatMessage
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.timestamp.asc())
    )
    messages = result.scalars().all()
    # Manual conversion to ensure timestamp is handled
    return ChatHistoryResponse(messages=[ChatMessageResponse(
        id=m.id,
        role=m.role,
        content=m.content,
        timestamp=m.timestamp
    ) for m in messages])

@router.post("/chat")
async def chat_endpoint(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI chatbot that has access to user's portfolio context and history."""
    from app.core.models import ChatMessage
    
    # 1. Save user message
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        role="user",
        content=body.message
    )
    db.add(user_msg)
    
    # 2. Get history for context
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(10)
    )
    history = list(reversed(result.scalars().all()))
    
    # 3. Get AI reply
    reply_content = await chat_with_user(db, current_user, body.message, history)
    
    # 4. Save AI message
    ai_msg = ChatMessage(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        role="assistant",
        content=reply_content
    )
    db.add(ai_msg)
    
    await db.commit()
    
    return {"reply": reply_content}