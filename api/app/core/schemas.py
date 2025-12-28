from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUIS
import re

#=================================
# Organisational Schemas
#=================================

class OrganisationBase(BaseModel):
    """Base schema with shared fields"""
    name: str = Field(..., min_lentgh=1, max_lentgh=255, description="Organisation name")
    domain: str = Field(..., min_length=3, max_length=255, description="Company domain (e.g., 'company.com.my')")

class OrganisationCreate(OrganisationBase):
    """Schema for creating a new organisation"""

    @field_validator('domain')
    @classmethod
    def validate_domain(cls, v: str) -> str:
        """Validate domain format"""
        # Remove protocol if included
        v = v.lower().replace('http://', '').replace('https://', '').replace('www', '')
        
        # Basic domain validation (simple regex)
        if not re.match(r'^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$', v):
            raise ValueError('Invalid domain format')
        
        return v
    
    class OrganisationUpdate(BaseModel):
        """Schema for updating an existing organisation"""
        name: Optional[str] = Field(None, min_length=1, max_length=255)
        is_active: Optional[bool] = None
    
    class OrganisationResponse(OrganisationBase):
        """Schema for organisation response"""
        id: uuid
        subscription_tier: str
        is_active: bool
        created_at: datetime
        updated_at: datetime
        
        class Config:
            from_attributes = True # Allows reading from SQLAlchemy models

#=================================
# User Schemas
#=================================

class UserBase(BaseModel):
    """Base schema with shared fields"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    department: Optional[str] = Field(None, max_length=100)

class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=8, max_length=100)
    role: str = Field(default="employee")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password format"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit') 
        return v
    
class UserResponse(UserBase):
    """Schema for user response"""
    id: uuid
    org_id: uuid 
    role: str
    risk_score: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True # Allows reading from SQLAlchemy models

#=================================
# Generic Response Schemas
#=================================

class MessageResponse(BaseModel):
    """Schema for message response"""
    message: str
    detail: Optional[str] = None

class ErrorResponse(BaseModel):
    """Schema for error response"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None

