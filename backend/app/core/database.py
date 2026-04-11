from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use SQLite for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./liminal.db"

# Create the database engine
# connect_args={"check_same_thread": False} is required only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a SessionLocal class (a factory for new sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
Base = declarative_base()

# Dependency to get a database session for a single request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()