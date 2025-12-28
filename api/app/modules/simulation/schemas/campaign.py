from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from uuid import UUID
from datetime import datetime

# ============================================================================
# CAMPAIGN SCHEMAS
# ============================================================================

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    template_id: UUID
    
    # Targeting
    target_type: str = "all"  # all, department, custom
    target_config: Dict[str, Any] = {}
    
    # Scheduling
    scheduled_start: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    # For now keep it simple

class CampaignResponse(CampaignBase):
    id: UUID
    org_id: UUID
    status: str
    
    # Stats
    total_targets: int
    emails_sent: int
    emails_opened: int
    links_clicked: int
    
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# CAMPAIGN TARGET SCHEMAS
# ============================================================================

class CampaignTargetResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    sent_at: Optional[datetime]
    opened_at: Optional[datetime]
    clicked_at: Optional[datetime]
    
    class Config:
        from_attributes = True
