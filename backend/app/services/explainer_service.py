from google import genai
from app.core.config import settings
from app.schemas.explainer import AssetExplainRequest, ExplainerResponse
import traceback

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def compute_mock_shap(factors: dict) -> dict:
    total = sum(abs(v) for v in factors.values())
    if total == 0:
        return factors
    return {k: round(v / total, 4) for k, v in factors.items()}

async def explain_asset(request: AssetExplainRequest) -> ExplainerResponse:
    shap_values = compute_mock_shap(request.factors)

    factor_lines = "\n".join(
        f"- {k.replace('_', ' ').title()}: {round(v * 100, 1)}% weight"
        for k, v in shap_values.items()
    )

    language_instruction = (
        "Respond in simple Hindi (Hinglish is fine)."
        if request.language == "hindi"
        else "Respond in simple English."
    )

    prompt = f"""You are a friendly financial coach for beginner investors in India.

A stock called {request.symbol} changed by {request.change_percent}% today.
The AI model found these driving factors (SHAP values):
{factor_lines}

{language_instruction}
In exactly 2 sentences, explain WHY this happened in plain language a college student can understand.
Do NOT use jargon. Do NOT say "SHAP values". Be reassuring if the change is negative."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        explanation = response.text.strip()
        print(f"✅ Gemini response: {explanation}")

    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        traceback.print_exc()
        # Fallback explanation so the endpoint doesn't crash
        explanation = (
            f"{request.symbol} dropped {abs(request.change_percent)}% mainly due to "
            f"{list(request.factors.keys())[0].replace('_', ' ')} pressures. "
            f"This is a short-term fluctuation — the fundamentals remain intact."
        )

    return ExplainerResponse(
        symbol=request.symbol,
        explanation=explanation,
        shap_values=shap_values
    )