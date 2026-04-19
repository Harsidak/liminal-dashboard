import os
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.models import Holding
from app.schemas.stress import StressTestResponse, RiskMetric

logger = logging.getLogger(__name__)

class StressTestService:
    def __init__(self):
        # Path relative to backend/app/services/stress_test_service.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(current_dir, "..", "assets", "models", "ppo_agent")
        self.model = None
        
        # Target assets for the PPO model (must match sandbox/src/main.py)
        self.target_tickers = [
            "NIFTYBEES.NS",  # Index
            "RELIANCE.NS",   # Energy
            "HDFCBANK.NS",   # Finance
            "GOLDBEES.NS",   # Commodities
            "INFY.NS"        # IT
        ]
        
        self._load_model()

    def _load_model(self):
        """Load the MaskablePPO model from extracted weights."""
        try:
            # We use MaskablePPO because the agent uses a MaskableActorCriticPolicy
            from sb3_contrib import MaskablePPO
            zip_path = os.path.join(self.model_path, "LiminalAgent.zip")
            if os.path.exists(zip_path):
                self.model = MaskablePPO.load(zip_path)
                logger.info("MaskablePPO model loaded successfully from zip")
            elif os.path.exists(self.model_path):
                # If extracted, we'd typically need the original zip or a specific format
                # For now, let's assume we can load from the zip if present.
                pass
        except Exception as e:
            logger.error(f"Failed to load PPO model: {e}")

    def build_ppo_observation(self, holdings: List[Holding], cash: float, market_data: Dict[str, Any]) -> np.ndarray:
        """
        Construct the 41-feature vector for the PPO model.
        [1] Cash, [5] Prices, [5] Holdings, [30] Tech Indicators
        """
        # 1. Map holdings to the 5 buckets
        mapped_holdings = np.zeros(5)
        bucket_map = {
            "IT": 4, "Technology": 4,
            "Banking": 2, "Finance": 2, "Financial Services": 2,
            "Energy": 1, "Oil & Gas": 1,
            "Metals": 3, "Gold": 3, "Commodities": 3,
            "Infrastructure": 0, "Other": 0 # Default to Index
        }
        
        for h in holdings:
            bucket_idx = bucket_map.get(h.sector, 0)
            mapped_holdings[bucket_idx] += h.quantity or 0

        # 2. Extract Prices and Indicators
        prices = np.zeros(5)
        indicators = np.zeros(30) # 6 metrics * 5 stocks
        
        for i, ticker in enumerate(self.target_tickers):
            data = market_data.get(ticker, {})
            prices[i] = data.get("price", 100.0) # Fallback price
            
            # 6 indicators per stock: MACD, RSI, VIX, TNX, GOLD, VOLUME
            # NOTE: In our 41-feature model, VIX/TNX/GOLD are shared but repeated per stock
            indicators[i*6]     = data.get("macd", 0.0)
            indicators[i*6 + 1] = data.get("rsi", 50.0)
            indicators[i*6 + 2] = market_data.get("VIX", 15.0)
            indicators[i*6 + 3] = market_data.get("TNX", 4.0)
            indicators[i*6 + 4] = market_data.get("GOLD", 2000.0)
            indicators[i*6 + 5] = data.get("volume", 1000000)

        # 3. Concatenate (Total 41)
        obs = np.concatenate([
            [cash],
            prices,
            mapped_holdings,
            indicators
        ]).astype(np.float32)
        
        return obs

    async def run_stress_test(self, db: AsyncSession, user_id: str) -> StressTestResponse:
        """
        Run a simulation of market stress on the user's current holdings.
        Scenarios: Bear Market (-20% info), Volatility Spike, Sector Crash.
        """
        result = await db.execute(select(Holding).where(Holding.user_id == user_id))
        holdings = result.scalars().all()
        
        if not holdings:
            return self._empty_response()

        total_value = sum(h.market_value or 0 for h in holdings)
        
        # Scenario 1: Bear Market (-25% across board, flight to safety)
        bear_impact = self._simulate_scenario(holdings, market_drop=-0.25, volatility=0.4)
        
        # Scenario 2: Sector specific crash (e.g. IT/Tech -30%)
        tech_crash = self._simulate_scenario(holdings, sector_impact={"IT": -0.30, "Technology": -0.30})
        
        # Scenario 3: Volatility Spike (High beta stocks hit harder)
        vol_spike = self._simulate_scenario(holdings, volatility_factor=2.0)

        # Calculate metrics
        max_drawdown = min(bear_impact["total_change_pct"], tech_crash["total_change_pct"], vol_spike["total_change_pct"])
        avg_impact = (bear_impact["total_change_pct"] + tech_crash["total_change_pct"] + vol_spike["total_change_pct"]) / 3
        
        # Risk Score (0 to 1)
        risk_score = min(1.0, abs(max_drawdown) / 40.0) # 40% drawdown = 1.0 risk

        metrics = [
            RiskMetric(name="Max Expected Drawdown", value=round(max_drawdown, 2), description="Worst case loss in a major crash", unit="%"),
            RiskMetric(name="Value at Risk (95%)", value=round(abs(avg_impact) * 1.2, 2), description="Estimated daily loss limit", unit="%"),
            RiskMetric(name="Sensitivity Score", value=round(risk_score * 10, 1), description="How reactive your portfolio is to shocks", unit="/ 10")
        ]

        summary = (
            f"Your portfolio has a risk score of {risk_score*10:.1f}/10. "
            f"In a severe bear market, we estimate a potential drawdown of {abs(bear_impact['total_change_pct']):.1f}%. "
            f"Currently, your exposure to {self._get_top_sector(holdings)} makes you sensitive to sector-specific shocks."
        )

        return StressTestResponse(
            score=risk_score,
            max_drawdown=abs(max_drawdown),
            var_95=abs(avg_impact) * 1.1,
            recovery_days=self._estimate_recovery(risk_score),
            metrics=metrics,
            scenario_results={
                "bear_market": bear_impact,
                "tech_crash": tech_crash,
                "vol_spike": vol_spike
            },
            summary=summary
        )

    def _simulate_scenario(self, holdings: List[Holding], market_drop=0.0, sector_impact=None, volatility_factor=1.0, volatility=0.2) -> Dict[str, Any]:
        """Synthetic simulation engine."""
        total_initial = sum(h.market_value or 0 for h in holdings)
        total_after = 0
        
        sector_results = {}
        
        for h in holdings:
            val = h.market_value or 0
            change = market_drop
            
            # Application of sector shocks
            if sector_impact and h.sector in sector_impact:
                change += sector_impact[h.sector]
            
            # Beta simulation (simplified)
            # High beta stocks dropped more in spikes
            if volatility_factor > 1.0:
                change -= (0.05 * volatility_factor)
                
            # Random noise based on volatility
            noise = np.random.normal(0, volatility * 0.1)
            final_change = change + noise
            
            new_val = val * (1 + final_change)
            total_after += new_val
            
            s = h.sector or "Unknown"
            sector_results[s] = sector_results.get(s, 0) + (new_val - val)

        return {
            "total_change_pct": round(((total_after - total_initial) / total_initial * 100), 2) if total_initial > 0 else 0,
            "impact_value": round(total_after - total_initial, 2),
            "sector_breakdown": {k: round(v, 2) for k, v in sector_results.items()}
        }

    def _get_top_sector(self, holdings: List[Holding]) -> str:
        sectors = {}
        for h in holdings:
            s = h.sector or "Other"
            sectors[s] = sectors.get(s, 0) + (h.market_value or 0)
        if not sectors: return "Equity"
        return max(sectors, key=sectors.get)

    def _estimate_recovery(self, risk_score: float) -> int:
        # Higher risk = longer recovery. 0.2 risk ~ 30 days, 0.8 risk ~ 300 days
        return int(30 + (risk_score * 400))

    def _empty_response(self) -> StressTestResponse:
        return StressTestResponse(
            score=0, max_drawdown=0, var_95=0, recovery_days=0, 
            metrics=[], scenario_results={}, summary="No holdings found to test."
        )

# Global singleton
stress_test_service = StressTestService()
