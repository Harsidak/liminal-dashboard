from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.models import Watchlist, WatchlistItem
import uuid

async def get_user_watchlist(db: AsyncSession, user_id: str) -> Watchlist:
    """Gets or creates a watchlist for the user."""
    result = await db.execute(select(Watchlist).where(Watchlist.user_id == user_id))
    watchlist = result.scalar_one_or_none()
    
    if not watchlist:
        watchlist = Watchlist(id=str(uuid.uuid4()), user_id=user_id)
        db.add(watchlist)
        await db.commit()
        await db.refresh(watchlist)
        
    return watchlist

async def get_watchlist_items(db: AsyncSession, user_id: str) -> list[str]:
    """Returns a list of symbols in the user's watchlist."""
    watchlist = await get_user_watchlist(db, user_id)
    result = await db.execute(select(WatchlistItem).where(WatchlistItem.watchlist_id == watchlist.id))
    items = result.scalars().all()
    return [item.symbol for item in items]

async def add_to_watchlist(db: AsyncSession, user_id: str, symbol: str) -> bool:
    """Adds a symbol to the user's watchlist. Returns True if added, False if already exists."""
    watchlist = await get_user_watchlist(db, user_id)
    
    # Check if already exists
    existing = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.watchlist_id == watchlist.id,
            WatchlistItem.symbol == symbol
        )
    )
    if existing.scalar_one_or_none():
        return False
        
    item = WatchlistItem(id=str(uuid.uuid4()), watchlist_id=watchlist.id, symbol=symbol)
    db.add(item)
    await db.commit()
    return True

async def remove_from_watchlist(db: AsyncSession, user_id: str, symbol: str) -> bool:
    """Removes a symbol from the user's watchlist. Returns True if removed, False if not found."""
    watchlist = await get_user_watchlist(db, user_id)
    
    # Check if exists
    existing = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.watchlist_id == watchlist.id,
            WatchlistItem.symbol == symbol
        )
    )
    item = existing.scalar_one_or_none()
    if not item:
        return False
        
    await db.execute(
        delete(WatchlistItem).where(
            WatchlistItem.id == item.id
        )
    )
    await db.commit()
    return True
