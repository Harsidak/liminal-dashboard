"""
Stock Price Service
===================
Fetches real-time stock prices from Yahoo Finance via yfinance.
Handles NSE (.NS) and BSE (.BO) suffixes for Indian stocks.
"""

import yfinance as yf
import logging
from typing import Optional
from app.schemas.stock import StockPriceResponse, StockHistoryPoint, StockHistoryResponse

logger = logging.getLogger(__name__)

# Valid periods for historical data
VALID_PERIODS = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"}


def _ensure_ns_suffix(symbol: str) -> str:
    """Ensure symbol has .NS suffix for NSE stocks. Skip index symbols (^...)."""
    if symbol.startswith("^"):
        return symbol  # Index symbols like ^NSEI, ^BSESN don't need a suffix
    if not symbol.endswith((".NS", ".BO")):
        return f"{symbol}.NS"
    return symbol


async def get_stock_price(symbol: str) -> StockPriceResponse:
    """Fetch current price and day stats for a single stock."""
    symbol = _ensure_ns_suffix(symbol)
    
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        current_price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
        previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose", 0)
        
        change = current_price - previous_close if current_price and previous_close else 0
        change_pct = (change / previous_close * 100) if previous_close else 0
        
        return StockPriceResponse(
            symbol=symbol,
            name=info.get("shortName") or info.get("longName", symbol),
            current_price=round(current_price, 2),
            previous_close=round(previous_close, 2),
            change=round(change, 2),
            change_percent=round(change_pct, 2),
            day_high=round(info.get("dayHigh", 0) or 0, 2),
            day_low=round(info.get("dayLow", 0) or 0, 2),
            volume=info.get("volume", 0) or 0,
            market_cap=info.get("marketCap"),
        )
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {e}")
        raise ValueError(f"Could not fetch price for {symbol}: {str(e)}")


async def get_stock_history(symbol: str, period: str = "6mo") -> StockHistoryResponse:
    """Fetch historical OHLCV data for a stock."""
    symbol = _ensure_ns_suffix(symbol)
    
    if period not in VALID_PERIODS:
        period = "6mo"
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        data = []
        for date, row in hist.iterrows():
            data.append(StockHistoryPoint(
                date=date.strftime("%Y-%m-%d"),
                open=round(row["Open"], 2),
                high=round(row["High"], 2),
                low=round(row["Low"], 2),
                close=round(row["Close"], 2),
                volume=int(row["Volume"]),
            ))
        
        return StockHistoryResponse(
            symbol=symbol,
            period=period,
            data=data,
        )
    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        raise ValueError(f"Could not fetch history for {symbol}: {str(e)}")


async def get_batch_prices(symbols: list[str]) -> tuple[list[StockPriceResponse], list[str]]:
    """Fetch prices for multiple symbols. Returns (results, errors)."""
    results = []
    errors = []
    
    for symbol in symbols:
        try:
            price = await get_stock_price(symbol)
            results.append(price)
        except Exception as e:
            errors.append(f"{symbol}: {str(e)}")
            logger.warning(f"Batch price error for {symbol}: {e}")
    
    return results, errors


async def update_holding_prices(holdings: list) -> list:
    """
    Update a list of holding dicts with current market prices.
    Adds current_price, market_value, pnl, pnl_percent fields.
    """
    for holding in holdings:
        try:
            symbol = holding.get("symbol", "")
            price_data = await get_stock_price(symbol)
            
            qty = holding.get("quantity", 0)
            avg_cost = holding.get("avg_cost", 0)
            current_price = price_data.current_price
            
            holding["current_price"] = current_price
            holding["market_value"] = round(qty * current_price, 2)
            
            if avg_cost and avg_cost > 0:
                total_cost = qty * avg_cost
                total_value = qty * current_price
                holding["pnl"] = round(total_value - total_cost, 2)
                holding["pnl_percent"] = round((total_value - total_cost) / total_cost * 100, 2)
            else:
                holding["pnl"] = 0
                holding["pnl_percent"] = 0
                
        except Exception as e:
            logger.warning(f"Could not update price for {holding.get('symbol')}: {e}")
            holding["current_price"] = holding.get("avg_cost", 0)
            holding["market_value"] = holding.get("quantity", 0) * holding.get("avg_cost", 0)
            holding["pnl"] = 0
            holding["pnl_percent"] = 0
    
    return holdings


async def search_tickers(query: str) -> list[dict]:
    """
    Search for stock symbols based on a query (e.g., 'Reliance' -> 'RELIANCE.NS').
    Uses yfinance's undocumented search logic.
    """
    try:
        # yfinance search is better suited for global symbols,
        # but it works reasonably well for Indian stocks if query is specific.
        import httpx
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        headers = {'User-Agent': 'Mozilla/5.0'}
        params = {"q": query, "quotesCount": 5, "newsCount": 0}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for quote in data.get("quotes", []):
                symbol = quote.get("symbol")
                # Filter for mostly Indian stocks (.NS, .BO) or major global ones
                if symbol:
                    results.append({
                        "symbol": symbol,
                        "name": quote.get("shortname") or quote.get("longname") or symbol,
                        "type": quote.get("quoteType", "EQUITY"),
                        "exch": quote.get("exchange")
                    })
            return results
    except Exception as e:
        logger.error(f"Ticker search error for {query}: {e}")
        # Fallback to simple suffix logic
        return [{"symbol": f"{query.upper()}.NS", "name": query, "type": "EQUITY", "exch": "NSE"}]
