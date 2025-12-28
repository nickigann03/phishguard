from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID

# ============================================================================
# TOKEN SCHEMAS
# ============================================================================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    org_id: Optional[str] = None
    role: Optional[str] = None


# ============================================================================
# AUTH REQUEST SCHEMAS
# ============================================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    org_name: str  # For initial registration, we create an org too

class UserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    org_id: UUID
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True
