from pydantic import BaseModel
from typing import Optional


class StockPriceResponse(BaseModel):
    symbol: str
    name: Optional[str] = None
    current_price: float
    previous_close: float
    change: float
    change_percent: float
    day_high: float
    day_low: float
    volume: int
    market_cap: Optional[float] = None


class StockHistoryPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockHistoryResponse(BaseModel):
    symbol: str
    period: str
    data: list[StockHistoryPoint]


class BatchPriceRequest(BaseModel):
    symbols: list[str]


class BatchPriceResponse(BaseModel):
    prices: list[StockPriceResponse]
    errors: list[str] = []
