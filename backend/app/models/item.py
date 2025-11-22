"""
Item Pydantic Models
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ItemBase(BaseModel):
    """Base item model with common fields"""
    name: str = Field(..., min_length=1, max_length=100, description="Item name")
    description: Optional[str] = Field(None, max_length=500, description="Item description")
    price: float = Field(..., ge=0, description="Item price (must be non-negative)")
    quantity: int = Field(default=0, ge=0, description="Available quantity")


class ItemCreate(ItemBase):
    """Model for creating a new item"""
    pass


class ItemUpdate(BaseModel):
    """Model for updating an existing item (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)


class Item(ItemBase):
    """Complete item model with ID and timestamps"""
    id: str = Field(..., description="Unique item identifier")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "item-123",
                "name": "Example Item",
                "description": "This is an example item",
                "price": 29.99,
                "quantity": 100,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        }


class ItemResponse(BaseModel):
    """Response model for item operations"""
    success: bool = True
    message: str
    data: Optional[Item] = None


class ItemListResponse(BaseModel):
    """Response model for listing items"""
    success: bool = True
    count: int
    data: list[Item]

