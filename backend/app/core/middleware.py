"""
Middleware Configuration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .config import settings


def setup_middleware(app: FastAPI) -> None:
    """
    Configure all middleware for the application
    
    Args:
        app: FastAPI application instance
    """
    
    # CORS Middleware - Essential for Chrome extension
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods
        allow_headers=["*"],  # Allow all headers
        expose_headers=["*"],
    )
    
    # You can add more middleware here as needed
    # Example: TrustedHostMiddleware
    # app.add_middleware(
    #     TrustedHostMiddleware,
    #     allowed_hosts=["localhost", "127.0.0.1"]
    # )

