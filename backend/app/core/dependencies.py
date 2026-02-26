from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.jwt import decode_access_token
from app.models.user import User
from app.db.database import get_session
from sqlmodel import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User: 
    payload = decode_access_token(token) 
    user = session.get(User, payload["sub"]) 
    if not user: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
            ) 
    return user 

def get_current_admin(current_user: User = Depends(get_current_user)) -> User: 
    if current_user.role != "admin": 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin privileges required"
            ) 
    return current_user 