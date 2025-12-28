"""
Database Connection and Session Management

Sets up SQLAlchemy with async support using asyncpg driver.
Provides database session dependency for FastAPI routes.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# DATABASE ENGINE
# ============================================================================

# Create async engine with asyncpg driver
engine: AsyncEngine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG,  # Log SQL queries in development
    future=True,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Connection pool size
    max_overflow=20,  # Max overflow connections
    **({
        "poolclass": NullPool  # Disable pooling in tests
    } if settings.ENVIRONMENT == "testing" else {})
)

# ============================================================================
# SESSION FACTORY
# ============================================================================

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autocommit=False,
    autoflush=False,
)

# ============================================================================
# BASE MODEL
# ============================================================================

# Base class for all database models
Base = declarative_base()

# ============================================================================
# DATABASE DEPENDENCY
# ============================================================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    Usage in routes:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    
    Yields:
        AsyncSession: Database session
        
    The session is automatically:
    - Committed if no exception occurs
    - Rolled back if an exception occurs
    - Closed after the request completes
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# ============================================================================
# DATABASE UTILITIES
# ============================================================================

async def create_tables():
    """
    Create all database tables.
    
    WARNING: This should only be used in development/testing.
    In production, use Alembic migrations instead!
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")


async def drop_tables():
    """
    Drop all database tables.
    
    WARNING: This will delete all data! Only use in development/testing.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    logger.info("Database tables dropped")


async def check_database_connection() -> bool:
    """
    Check if database connection is working.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
