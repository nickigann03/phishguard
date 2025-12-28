from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from uuid import uuid

from app.core.models import Organisation, User
from app.core.schemas import OrganisationCreate, OrganisationUpdate

class OrganisationRepository:
    """
    Repository for Organisation model

    This pattern separates database logic from busiiness logic
    """
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, org_data: Organisationcreate) -> Organisation:
        """Create a new organisation"""
        db_org = Organisation(
            name = org_data.name,
            domain = org_data.domain,
            settings = {}
        )

        try:
            self.db.add(db_org)
            self.db.commit()
            self.db.refresh(db_org)
            return db_org
        except IntegrityError as e:
            # Domain already exists (unique constraint)
            raise ValueError(f"Organisation with domain '{org_data.domain}' already exists")
    
    def get_by_id(self, org_id: uuid) -> Optional[Organisation]:
        """Get an organisation by ID"""
        return self.db.query(Organisation).filter(Organisation.id == org_id).first()
    
    def get_by_domain(self, domain: str) -> Optional[Organisation]:
        """Get an organisation by domain"""
        return self.db.query(Organisation).filter(Organisation.domain == domain).first()
    
    def list_all(self, skip: int = 0, limit: int = 100) -> List[Organisation]:
        """List all organisations"""
        return self.db.query(Organisation).offset(skip).limit(limit).all()

    def update(self, org_id: uuid, org_data: OrganisationUpdate) -> Optional[Organisation]:
        """Update an organisation"""
        db_org = self.get_by_id(org_id)
        if not db_org:
            return None
        
        # Update only provided fields
        update_data = org_data.model_dump(exclude_unset = True)
        for field, value in update_data.items():
            setattr(db_org, field, value)
        
        self.db.commit()
        self.db.refresh(db_org)
        return db_org
    
    def delete(self, org_id: uuid) -> bool:
        """Delete an organisatio (soft delete by setting is_active=False)"""
        db_org = self.get_by_id(org_id)
        if not db_org:
            return False
        
        db_org.is_active = False
        self.db.commit()
        return True
    
    class UserRepository:
        """Repository for User database operations"""

        def __init__(self, db: Session):
            self.db = db
        
        def get_by_email(self, email: str) -> Optional[User]:
            """Get a user by email"""
            return self.db.query(User).filter(User.email == email).first()
        
        def get_by_org(self, org_id: uuid, skip: int = 0, limit: int = 100) -> List[User]:
            """Get all users by organisation ID"""
            return self.db.query(User).filter(User.organisation_id == org_id).offset(skip).limit(limit).all()
