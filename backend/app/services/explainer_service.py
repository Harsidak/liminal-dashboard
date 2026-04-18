from google import genai
from groq import Groq
from app.core.config import settings
from app.schemas.explainer import AssetExplainRequest, ExplainerResponse

client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")

groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

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
        # ATTEMPT 1: Gemini
        if not client:
            raise Exception("Gemini client is not initialized due to missing or invalid API key.")
            
        print(f"🔄 Attempting Gemini for {request.symbol}...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        explanation = response.text.strip()
        print("✅ Gemini response received")

    except Exception as gem_e:
        print(f"⚠️ Gemini API error: {gem_e}")
        
        # ATTEMPT 2: Groq Fallback
        if groq_client:
            try:
                print(f"🔄 Falling back to Groq for {request.symbol}...")
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                )
                explanation = chat_completion.choices[0].message.content.strip()
                print("✅ Groq response received")
                return ExplainerResponse(
                    symbol=request.symbol,
                    explanation=explanation,
                    shap_values=shap_values
                )
            except Exception as groq_e:
                print(f"❌ Groq API error: {groq_e}")
        
        # FINAL FALLBACK: Hardcoded text
        print("🚨 Both LLMs failed, using hardcoded fallback")
        factor_name = list(request.factors.keys())[0].replace('_', ' ') if request.factors else 'market'
        explanation = (
            f"{request.symbol} dropped {abs(request.change_percent)}% mainly due to "
            f"{factor_name} pressures. "
            f"This is a short-term fluctuation — the fundamentals remain intact."
        )

    return ExplainerResponse(
        symbol=request.symbol,
        explanation=explanation,
        shap_values=shap_values
    )