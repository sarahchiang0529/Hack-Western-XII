@echo off
echo Starting FastAPI Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
echo Checking dependencies...
pip install -q -r requirements.txt

REM Run the server
echo.
echo Starting server at http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
python main.py

pause

