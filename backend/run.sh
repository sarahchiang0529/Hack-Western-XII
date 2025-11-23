#!/bin/bash

echo "Starting FastAPI Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
echo "Checking dependencies..."
pip install -q -r requirements.txt

# Run the server
echo ""
echo "Starting server at http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
python main.py

