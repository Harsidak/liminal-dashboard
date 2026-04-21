import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.core.config import settings
from app.core.models import Holding, User, ChatMessage
from app.services.analytics_service import get_portfolio_summary, get_allocation
from app.services.watchlist_service import get_watchlist_items

logger = logging.getLogger(__name__)

async def _build_portfolio_context(db: AsyncSession, user_id: str) -> str:
    lines = []

    result = await db.execute(select(Holding).where(Holding.user_id == user_id))
    holdings = result.scalars().all()

    if holdings:
        lines.append(f"User has {len(holdings)} holdings:")
        for h in holdings[:20]:
            name = h.name or h.symbol or "Unknown"
            qty = h.quantity or 0
            avg = h.avg_cost or 0
            cur = h.current_price or avg
            pnl = round((cur - avg) * qty, 2) if avg else 0
            sector = h.sector or "Unknown"
            lines.append(
                f"  - {name} ({h.symbol}): {qty} shares, avg ₹{avg:.2f}, "
                f"current ₹{cur:.2f}, P&L ₹{pnl:+.2f}, sector: {sector}"
            )
    else:
        lines.append("User has no holdings yet.")

    try:
        summary = await get_portfolio_summary(db, user_id)
        lines.append(
            f"\nPortfolio Summary: Invested ₹{summary.total_invested:,.2f}, "
            f"Current Value ₹{summary.current_value:,.2f}, "
            f"P&L ₹{summary.total_pnl:+,.2f} ({summary.total_pnl_percent:+.2f}%)"
        )
    except Exception:
        pass

    try:
        alloc = await get_allocation(db, user_id)
        if alloc.by_sector:
            top_sectors = alloc.by_sector[:5]
            sector_str = ", ".join(f"{s.sector} ({s.percentage:.1f}%)" for s in top_sectors)
            lines.append(f"Top sectors: {sector_str}")
    except Exception:
        pass

    try:
        watchlist = await get_watchlist_items(db, user_id)
        if watchlist:
            lines.append(f"Watchlist: {', '.join(watchlist[:10])}")
    except Exception:
        pass

    return "\n".join(lines)


async def chat_with_user(
    db: AsyncSession,
    user: User,
    message: str,
    history: list[ChatMessage] = None
) -> str:

    # ── Debug: print what keys are loaded ──────────────────────────────────────
    logger.info(f"GEMINI_API_KEY loaded: {bool(settings.GEMINI_API_KEY)}")
    logger.info(f"GROQ_API_KEY loaded:   {bool(settings.GROQ_API_KEY)}")

    context = await _build_portfolio_context(db, str(user.id))

    system_prompt = f"""You are Liminal AI, a friendly and knowledgeable financial assistant embedded in the Liminal portfolio analytics platform.

RULES:
- Be concise but helpful (2-4 sentences max unless the user asks for detail).
- Use simple language a college student can understand.
- Be encouraging and reassuring about market volatility.
- NEVER mention, ask about, or reveal the user's PAN card or any sensitive identity info.
- If the user asks about something outside finance/investing, politely redirect.
- Use Indian market context (NSE/BSE, ₹ currency).
- Reference the user's actual portfolio data when relevant.

USER'S PORTFOLIO DATA:
{context}

USER'S NAME: {user.full_name or 'Investor'}
"""

    messages = [SystemMessage(content=system_prompt)]

    if history:
        for msg in history[-10:]:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=message))

    # ATTEMPT 1: Gemini
    if settings.GEMINI_API_KEY:
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.7
            )
            response = await llm.ainvoke(messages)
            logger.info("Response from Gemini OK")
            return response.content
        except Exception as e:
            logger.error(f"Gemini error: {e}", exc_info=True)  # full traceback now
    else:
        logger.warning("GEMINI_API_KEY is empty — skipping Gemini")

    # ATTEMPT 2: Groq
    if settings.GROQ_API_KEY:
        try:
            llm = ChatGroq(
                model_name="llama-3.3-70b-versatile",
                groq_api_key=settings.GROQ_API_KEY,
                temperature=0.7
            )
            response = await llm.ainvoke(messages)
            logger.info("Response from Groq OK")
            return response.content
        except Exception as e:
            logger.error(f"Groq error: {e}", exc_info=True)  # full traceback now
    else:
        logger.warning("GROQ_API_KEY is empty — skipping Groq")

    # FALLBACK
    return (
        "I'm experiencing a temporary connection issue. "
        "Please check that your API keys are configured in the .env file."
    )
