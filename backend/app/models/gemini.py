"""
Gemini API Request/Response Models
"""
from pydantic import BaseModel


class PromptRequest(BaseModel):
    """Request model for text generation"""
    prompt: str


class GenerateTextResponse(BaseModel):
    """Response model for text generation"""
    success: bool
    message: str
    data: str
