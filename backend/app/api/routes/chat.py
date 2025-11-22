"""
Chat Routes
API endpoints for Gemini AI chat functionality
"""
import logging
import traceback
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service

# Setup logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

logger.info("Chat router initialized successfully")


async def chat_logic(request: ChatRequest):
    """
    Core chat logic - shared between routes
    """
    logger.info(f"[CHAT] Received message: {request.message[:50]}...")
    
    try:
        # Convert chat_history to dict format if provided
        history = None
        if request.chat_history:
            logger.info(f"[CHAT] Chat history provided: {len(request.chat_history)} messages")
            history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.chat_history
            ]
        
        # Get response from Gemini
        logger.info("[CHAT] Calling Gemini AI service...")
        result = await gemini_service.chat(request.message, history)
        logger.info(f"[CHAT] Gemini response received: {result.get('success', False)}")
        
        return ChatResponse(**result)
    
    except Exception as e:
        logger.error(f"[CHAT] Error in chat_logic: {str(e)}")
        logger.error(f"[CHAT] Traceback: {traceback.format_exc()}")
        raise


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Send a message to Gemini AI and get a response
    
    Args:
        request: ChatRequest containing the message and optional chat history
        
    Returns:
        ChatResponse with the AI's response
    """
    logger.info(f"[ENDPOINT] POST /chat/ called")
    logger.info(f"[ENDPOINT] Request data: {request}")
    
    try:
        result = await chat_logic(request)
        logger.info(f"[ENDPOINT] Successfully returning response")
        return result
    except HTTPException as he:
        logger.error(f"[ENDPOINT] HTTPException: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"[ENDPOINT] Unexpected error: {str(e)}")
        logger.error(f"[ENDPOINT] Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}\n{traceback.format_exc()}"
        )


@router.get("/test")
async def chat_test():
    """
    Simple test endpoint to verify chat route is registered
    """
    logger.info("[TEST] Test endpoint called")
    return JSONResponse(
        content={
            "status": "Chat route is working!",
            "message": "The chat endpoint is properly registered."
        }
    )


@router.get("/health")
async def chat_health():
    """
    Check if chat service is working
    
    Returns:
        Status of the chat service
    """
    logger.info("[HEALTH] Health check endpoint called")
    return JSONResponse(
        content={
            "status": "ok",
            "service": "Gemini AI Chat",
            "model": "gemini-pro"
        }
    )

