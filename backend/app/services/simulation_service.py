import json
import asyncio
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.models import Simulation, Portfolio
import uuid

async def create_simulation(
    db: AsyncSession,
    user_id: str,
    portfolio_id: str,
    years: int
) -> Simulation:
    sim = Simulation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        portfolio_id=portfolio_id,
        years=years,
        status="pending"
    )
    db.add(sim)
    await db.commit()
    await db.refresh(sim)

    # In production: publish to Kafka so friend's DRL picks it up
    # For now: run a mock simulation inline
    asyncio.create_task(_run_mock_simulation(db, sim.id))

    return sim

async def _run_mock_simulation(db: AsyncSession, sim_id: str):
    """
    MOCK: Replace this with Kafka publish to your friend's DRL sandbox.
    His service will consume the job, run TimeGAN, and publish results back.
    """
    await asyncio.sleep(2)  # fake processing time

    mock_result = {
        "timelines": [
            {
                "scenario": "base_case",
                "final_value": 185000,
                "max_drawdown": -18.4,
                "recovery_months": 11,
                "cagr": 9.2
            },
            {
                "scenario": "bear_case",
                "final_value": 92000,
                "max_drawdown": -42.1,
                "recovery_months": 28,
                "cagr": -0.8
            },
            {
                "scenario": "bull_case",
                "final_value": 310000,
                "max_drawdown": -8.2,
                "recovery_months": 5,
                "cagr": 15.4
            }
        ],
        "inflation_eroded_cash": 67000,
        "loss_probability_5yr": 0.18,
        "message": "Even in the worst case, staying invested beats holding cash."
    }

    # Save result back to DB
    from sqlalchemy import update
    stmt = (
        select(Simulation).where(Simulation.id == sim_id)
    )
    async with db.begin():
        result = await db.execute(stmt)
        sim = result.scalar_one_or_none()
        if sim:
            sim.status = "done"
            sim.result = mock_result
            await db.commit()

async def get_simulation(db: AsyncSession, sim_id: str) -> Optional[Simulation]:
    result = await db.execute(select(Simulation).where(Simulation.id == sim_id))
    return result.scalar_one_or_none()