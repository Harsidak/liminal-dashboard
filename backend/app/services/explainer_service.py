from app.schemas.explainer import ExplainerRequest, ExplainerResponse, PortfolioFactor


def build_explainer_response(request: ExplainerRequest) -> ExplainerResponse:
    sorted_factors = sorted(
        request.factors,
        key=lambda item: abs(item.contribution),
        reverse=True,
    )
    top_factors = sorted_factors[:3]

    if not top_factors:
        top_factors = [
            PortfolioFactor(factor="Market sentiment", contribution=0.21),
            PortfolioFactor(factor="Sector momentum", contribution=0.17),
        ]

    direction = "upward bias" if top_factors[0].contribution >= 0 else "downward pressure"
    summary = (
        f"{request.asset_name} is showing {direction}. "
        f"Primary drivers are {', '.join([factor.factor for factor in top_factors])}. "
        "Use diversification and VaR controls before increasing allocation."
    )

    return ExplainerResponse(
        title=f"{request.asset_name} explainability snapshot",
        summary=summary,
        confidence=0.84,
        dominant_factors=top_factors,
    )
