# backend/app/api/v1/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...schemas import explainer as explainer_schemas
from ...schemas import simulation as simulation_schemas
from ...services.explainer_service import explainer_service
from ...services.simulation_service import simulation_service
from ...core import database
from ...api.v1.auth import get_current_user, router as auth_router # Imports get_current_user dependency

# Create an APIRouter for all API endpoints (excluding auth)
router = APIRouter()

@router.post("/explainer/shap-narrative", response_model=explainer_schemas.ExplainerResponse)
async def generate_explanation_route(
    request: explainer_schemas.ExplainerRequest, 
    # Optional: Protected with auth (requires login)
    # current_user: models.User = Depends(get_current_user) 
):
    """Generates an AI narrative explanation for complex SHAP model outputs."""
    try:
        explanation_response = await explainer_service.generate_explanation(request)
        return explanation_response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the explanation: {str(e)}"
        )

@router.post("/simulation/market-scenario", response_model=simulation_schemas.SimulationOutput)
def run_simulation_route(
    request: simulation_schemas.SimulationInput,
    # Optional: Protected with auth (requires login)
    # current_user: models.User = Depends(get_current_user)
):
    """Runs a Monte Carlo simulation for a specific market scenario."""
    try:
        simulation_results = simulation_service.run_market_simulation(request)
        return simulation_results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during the simulation: {str(e)}"
        )