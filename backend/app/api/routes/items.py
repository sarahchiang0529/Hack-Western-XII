"""
Item CRUD Routes
"""
from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional

from app.models.item import (
    Item,
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    ItemListResponse
)
from app.services.item_service import item_service

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("", response_model=ItemListResponse)
async def get_items(
    search: Optional[str] = Query(None, description="Search query for items")
):
    """
    Get all items or search items
    
    Args:
        search: Optional search query to filter items
        
    Returns:
        List of items
    """
    if search:
        items = item_service.search_items(search)
    else:
        items = item_service.get_all_items()
    
    return ItemListResponse(
        success=True,
        count=len(items),
        data=items
    )


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str):
    """
    Get a single item by ID
    
    Args:
        item_id: The item identifier
        
    Returns:
        Item details
        
    Raises:
        HTTPException: 404 if item not found
    """
    item = item_service.get_item_by_id(item_id)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id '{item_id}' not found"
        )
    
    return ItemResponse(
        success=True,
        message="Item retrieved successfully",
        data=item
    )


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item_data: ItemCreate):
    """
    Create a new item
    
    Args:
        item_data: Item creation data
        
    Returns:
        Created item
    """
    item = item_service.create_item(item_data)
    
    return ItemResponse(
        success=True,
        message="Item created successfully",
        data=item
    )


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: str, item_data: ItemUpdate):
    """
    Update an existing item
    
    Args:
        item_id: The item identifier
        item_data: Updated item data
        
    Returns:
        Updated item
        
    Raises:
        HTTPException: 404 if item not found
    """
    item = item_service.update_item(item_id, item_data)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id '{item_id}' not found"
        )
    
    return ItemResponse(
        success=True,
        message="Item updated successfully",
        data=item
    )


@router.delete("/{item_id}", response_model=dict)
async def delete_item(item_id: str):
    """
    Delete an item
    
    Args:
        item_id: The item identifier
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if item not found
    """
    success = item_service.delete_item(item_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id '{item_id}' not found"
        )
    
    return {
        "success": True,
        "message": f"Item with id '{item_id}' deleted successfully"
    }

