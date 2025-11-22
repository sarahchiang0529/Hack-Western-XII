# Gemini AI Chat API - Usage Guide

## Overview
The Gemini AI chat feature has been integrated into your FastAPI backend. You can now send messages to Google's Gemini AI and get responses.

## API Endpoint
- **URL**: `http://localhost:8000/api/chat/`
- **Method**: POST
- **Content-Type**: application/json

## Request Format

### Simple Message (No History)
```json
{
  "message": "Hello, tell me about Python programming"
}
```

### Message with Chat History (For Context)
```json
{
  "message": "Can you give me an example?",
  "chat_history": [
    {
      "role": "user",
      "content": "Tell me about Python programming"
    },
    {
      "role": "assistant",
      "content": "Python is a high-level programming language..."
    }
  ]
}
```

## Response Format
```json
{
  "success": true,
  "message": "Here's the AI's response...",
  "role": "assistant",
  "error": null
}
```

## Example Usage with cURL

### Simple Message
```bash
curl -X POST "http://localhost:8000/api/chat/" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hello, what can you help me with?\"}"
```

### Message with History
```bash
curl -X POST "http://localhost:8000/api/chat/" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Tell me more\", \"chat_history\": [{\"role\": \"user\", \"content\": \"What is AI?\"}, {\"role\": \"assistant\", \"content\": \"AI stands for Artificial Intelligence...\"}]}"
```

## Example Usage with JavaScript/Fetch

```javascript
// Simple message
async function sendMessage(message) {
  const response = await fetch('http://localhost:8000/api/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message
    })
  });
  
  const data = await response.json();
  return data;
}

// Usage
const result = await sendMessage("Hello Gemini!");
console.log(result.message);
```

```javascript
// Message with chat history
async function sendMessageWithHistory(message, chatHistory) {
  const response = await fetch('http://localhost:8000/api/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      chat_history: chatHistory
    })
  });
  
  const data = await response.json();
  return data;
}

// Usage
const history = [
  { role: "user", content: "What is Python?" },
  { role: "assistant", content: "Python is a programming language..." }
];
const result = await sendMessageWithHistory("Can you teach me Python?", history);
console.log(result.message);
```

## Example Usage with Python

```python
import requests

# Simple message
def send_message(message):
    url = "http://localhost:8000/api/chat/"
    payload = {"message": message}
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = send_message("Hello Gemini!")
print(result['message'])
```

```python
# Message with history
def send_message_with_history(message, chat_history):
    url = "http://localhost:8000/api/chat/"
    payload = {
        "message": message,
        "chat_history": chat_history
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
history = [
    {"role": "user", "content": "What is Python?"},
    {"role": "assistant", "content": "Python is a programming language..."}
]
result = send_message_with_history("Can you teach me Python?", history)
print(result['message'])
```

## Health Check
Check if the chat service is running:

```bash
curl http://localhost:8000/api/chat/health
```

Response:
```json
{
  "status": "ok",
  "service": "Gemini AI Chat",
  "model": "gemini-pro"
}
```

## Testing in Browser
1. Start your backend server: `python main.py`
2. Go to: `http://localhost:8000/docs`
3. Find the `/api/chat/` endpoint
4. Click "Try it out"
5. Enter your message and click "Execute"

## Notes
- The API key is already configured in `config.py`
- Chat history is optional but helps maintain context
- The model used is `gemini-pro` (good for text conversations)
- For future enhancements, you can add streaming responses using the `chat_stream` method

