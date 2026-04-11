import google.generativeai as genai
from ..core.config import settings
from ..schemas.explainer import ExplainerRequest, ExplainerResponse

class ExplainerService:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')

    async def generate_explanation(self, request: ExplainerRequest) -> ExplainerResponse:
        """Uses Gemini to convert complex SHAP data into a simple narrative summary."""
        
        # 1. Prepare the prompt for the AI
        prompt = f"""
        Analyze this model's investment prediction. Translate the complex SHAP feature contributions 
        into a clear, empathetic narrative explanation for a retail investor (non-expert). 
        Address the investor’s fear and provide actionable context.

        Model Prediction: {request.model_prediction} (e.g., expected portfolio return)
        
        Key Feature Values: {request.feature_values} (Raw inputs)
        
        SHAP Feature Contributions: {request.shap_values} (How each feature changed the prediction)
        
        Generate a concise (3-5 sentences) summary focusing on WHICH factors mattered most 
        and WHAT it means for their portfolio, using narrative language.
        """

        # 2. Call the Gemini API asynchronously
        response = await self.model.generate_content_async(prompt)
        
        # 3. Handle the response and return
        return ExplainerResponse(explanation=response.text)

# Create a singleton instance
explainer_service = ExplainerService()