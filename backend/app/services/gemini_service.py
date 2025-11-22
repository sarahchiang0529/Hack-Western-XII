"""
Gemini AI Service
Handles all interactions with Google's Gemini AI API
"""
import logging
import traceback
import google.generativeai as genai
from typing import List, Dict
from app.core.config import settings

# Setup logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class GeminiService:
    """Service for interacting with Gemini AI"""
    
    def __init__(self):
        """Initialize Gemini AI with API key"""
        try:
            logger.info("[GEMINI] Initializing Gemini AI service...")
            logger.info(f"[GEMINI] API Key: {settings.GEMINI_API_KEY[:10]}...{settings.GEMINI_API_KEY[-5:]}")
            logger.info(f"[GEMINI] Model: {settings.GEN_MODEL}")
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEN_MODEL)
            
            logger.info("[GEMINI] Gemini AI service initialized successfully")
        except Exception as e:
            logger.error(f"[GEMINI] Failed to initialize: {str(e)}")
            logger.error(f"[GEMINI] Traceback: {traceback.format_exc()}")
            raise
    
    async def chat(self, message: str, chat_history: List[Dict[str, str]] = None) -> Dict:
        """
        Send a message to Gemini AI and get a response
        
        Args:
            message: The user's message
            chat_history: Optional list of previous messages
            
        Returns:
            Dict containing the AI response and updated chat history
        """
        try:
            logger.info(f"[GEMINI] Processing message: {message[:100]}...")
            logger.info(f"[GEMINI] Has history: {chat_history is not None}")
            
            # Start a chat session if history is provided
            if chat_history:
                logger.info(f"[GEMINI] Converting {len(chat_history)} history messages")
                # Convert chat history to Gemini format
                gemini_history = []
                for msg in chat_history:
                    role = "user" if msg["role"] == "user" else "model"
                    gemini_history.append({
                        "role": role,
                        "parts": [msg["content"]]
                    })
                
                logger.info("[GEMINI] Starting chat with history...")
                chat = self.model.start_chat(history=gemini_history)
                response = chat.send_message(message)
            else:
                # Single message without history
                logger.info("[GEMINI] Generating content without history...")
                response = self.model.generate_content(message)
            
            logger.info(f"[GEMINI] Response received: {response.text[:100]}...")
            
            return {
                "success": True,
                "message": response.text,
                "role": "assistant"
            }
            
        except Exception as e:
            logger.error(f"[GEMINI] Error during chat: {str(e)}")
            logger.error(f"[GEMINI] Error type: {type(e).__name__}")
            logger.error(f"[GEMINI] Traceback: {traceback.format_exc()}")
            
            return {
                "success": False,
                "error": str(e),
                "message": f"Sorry, I encountered an error: {str(e)}"
            }
    
    async def chat_stream(self, message: str):
        """
        Stream a response from Gemini AI (for future implementation)
        
        Args:
            message: The user's message
            
        Yields:
            Chunks of the AI response
        """
        try:
            response = self.model.generate_content(message, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"Error: {str(e)}"


# Create a singleton instance
gemini_service = GeminiService()

