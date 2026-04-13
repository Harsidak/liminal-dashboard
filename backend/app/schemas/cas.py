from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CASUploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    holdings_count: int
    error_message: Optional[str] = None
    upload_date: datetime

    class Config:
        from_attributes = True


class HoldingResponse(BaseModel):
    id: str
    symbol: str
    name: str
    isin: Optional[str] = None
    quantity: float
    avg_cost: Optional[float] = None
    current_price: Optional[float] = None
    market_value: Optional[float] = None
    asset_type: str
    sector: Optional[str] = None
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None

    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    total_invested: float
    current_value: float
    total_pnl: float
    total_pnl_percent: float
    holdings_count: int


class AllocationItem(BaseModel):
    sector: str
    value: float
    percentage: float
    color: Optional[str] = None


class AllocationResponse(BaseModel):
    by_sector: list[AllocationItem]
    by_asset_type: list[AllocationItem]
