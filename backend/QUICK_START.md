# FastAPI Backend - Quick Start

## 🚀 Get Your API Running in 3 Steps

### Step 1: Create Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run the Server

```bash
python main.py
```

Your API is now running at `http://localhost:8000` 🎉

---

## 📚 Quick Links

Once the server is running:

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Welcome Page**: http://localhost:8000

---

## 🧪 Test the API

### Using cURL:

```bash
# Get all items
curl http://localhost:8000/api/items

# Get health status
curl http://localhost:8000/health
```

### Using Browser:

Just open http://localhost:8000/docs in your browser for interactive API documentation!

---

## 🔌 Connect from Chrome Extension

In your Chrome extension, use:

```javascript
const API_URL = 'http://localhost:8000/api';

// Get items
fetch(`${API_URL}/items`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🛠️ Development Tips

**Hot Reload**: The server automatically reloads when you change Python files.

**Stop Server**: Press `Ctrl+C` in the terminal.

**Deactivate venv**: Run `deactivate` when done.

---

## 📝 API Endpoints

- `GET /api/items` - List all items
- `GET /api/items/{id}` - Get single item
- `POST /api/items` - Create item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item
- `GET /health` - Health check

Check the full README.md for detailed documentation!

---

Happy coding! 🚀

