"""
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.middleware import setup_middleware
from app.api.routes import health
from backend.app.api.routes import stockapi


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Setup middleware (including CORS)
setup_middleware(app)

# Include routers
app.include_router(health.router)
app.include_router(stockapi.router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - Welcome message
    
    Returns:
        Welcome message with API information
    """
    return JSONResponse(
        content={
            "message": "Welcome to FastAPI Backend",
            "version": settings.VERSION,
            "docs": "/docs",
            "health": "/health",
            "api": settings.API_V1_PREFIX
        }
    )


@app.on_event("startup")
async def startup_event():
    """Execute on application startup"""
    print(f"[*] {settings.PROJECT_NAME} v{settings.VERSION} starting...")
    print(f"[*] API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"[*] Health Check: http://{settings.HOST}:{settings.PORT}/health")


@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown"""
    print("[*] Shutting down...")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level="info"
    )

