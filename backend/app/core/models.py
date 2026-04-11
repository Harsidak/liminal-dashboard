from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # A user has one portfolio
    portfolio = relationship("Portfolio", back_populates="user", uselist=False)

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    balance = Column(Float, default=10000.0)
    user_id = Column(Integer, ForeignKey("users.id"))

    # A portfolio belongs to one user
    user = relationship("User", back_populates="portfolio")
    # A portfolio contains many asset holdings
    holdings = relationship("Holding", back_populates="portfolio")

class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    average_price = Column(Float, nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))

    # A holding belongs to one portfolio
    portfolio = relationship("Portfolio", back_populates="holdings")