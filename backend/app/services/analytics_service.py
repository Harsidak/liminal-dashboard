"""
Analytics Service
=================
Generates portfolio analytics: allocation breakdowns, P&L summary,
and sector distribution from user holdings.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.models import Holding
from app.schemas.cas import AllocationItem, AllocationResponse, PortfolioSummary

# Color palette for charts (indigo/purple spectrum matching frontend theme)
SECTOR_COLORS = {
    "IT": "#6366F1",
    "Banking": "#8B5CF6",
    "Energy": "#A78BFA",
    "Pharma": "#C4B5FD",
    "FMCG": "#818CF8",
    "Telecom": "#7C3AED",
    "Automobile": "#5B21B6",
    "Infrastructure": "#4C1D95",
    "Finance": "#6D28D9",
    "Metals": "#4338CA",
    "Power": "#3730A3",
    "Consumer": "#312E81",
    "Paint": "#4F46E5",
    "Cement": "#7DD3FC",
    "Healthcare": "#22D3EE",
    "Mining": "#14B8A6",
    "Conglomerate": "#F472B6",
    "Other": "#9CA3AF",
}

ASSET_TYPE_COLORS = {
    "equity": "#6366F1",
    "mutual_fund": "#8B5CF6",
    "etf": "#A78BFA",
}


async def get_portfolio_summary(db: AsyncSession, user_id: str) -> PortfolioSummary:
    """Calculate overall portfolio P&L summary."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id)
    )
    holdings = result.scalars().all()

    total_invested = 0.0
    current_value = 0.0

    for h in holdings:
        cost = (h.avg_cost or 0) * (h.quantity or 0)
        value = (h.current_price or h.avg_cost or 0) * (h.quantity or 0)
        total_invested += cost
        current_value += value

    total_pnl = current_value - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100) if total_invested > 0 else 0

    return PortfolioSummary(
        total_invested=round(total_invested, 2),
        current_value=round(current_value, 2),
        total_pnl=round(total_pnl, 2),
        total_pnl_percent=round(total_pnl_pct, 2),
        holdings_count=len(holdings),
    )


async def get_allocation(db: AsyncSession, user_id: str) -> AllocationResponse:
    """Calculate portfolio allocation by sector and asset type."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id)
    )
    holdings = result.scalars().all()

    # Calculate total value
    total_value = sum(
        (h.market_value or (h.current_price or h.avg_cost or 0) * h.quantity)
        for h in holdings
    )

    if total_value == 0:
        return AllocationResponse(by_sector=[], by_asset_type=[])

    # Group by sector
    sector_values: dict[str, float] = {}
    for h in holdings:
        sector = h.sector or "Other"
        value = h.market_value or (h.current_price or h.avg_cost or 0) * h.quantity
        sector_values[sector] = sector_values.get(sector, 0) + value

    by_sector = [
        AllocationItem(
            sector=sector,
            value=round(value, 2),
            percentage=round(value / total_value * 100, 2),
            color=SECTOR_COLORS.get(sector, "#9CA3AF"),
        )
        for sector, value in sorted(sector_values.items(), key=lambda x: -x[1])
    ]

    # Group by asset type
    type_values: dict[str, float] = {}
    for h in holdings:
        atype = h.asset_type or "equity"
        value = h.market_value or (h.current_price or h.avg_cost or 0) * h.quantity
        type_values[atype] = type_values.get(atype, 0) + value

    by_asset_type = [
        AllocationItem(
            sector=atype,
            value=round(value, 2),
            percentage=round(value / total_value * 100, 2),
            color=ASSET_TYPE_COLORS.get(atype, "#9CA3AF"),
        )
        for atype, value in sorted(type_values.items(), key=lambda x: -x[1])
    ]

    return AllocationResponse(by_sector=by_sector, by_asset_type=by_asset_type)
