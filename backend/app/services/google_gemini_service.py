"""
Google Gemini AI Service
"""
import google.generativeai as genai
from app.core.config import settings


class GeminiService:
    """Service for interacting with Google's Gemini AI"""
    
    def __init__(self, api_key: str, model_name: str):
        """Initialize Gemini service with API key and model"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    async def generate_text(self, prompt: str) -> str:
        """
        Generate text using Gemini AI
        
        Args:
            prompt: The input prompt for generation
            
        Returns:
            Generated text response
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")


# Create service instance
gemini_service = GeminiService(
    api_key=settings.GEMINI_API_KEY,
    model_name=settings.GEN_MODEL
)
