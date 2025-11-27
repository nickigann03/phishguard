from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# from app.core.config import settings
# from app.core.database import engine, Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FASTAPI application
app = FastAPI(
    title = "PhishGuard API",
    description = "Email Security Platform - Phishing Simulation & Detection",
    version = "0.1.0",
    docs_url = "/api/docs", #Swagger UI
    redoc_url="/api/redoc"
)

# CORS middleware (allows frontend to call API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Check if API is running"""
    return {
        "status": "healthy",
        "service": "phishguard-api",
        "version": "0.1.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """API Root endpoint"""
    return {
        "message": "PhishGuard API",
        "docs": "/api/docs"
    }

# Startup event
@app.on_event("startup")
async def startup():
    """Startup event handler"""
    logger.info("PhishGuard API startup...")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("PhishGuard API shutdown...")