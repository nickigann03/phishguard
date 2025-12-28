from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False, unique=True)
    
    # Localization
    country_code = Column(String(2), nullable=False, default='MY')
    timezone = Column(String(50), nullable=False, default='Asia/Kuala_Lumpur')
    primary_language = Column(String(10), nullable=False, default='en')
    
    # Configuration
    settings = Column(JSON, nullable=False, default={})
    subscription_tier = Column(String(20), nullable=False, default='free')
    features = Column(JSON, nullable=False, default=[])
    
    # Limits
    max_users = Column(Integer, nullable=False, default=25)
    max_campaigns_per_month = Column(Integer, nullable=False, default=2)
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
