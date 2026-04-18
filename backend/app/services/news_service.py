import httpx
import logging
from typing import List, Dict
from app.core.config import settings

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
            {"title": "Markets hit all time high", "description": "Nifty surges past 25,000", "url": "#", "source": {"name": "MockNews"}},
            {"title": "Tech stocks rally", "description": "IT sector shows strong recovery", "url": "#", "source": {"name": "MockNews"}},
        ]

    url = "https://newsapi.org/v2/top-headlines"
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
