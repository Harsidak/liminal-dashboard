import httpx
import logging
from typing import List, Dict
from app.core.config import settings
import os 
import dotenv
dotenv.load_dotenv()
logger = logging.getLogger(__name__)

# A simple in-memory cache to prevent hitting rate limits
# In a real production system, this should be Redis.
_news_cache: Dict[str, dict] = {}
_CACHE_TTL = 3600  # 1 hour

import time

async def fetch_market_news() -> List[dict]:
    """
    Fetch top business and market news using NewsAPI.
    Uses caching to avoid API rate limits.
    """
    cache_key = "market_news"
    now = time.time()
    
    # Return from cache if valid
    if cache_key in _news_cache:
        cached_data = _news_cache[cache_key]
        if now - cached_data["timestamp"] < _CACHE_TTL:
            return cached_data["articles"]

    api_key = settings.NEWS_API
    if not api_key:
        logger.warning("No NEWS_API key configured. Returning mock news.")
        return [
            {"title": "Nifty 50 approaches all-time high amid global rally", "description": "Indian benchmarks continued their upward trajectory as banking and IT stocks led the charge.", "url": "https://economictimes.indiatimes.com/markets", "source": {"name": "ET Markets"}},
            {"title": "RBI keeps repo rates unchanged for 7th consecutive time", "description": "The central bank maintains its withdrawal of accommodation stance to curb inflation within target limits.", "url": "https://www.livemint.com/economy", "source": {"name": "LiveMint"}},
            {"title": "Reliance Industries announces major expansion in Green Energy", "description": "RIL shares rose 2% after unveiling a new roadmap for its solar and hydrogen ecosystem integration.", "url": "https://www.moneycontrol.com/", "source": {"name": "MoneyControl"}},
            {"title": "FIIs turn net buyers in Indian equity market this week", "description": "Foreign institutional investors pumped over \u20b95,000 crore into domestic equities, signaling confidence.", "url": "https://www.reuters.com/markets/india", "source": {"name": "Reuters"}},
            {"title": "IT sector earnings show signs of demand recovery", "description": "Leading IT firms reported steady deal pipelines despite macroeconomic headwinds in the US and Europe.", "url": "https://www.bloomberg.com/asia", "source": {"name": "Bloomberg"}},
            {"title": "Zomato and Swiggy see surge in deliveries during festive season", "description": "Food-tech platforms report record-breaking order volumes as consumer spending picks up.", "url": "https://techcrunch.com/", "source": {"name": "TechCrunch"}},
            {"title": "HDFC Bank merger synergies start reflecting in quarterly results", "description": "Analysts remain bullish on the private lender as deposit growth outpaces industry averages.", "url": "https://www.ndtv.com/business", "source": {"name": "NDTV Business"}},
            {"title": "Crude oil prices stabilize, easing inflation fears for India", "description": "Brent crude dipped to $78 per barrel, providing relief to India's fiscal deficit and fuel retailers.", "url": "https://www.cnbc.com/markets", "source": {"name": "CNBC"}},
        ]

    url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={NEWS_API}"
    params = {
        "category": "business",
        "country": "in",  # India specific business news
        "apiKey": api_key,
        "pageSize": 5
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            articles = data.get("articles", [])
            
            # Save to cache
            _news_cache[cache_key] = {
                "timestamp": now,
                "articles": articles
            }
            return articles
            
    except Exception as e:
        logger.error(f"Failed to fetch news: {e}")
        # Return fallback
        return []
