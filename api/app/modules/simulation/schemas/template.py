from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    subject: str
    body_html: str
    body_text: Optional[str] = None
    
    country_code: str
    language: str = 'en'
    
    brand_category: str
    brand_name: str
    brand_logo_url: Optional[str] = None
    
    attack_type: str
    difficulty: str
    tags: List[str] = []

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    body_html: Optional[str] = None
    is_active: Optional[bool] = None

class TemplateResponse(TemplateBase):
    id: UUID
    org_id: Optional[UUID]
    times_used: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
