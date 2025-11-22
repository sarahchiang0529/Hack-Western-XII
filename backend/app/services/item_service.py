"""
Item Service - In-memory CRUD operations
This uses an in-memory dictionary for storage.
Replace with a database when ready.
"""
from typing import Dict, List, Optional
from datetime import datetime
import uuid

from app.models.item import Item, ItemCreate, ItemUpdate


class ItemService:
    """
    Service for managing items with in-memory storage
    Following Single Responsibility Principle
    """
    
    def __init__(self):
        """Initialize the service with empty storage"""
        self._items: Dict[str, Item] = {}
        self._initialize_sample_data()
    
    def _initialize_sample_data(self) -> None:
        """Initialize with some sample data for testing"""
        sample_items = [
            ItemCreate(
                name="Laptop",
                description="High-performance laptop",
                price=999.99,
                quantity=10
            ),
            ItemCreate(
                name="Mouse",
                description="Wireless gaming mouse",
                price=49.99,
                quantity=50
            ),
            ItemCreate(
                name="Keyboard",
                description="Mechanical keyboard",
                price=79.99,
                quantity=30
            )
        ]
        
        for item_data in sample_items:
            self.create_item(item_data)
    
    def _generate_id(self) -> str:
        """Generate a unique ID for a new item"""
        return f"item-{uuid.uuid4().hex[:8]}"
    
    def get_all_items(self) -> List[Item]:
        """
        Retrieve all items
        
        Returns:
            List of all items
        """
        return list(self._items.values())
    
    def get_item_by_id(self, item_id: str) -> Optional[Item]:
        """
        Retrieve a single item by ID
        
        Args:
            item_id: The item identifier
            
        Returns:
            Item if found, None otherwise
        """
        return self._items.get(item_id)
    
    def create_item(self, item_data: ItemCreate) -> Item:
        """
        Create a new item
        
        Args:
            item_data: Item creation data
            
        Returns:
            Created item with generated ID and timestamps
        """
        item_id = self._generate_id()
        now = datetime.utcnow()
        
        item = Item(
            id=item_id,
            name=item_data.name,
            description=item_data.description,
            price=item_data.price,
            quantity=item_data.quantity,
            created_at=now,
            updated_at=now
        )
        
        self._items[item_id] = item
        return item
    
    def update_item(self, item_id: str, item_data: ItemUpdate) -> Optional[Item]:
        """
        Update an existing item
        
        Args:
            item_id: The item identifier
            item_data: Updated item data (only provided fields are updated)
            
        Returns:
            Updated item if found, None otherwise
        """
        item = self._items.get(item_id)
        
        if not item:
            return None
        
        # Update only provided fields
        update_data = item_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(item, field, value)
        
        # Update timestamp
        item.updated_at = datetime.utcnow()
        
        self._items[item_id] = item
        return item
    
    def delete_item(self, item_id: str) -> bool:
        """
        Delete an item
        
        Args:
            item_id: The item identifier
            
        Returns:
            True if item was deleted, False if not found
        """
        if item_id in self._items:
            del self._items[item_id]
            return True
        return False
    
    def search_items(self, query: str) -> List[Item]:
        """
        Search items by name or description
        
        Args:
            query: Search query string
            
        Returns:
            List of matching items
        """
        query_lower = query.lower()
        return [
            item for item in self._items.values()
            if query_lower in item.name.lower() 
            or (item.description and query_lower in item.description.lower())
        ]


# Create a singleton instance
item_service = ItemService()

