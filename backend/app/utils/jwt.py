import jwt 
from datetime import datetime, timedelta 
from app.core.config import settings 
from fastapi import HTTPException, status

def create_access_token(data: dict) -> str: 
    to_encode = data.copy() 
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES) 
    to_encode.update({"exp": expire}) 
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM) 
    return encoded_jwt 

def decode_access_token(token: str) -> dict: 
    try: 
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]) 
        return payload 
    except jwt.ExpiredSignatureError: 
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") 
    except jwt.InvalidTokenError: 
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") 