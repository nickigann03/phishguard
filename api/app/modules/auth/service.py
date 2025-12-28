from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from datetime import datetime

from app.core.models.user import User
from app.core.models.organization import Organization
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.modules.auth.schemas import LoginRequest, UserCreate, UserResponse, Token

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate_user(self, login_data: LoginRequest) -> Token:
        """
        Authenticate a user and return tokens.
        """
        # 1. Find user by email
        result = await self.db.execute(select(User).filter(User.email == login_data.email))
        user = result.scalar_one_or_none()

        # 2. Verify password
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 3. Check if active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account",
            )

        # 4. Generate tokens
        token_data = {
            "sub": str(user.id),
            "org_id": str(user.org_id),
            "role": user.role
        }
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await self.db.commit()

        return Token(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
            token_type="bearer"
        )

    async def register_user(self, user_data: UserCreate) -> UserResponse:
        """
        Register a new user and organization.
        """
        # 1. Check if user already exists
        result = await self.db.execute(select(User).filter(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # 2. Check if Org name exists (optional, maybe allow duplicates or handle better)
        # For this MVP, let's create a new Org for every registration if not specified otherwise.
        
        # Create Organization
        new_org = Organization(
            name=user_data.org_name,
            domain=user_data.email.split('@')[1], # Simple domain extraction
            subscription_tier="free"
        )
        self.db.add(new_org)
        await self.db.flush() # Get ID for org

        # 3. Create User
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hash_password(user_data.password),
            org_id=new_org.id,
            role="admin" # First user is always admin
        )
        self.db.add(new_user)
        
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))
