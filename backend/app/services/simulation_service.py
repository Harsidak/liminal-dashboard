from uuid import uuid4

from app.schemas.simulation import SimulationPoint, SimulationRequest, SimulationResponse


def run_chrono_sandbox(request: SimulationRequest) -> SimulationResponse:
    horizon_months = request.horizon_years * 12
    points: list[SimulationPoint] = []
    base_value = 100.0

    for month in range(1, horizon_months + 1):
        growth = 1 + (0.004 if request.risk_profile == "moderate" else 0.006)
        stress_penalty = 0.003 + (0.001 if request.risk_profile == "high" else 0)
        optimistic = base_value * (growth + 0.002)
        stressed = base_value * (growth - stress_penalty)
        base_value = base_value * growth

        points.append(
            SimulationPoint(
                month=month,
                optimistic=round(optimistic, 2),
                base=round(base_value, 2),
                stressed=round(stressed, 2),
            )
        )

    return SimulationResponse(
        scenario_id=str(uuid4()),
        confidence=0.87,
        loss_probability=0.18 if request.risk_profile == "moderate" else 0.26,
        drawdown_estimate=0.11 if request.risk_profile == "moderate" else 0.19,
        points=points,
    )
