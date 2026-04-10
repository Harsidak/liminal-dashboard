from pydantic import BaseModel, Field


class PortfolioFactor(BaseModel):
    factor: str
    contribution: float = Field(ge=-1, le=1)


class ExplainerRequest(BaseModel):
    locale: str = Field(default="en")
    asset_name: str = Field(min_length=2)
    factors: list[PortfolioFactor] = Field(default_factory=list)


class ExplainerResponse(BaseModel):
    title: str
    summary: str
    confidence: float
    dominant_factors: list[PortfolioFactor]
