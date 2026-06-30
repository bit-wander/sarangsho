from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from sqlalchemy import select

from src.database import get_db
from src.operations import create_user, get_user
from src.security import authenticate_user, create_access_token, get_current_user
from src.schemas import UserRegisterRequest, UserResponse, TokenResponse
from src.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterRequest, 
    db: AsyncSession = Depends(get_db)
):
    # Check if email is already registered
    stmt_email = select(User).where(User.email == payload.email)
    res_email = await db.execute(stmt_email)
    if res_email.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
        
    # Check if username is already taken
    stmt_username = select(User).where(User.username == payload.username)
    res_username = await db.execute(stmt_username)
    if res_username.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already taken"
        )

    user_id = await create_user(
        db_session=db,
        username=payload.username,
        email=payload.email,
        password=payload.password,
        age=payload.age,
        bio=payload.bio,
        full_name=payload.full_name,
        avatar_url=payload.avatar_url
    )
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to create user account"
        )
        
    user = await get_user(db, user_id)
    return user

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
