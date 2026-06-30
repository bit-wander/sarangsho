from typing import Annotated
from fastapi import Depends, status, HTTPException
from datetime import datetime, timedelta, timezone
from email_validator import validate_email, EmailNotValidError
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt 
from sqlalchemy import select
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

from src.models.user import User
from src.database import get_db

# Secret key and algorithm for JWT encoding/decoding
SECRET_KEY = "A very secret key"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 30  # Increased token expiration for better local testing experience

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

salt = bcrypt.gensalt()

def create_hash(raw_password: str) -> str:
    return bcrypt.hashpw(
        raw_password.encode(), 
        salt
    ).decode()

def verify_password(raw_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            raw_password.encode(), 
            hashed_password.encode()
        )
    except Exception:
        return False

async def authenticate_user(
    db_session: AsyncSession, 
    username_or_email: str,
    password: str
):
    try: 
        validate_email(username_or_email, check_deliverability=False)
        query_filter = User.email
    except EmailNotValidError:
        query_filter = User.username

    query = (
        select(User)
        .where(query_filter == username_or_email)
    )    
    result = await db_session.execute(query)
    user = result.scalars().first()
    
    if not user or not verify_password(password, user.hashed_password):
        return None

    return user

def create_access_token(data: dict) -> str:
    token_data = data.copy() 
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    token_data.update({"exp": expire_time})
    access_token = jwt.encode(
        token_data, SECRET_KEY, algorithm=ALGORITHM
    )
    return access_token

async def decode_access_token(token: str, db_session: AsyncSession):
    from src.operations import get_user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id: 
            return None
        user = await get_user(db_session, int(user_id))
        return user
    except (JWTError, ValueError):
        return None

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db_session: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = await decode_access_token(token, db_session)
    if user is None:
        raise credentials_exception
    return user