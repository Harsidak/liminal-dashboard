from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Integer, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    pan_hash = Column(String, nullable=False)          # bcrypt hash of PAN card number
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    portfolios = relationship("Portfolio", back_populates="owner")
    simulations = relationship("Simulation", back_populates="user")
    cas_uploads = relationship("CASUpload", back_populates="user")
    holdings = relationship("Holding", back_populates="user")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    assets = Column(JSON, default=list)  # [{\"symbol\": \"RELIANCE\", \"allocation\": 40}, ...]
    total_value = Column(Float, default=100000.0)  # virtual money in INR
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="portfolios")
    simulations = relationship("Simulation", back_populates="portfolio")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False)
    status = Column(String, default="pending")  # pending | running | done | failed
    years = Column(Integer, default=10)
    result = Column(JSON, nullable=True)  # DRL sandbox result stored here
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="simulations")
    portfolio = relationship("Portfolio", back_populates="simulations")

class CASUpload(Base):
    __tablename__ = "cas_uploads"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending")   # pending | parsed | failed
    error_message = Column(String, nullable=True)
    holdings_count = Column(Integer, default=0)

    user = relationship("User", back_populates="cas_uploads")
    holdings = relationship("Holding", back_populates="cas_upload")

class Holding(Base):
    __tablename__ = "holdings"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    cas_upload_id = Column(String, ForeignKey("cas_uploads.id"), nullable=True)
    symbol = Column(String, nullable=False)          # e.g. "RELIANCE.NS"
    name = Column(String, nullable=False)             # e.g. "Reliance Industries Ltd"
    isin = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    avg_cost = Column(Float, nullable=True)           # purchase cost per unit
    current_price = Column(Float, nullable=True)      # last fetched price
    market_value = Column(Float, nullable=True)       # quantity * current_price
    asset_type = Column(String, default="equity")     # equity | mutual_fund | etf
    sector = Column(String, nullable=True)
    pnl = Column(Float, nullable=True)                # profit/loss
    pnl_percent = Column(Float, nullable=True)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="holdings")
    cas_upload = relationship("CASUpload", back_populates="holdings")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, default="My Watchlist")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, nullable=False)   # user | assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="chat_messages")

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    watchlist_id = Column(String, ForeignKey("watchlists.id"), nullable=False)
    symbol = Column(String, nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    watchlist = relationship("Watchlist", back_populates="items")