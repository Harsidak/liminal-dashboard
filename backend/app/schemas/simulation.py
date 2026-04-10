from pydantic import BaseModel, Field


class AssetAllocation(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)
    weight: float = Field(gt=0, le=1)


class SimulationRequest(BaseModel):
    horizon_years: int = Field(default=5, ge=1, le=30)
    risk_profile: str = Field(default="moderate")
    allocations: list[AssetAllocation] = Field(default_factory=list)


class SimulationPoint(BaseModel):
    month: int
    optimistic: float
    base: float
    stressed: float


class SimulationResponse(BaseModel):
    scenario_id: str
    confidence: float
    loss_probability: float
    drawdown_estimate: float
    points: list[SimulationPoint]
