from pydantic import BaseModel
from typing import List, Optional

class AssetExplainRequest(BaseModel):
    symbol: str                         # e.g. "RELIANCE"
    current_price: float
    change_percent: float               # e.g. -4.2
    factors: dict                       # raw factor weights, e.g. {"inflation": 0.4, "sector_news": 0.6}
    language: str = "english"           # english | hindi

class ExplainerResponse(BaseModel):
    symbol: str
    explanation: str                    # plain-language output from Claude
    shap_values: Optional[dict] = None