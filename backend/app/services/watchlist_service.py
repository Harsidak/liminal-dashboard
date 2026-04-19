from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.models import Watchlist, WatchlistItem
import uuid
from typing import List, Optional

async def get_user_watchlists(db: AsyncSession, user_id: str) -> List[Watchlist]:
    """Returns all watchlists for a user with items eager-loaded."""
    result = await db.execute(
        select(Watchlist)
        .where(Watchlist.user_id == user_id)
        .options(selectinload(Watchlist.items))
    )
    watchlists = result.scalars().all()
    
    # If no watchlists exist, create a default one
    if not watchlists:
        default_list = await create_watchlist(db, user_id, "My Watchlist")
        return [default_list]
        
    return watchlists

async def get_watchlist_by_id(db: AsyncSession, user_id: str, watchlist_id: str) -> Optional[Watchlist]:
    """Retrieves a specific watchlist for a user."""
    result = await db.execute(
        select(Watchlist).where(
            Watchlist.id == watchlist_id,
            Watchlist.user_id == user_id
        )
    )
    return result.scalar_one_or_none()

async def create_watchlist(db: AsyncSession, user_id: str, name: str) -> Watchlist:
    """Creates a new named watchlist."""
    watchlist = Watchlist(id=str(uuid.uuid4()), user_id=user_id, name=name)
    db.add(watchlist)
    await db.commit()
    await db.refresh(watchlist)
    return watchlist

async def delete_watchlist(db: AsyncSession, user_id: str, watchlist_id: str) -> bool:
    """Deletes a watchlist and its items."""
    watchlist = await get_watchlist_by_id(db, user_id, watchlist_id)
    if not watchlist:
        return False
        
    await db.execute(delete(Watchlist).where(Watchlist.id == watchlist_id))
    await db.commit()
    return True

async def get_watchlist_items(db: AsyncSession, watchlist_id: str) -> list[str]:
    """Returns a list of symbols in a specific watchlist."""
    result = await db.execute(select(WatchlistItem).where(WatchlistItem.watchlist_id == watchlist_id))
    items = result.scalars().all()
    return [item.symbol for item in items]

async def add_to_watchlist(db: AsyncSession, watchlist_id: str, symbol: str) -> bool:
    """Adds a symbol to a specific watchlist."""
    # Check if already exists in this list
    existing = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.watchlist_id == watchlist_id,
            WatchlistItem.symbol == symbol
        )
    )
    if existing.scalar_one_or_none():
        return False
        
    item = WatchlistItem(id=str(uuid.uuid4()), watchlist_id=watchlist_id, symbol=symbol)
    db.add(item)
    await db.commit()
    return True

async def remove_from_watchlist(db: AsyncSession, watchlist_id: str, symbol: str) -> bool:
    """Removes a symbol from a specific watchlist."""
    existing = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.watchlist_id == watchlist_id,
            WatchlistItem.symbol == symbol
        )
    )
    item = existing.scalar_one_or_none()
    if not item:
        return False
        
    await db.execute(delete(WatchlistItem).where(WatchlistItem.id == item.id))
    await db.commit()
    return True
