# backend/app/schemas/simulation.py
from pydantic import BaseModel
from typing import List, Dict  

class SimulationInput(BaseModel):
    assets: List[str]
    time_horizon_years: int
    num_simulations: int = 1000

class SimulationOutput(BaseModel):
    projected_returns: List[float]
    summary_statistics: Dict[str, float] 