from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime, ForeignKey, Float, Date, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    # Identity
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)  # NULL if OAuth only
    
    # Profile
    role = Column(String(50), nullable=False, default='employee')
    department = Column(String(100), nullable=True)
    job_title = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Gamification
    xp_total = Column(Integer, nullable=False, default=0, index=True)
    level = Column(Integer, nullable=False, default=1)
    streak_days = Column(Integer, nullable=False, default=0)
    last_streak_date = Column(Date, nullable=True)
    
    # Risk
    risk_score = Column(Float, nullable=False, default=0.5, index=True)
    risk_trend = Column(String(20), default='stable')
    last_simulation_at = Column(DateTime(timezone=True), nullable=True)
    
    # Training
    training_completed = Column(JSON, nullable=False, default=[])
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="users")
    manager = relationship("User", remote_side=[id])
