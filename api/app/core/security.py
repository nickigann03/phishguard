"""
Security Utilities

Provides:
- Password hashing and verification
- JWT token generation and validation
- Security dependencies for FastAPI routes
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# PASSWORD HASHING
# ============================================================================

# Password hashing context using argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================================
# JWT TOKEN MANAGEMENT
# ============================================================================

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of data to encode in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create a JWT refresh token with longer expiration.
    
    Args:
        data: Dictionary of data to encode in the token
        
    Returns:
        str: Encoded JWT refresh token
    """
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta)


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token to decode
        
    Returns:
        dict: Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ============================================================================
# FASTAPI DEPENDENCIES
# ============================================================================

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    Extract user ID from JWT token.
    
    Usage in routes:
        @app.get("/me")
        async def get_me(user_id: str = Depends(get_current_user_id)):
            return {"user_id": user_id}
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        str: User ID (UUID as string)
        
    Raises:
        HTTPException: If token is invalid or missing user_id
    """
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = None  # Will be imported later to avoid circular import
):
    """
    Get current user from database.
    
    NOTE: This will be fully implemented after User model is created.
    For now, it just returns the user_id.
    
    Args:
        user_id: User ID from JWT token
        db: Database session
        
    Returns:
        User: Current user object
        
    Raises:
        HTTPException: If user not found
    """
    # TODO: Import User model and query database
    # from app.core.models.user import User
    # result = await db.execute(select(User).filter(User.id == user_id))
    # user = result.scalar_one_or_none()
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")
    # return user
    
    # For now, just return user_id
    return {"id": user_id}


async def get_current_org_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    Extract organization ID from JWT token.
    
    All requests are scoped to an organization for multi-tenancy.
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        str: Organization ID (UUID as string)
        
    Raises:
        HTTPException: If token is invalid or missing org_id
    """
    payload = decode_token(token)
    org_id: str = payload.get("org_id")
    
    if org_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Organization context not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return org_id


# ============================================================================
# PERMISSION CHECKING
# ============================================================================

def require_role(required_role: str):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @app.post("/admin")
        async def admin_only(user = Depends(require_role("admin"))):
            return {"message": "Admin access granted"}
    
    Args:
        required_role: Required role (admin, manager, employee)
        
    Returns:
        Dependency function
    """
    async def role_checker(token: str = Depends(oauth2_scheme)):
        payload = decode_token(token)
        user_role = payload.get("role")
        
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}",
            )
        
        return payload
    
    return role_checker


def require_any_role(*allowed_roles: str):
    """
    Dependency factory requiring any of the specified roles.
    
    Usage:
        @app.post("/managers")
        async def managers_route(
            user = Depends(require_any_role("admin", "manager"))
        ):
            return {"message": "Access granted"}
    
    Args:
        allowed_roles: Tuple of allowed roles
        
    Returns:
        Dependency function
    """
    async def role_checker(token: str = Depends(oauth2_scheme)):
        payload = decode_token(token)
        user_role = payload.get("role")
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}",
            )
        
        return payload
    
    return role_checker
