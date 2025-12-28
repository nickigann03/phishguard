from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime, ForeignKey, Time, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from sqlalchemy.sql import func

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    # Basic info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default='draft')  # draft, scheduled, running, completed, cancelled
    
    # Template
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=True)
    
    # Targeting
    target_type = Column(String(20), nullable=False, default='all') # all, department, custom
    target_config = Column(JSON, nullable=False, default={}) # {"departments": ["HR", "IT"]} or {"user_ids": [...]}
    
    # Scheduling
    scheduled_start = Column(DateTime(timezone=True), nullable=True)
    timezone = Column(String(50), nullable=False, default='Asia/Kuala_Lumpur')
    
    # Stats (Aggregated)
    total_targets = Column(Integer, default=0)
    emails_sent = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    links_clicked = Column(Integer, default=0)
    credentials_submitted = Column(Integer, default=0)
    
    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    targets = relationship("CampaignTarget", back_populates="campaign", cascade="all, delete-orphan")
    template = relationship("Template")
    creator = relationship("User")


class CampaignTarget(Base):
    """Individual user targeted in a campaign"""
    __tablename__ = "campaign_targets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Tracking
    tracking_id = Column(String(32), unique=True, nullable=False, index=True) # The unique ID in the link
    status = Column(String(20), nullable=False, default='pending') # pending, sent, delivered, failed
    
    # Events
    sent_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reported_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign = relationship("Campaign", back_populates="targets")
    user = relationship("User")
