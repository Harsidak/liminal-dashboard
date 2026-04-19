from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.stock import StockPriceResponse

class WatchlistItemAdd(BaseModel):
    symbol: str

class WatchlistCreate(BaseModel):
    name: str

class WatchlistUpdate(BaseModel):
    name: str

class WatchlistResponse(BaseModel):
    id: str
    user_id: str
    name: str
    items: List[StockPriceResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class WatchlistSimpleResponse(BaseModel):
    id: str
    name: str
    item_count: int
    created_at: datetime

    class Config:
        from_attributes = True
