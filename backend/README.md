# FastAPI Backend

A professional FastAPI backend with CORS support for Chrome extensions, featuring RESTful CRUD operations and clean architecture following SOLID principles.

## 🚀 Features

- ⚡ **FastAPI** - Modern, fast Python web framework
- 🔄 **CORS Enabled** - Configured for Chrome extension integration
- 📦 **CRUD Operations** - Complete example with in-memory storage
- 🎯 **Type Safety** - Full type hints with Pydantic models
- 📚 **Auto Documentation** - Interactive API docs with Swagger UI
- 🏗️ **Clean Architecture** - Organized following SOLID principles
- ✨ **Hot Reload** - Fast development with automatic reloading

## 📁 Project Structure

```
backend/
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── requirements-dev.txt       # Development dependencies
├── .env.example              # Environment variables template
├── app/
│   ├── __init__.py
│   ├── api/                  # API layer
│   │   ├── routes/
│   │   │   ├── health.py     # Health check endpoint
│   │   │   └── items.py      # Item CRUD endpoints
│   ├── models/               # Pydantic models
│   │   └── item.py          # Item data models
│   ├── services/            # Business logic
│   │   └── item_service.py  # Item service (in-memory)
│   └── core/                # Core configuration
│       ├── config.py        # Application settings
│       └── middleware.py    # CORS and middleware setup
```

## 🛠️ Getting Started

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **Create a virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Create environment file (optional):**

```bash
# Copy the example file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env with your settings if needed
```

### Running the Server

**Development mode (with hot reload):**

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔌 API Endpoints

### Root & Health

- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint

### Items (CRUD)

All item endpoints are prefixed with `/api`

- `GET /api/items` - List all items
  - Query params: `?search=query` - Search items by name/description
- `GET /api/items/{id}` - Get a single item by ID
- `POST /api/items` - Create a new item
- `PUT /api/items/{id}` - Update an existing item
- `DELETE /api/items/{id}` - Delete an item

### Example Requests

**Get all items:**
```bash
curl http://localhost:8000/api/items
```

**Get single item:**
```bash
curl http://localhost:8000/api/items/item-12345678
```

**Create item:**
```bash
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Item",
    "description": "Item description",
    "price": 29.99,
    "quantity": 100
  }'
```

**Update item:**
```bash
curl -X PUT http://localhost:8000/api/items/item-12345678 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Item",
    "price": 39.99
  }'
```

**Delete item:**
```bash
curl -X DELETE http://localhost:8000/api/items/item-12345678
```

**Search items:**
```bash
curl http://localhost:8000/api/items?search=laptop
```

## 🔧 Configuration

Configuration is managed through environment variables. See `.env.example` for available options:

- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `DEBUG` - Debug mode (default: True)
- `RELOAD` - Hot reload (default: True)
- `ALLOWED_ORIGINS` - CORS allowed origins

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` - React dev server
- `http://localhost:5173` - Vite dev server
- `chrome-extension://*` - All Chrome extensions

To restrict to your specific Chrome extension, update `app/core/config.py`:

```python
ALLOWED_ORIGINS: List[str] = [
    "chrome-extension://your-extension-id-here"
]
```

## 💾 Data Storage

Currently using **in-memory storage** for simplicity. Data is initialized with sample items and will be reset when the server restarts.

### Adding a Database

To add persistent storage (e.g., PostgreSQL, MongoDB), replace the service layer:

1. Install database driver (e.g., `pip install sqlalchemy psycopg2-binary`)
2. Update `app/services/item_service.py` to use database instead of dictionary
3. Add database configuration to `app/core/config.py`

The rest of the application won't need changes thanks to the service layer abstraction!

## 🧪 Development

### Install development dependencies:

```bash
pip install -r requirements-dev.txt
```

### Code Quality Tools:

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

### Running Tests:

```bash
pytest
```

## 🔗 Connecting to Chrome Extension

Your Chrome extension (in the `frontend` folder) can connect to this API:

```typescript
// In your Chrome extension
const API_URL = 'http://localhost:8000/api';

async function getItems() {
  const response = await fetch(`${API_URL}/items`);
  const data = await response.json();
  return data;
}

async function createItem(itemData) {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  return await response.json();
}
```

## 📝 Next Steps

1. **Add Authentication** - Implement JWT authentication for secure access
2. **Add Database** - Replace in-memory storage with PostgreSQL or MongoDB
3. **Add More Endpoints** - Create additional resources as needed
4. **Add Validation** - Enhance Pydantic models with more validation rules
5. **Add Tests** - Write unit and integration tests
6. **Deploy** - Deploy to a production server (Heroku, AWS, etc.)

## 🤝 Contributing

Follow these principles when contributing:

- **SOLID Principles** - Keep code modular and maintainable
- **Type Hints** - Use type hints for all functions
- **Documentation** - Document all endpoints and functions
- **Error Handling** - Provide clear error messages

## 📄 License

MIT License - feel free to use this boilerplate for your projects!

---

Happy coding! 🚀

