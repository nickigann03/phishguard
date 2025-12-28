from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.schemas import LoginRequest, UserCreate, UserResponse, Token
from app.modules.auth.service import AuthService
from app.core.security import get_current_user_id

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    service = AuthService(db)
    # Map OAuth2 form data to our LoginRequest
    login_data = LoginRequest(email=form_data.username, password=form_data.password)
    return await service.authenticate_user(login_data)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user and organization.
    """
    service = AuthService(db)
    return await service.register_user(user_data)

@router.get("/me")
async def read_users_me(
    user_id: str = Depends(get_current_user_id)
):
    """
    Get current user information.
    """
    return {"id": user_id, "message": "User details endpoint implementation pending"}
