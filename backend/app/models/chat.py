"""
Chat Models
Pydantic models for chat-related requests and responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Role of the message sender (user or assistant)")
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., description="The user's message")
    chat_history: Optional[List[ChatMessage]] = Field(
        default=None, 
        description="Optional chat history for context"
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="The AI's response message")
    role: str = Field(default="assistant", description="Role of the responder")
    error: Optional[str] = Field(default=None, description="Error message if any")

