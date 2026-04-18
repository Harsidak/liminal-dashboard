from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class StressTestRequest(BaseModel):
    portfolio_id: Optional[str] = None
    scenarios: List[str] = ["bear_market", "volatility_spike", "sector_crash"]

class RiskMetric(BaseModel):
    name: str
    value: float
    description: str
    unit: str = "%"

class StressTestResponse(BaseModel):
    score: float = Field(..., description="Overall risk score 0-1")
    max_drawdown: float
    var_95: float = Field(..., description="Value at Risk 95%")
    recovery_days: int
    metrics: List[RiskMetric]
    scenario_results: Dict[str, Any]
    summary: str
