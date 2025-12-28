from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from sqlalchemy.sql import func

class LandingPage(Base):
    __tablename__ = "landing_pages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    
    name = Column(String(255), nullable=False)
    page_type = Column(String(30), nullable=False) # credential_form, download, etc
    html_content = Column(Text, nullable=False)
    
    # Configuration
    capture_fields = Column(ARRAY(String), default=[])
    redirect_url = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization")
