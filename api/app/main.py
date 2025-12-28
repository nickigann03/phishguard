"""
PhishGuard API - Main Application

FastAPI application with authentication, database, and modular architecture.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.config import settings
from app.core.database import get_db, check_database_connection

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============================================================================
# CREATE FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Email Security Platform - Phishing Simulation & Detection",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    debug=settings.DEBUG,
)

# ============================================================================
# CORS MIDDLEWARE
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Basic health check endpoint.
    
    Returns API status and version.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health/db", tags=["Health"])
async def database_health_check():
    """
    Database health check endpoint.
    
    Tests database connectivity.
    """
    is_connected = await check_database_connection()
    
    if is_connected:
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Database connection successful"
        }
    else:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "message": "Database connection failed"
        }


# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    API Root endpoint.
    
    Provides basic information and links to documentation.
    """
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/api/docs",
        "redoc": "/api/redoc",
        "health": "/health"
    }


# ============================================================================
# TEST DATABASE ENDPOINT
# ============================================================================

@app.get("/api/v1/test-db", tags=["Development"])
async def test_database(db: AsyncSession = Depends(get_db)):
    """
    Test database session dependency.
    
    This endpoint verifies that database sessions are working correctly.
    Only available in development environment.
    """
    if not settings.is_development:
        return {"error": "This endpoint is only available in development"}
    
    try:
        # Try to execute a simple query
        from sqlalchemy import text
        result = await db.execute(text("SELECT 1 as test"))
        row = result.first()
        
        return {
            "status": "success",
            "message": "Database session working correctly",
            "test_query_result": row[0] if row else None
        }
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    
    Performs initialization tasks like checking database connection.
    """
    logger.info(f"Starting {settings.APP_NAME} API v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Check database connection
    db_connected = await check_database_connection()
    if db_connected:
        logger.info("✓ Database connection established")
    else:
        logger.error("✗ Database connection failed!")
    
    logger.info("API startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler.
    
    Performs cleanup tasks.
    """
    logger.info(f"Shutting down {settings.APP_NAME} API...")
    logger.info("API shutdown complete")


# ============================================================================
# REGISTER ROUTERS
# ============================================================================

from app.modules.auth.router import router as auth_router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])

from app.modules.simulation.routers.templates import router as templates_router
app.include_router(templates_router, prefix="/api/v1/templates", tags=["Templates"])

# from app.modules.campaigns.router import router as campaigns_router
# app.include_router(campaigns_router, prefix="/api/v1/campaigns", tags=["Campaigns"])

from app.modules.simulation.routers.campaigns import router as campaigns_router
app.include_router(campaigns_router, prefix="/api/v1/campaigns", tags=["Campaigns"])

from app.modules.tracking.router import router as tracking_router
app.include_router(tracking_router, prefix="/api/v1/track", tags=["Tracking"])

from app.modules.analytics.router import router as analytics_router
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])

from app.modules.ai.router import router as ai_router
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI Integration"])
