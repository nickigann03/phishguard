from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from sqlalchemy.sql import func

class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True) # Null = System Template
    
    # Localization
    country_code = Column(String(2), nullable=False, index=True) # MY, SG, etc
    language = Column(String(10), nullable=False, default='en')
    
    # Brand impersonation
    brand_category = Column(String(50), nullable=False) # banking, government, etc
    brand_name = Column(String(100), nullable=False)
    brand_logo_url = Column(Text, nullable=True)
    
    # Content
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(500), nullable=False)
    body_html = Column(Text, nullable=False)
    body_text = Column(Text, nullable=True)
    
    # Classification
    attack_type = Column(String(50), nullable=False) # credential_harvest, etc
    difficulty = Column(String(20), nullable=False) # beginner, intermediate, advanced
    tags = Column(ARRAY(String), default=[])
    
    # Stats
    times_used = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization")
