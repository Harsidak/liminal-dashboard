from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class SimulationCreate(BaseModel):
    portfolio_id: str
    years: int = 10

class SimulationResponse(BaseModel):
    id: str
    portfolio_id: str
    status: str
    years: int
    result: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True