from fastapi import APIRouter

from app.schemas.explainer import ExplainerRequest, ExplainerResponse
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.explainer_service import build_explainer_response
from app.services.simulation_service import run_chrono_sandbox

router = APIRouter()


@router.post("/simulations/chrono-sandbox", response_model=SimulationResponse, tags=["simulations"])
async def chrono_sandbox(payload: SimulationRequest) -> SimulationResponse:
    return run_chrono_sandbox(payload)


@router.post("/explainer/portfolio", response_model=ExplainerResponse, tags=["explainer"])
async def portfolio_explainer(payload: ExplainerRequest) -> ExplainerResponse:
    return build_explainer_response(payload)
