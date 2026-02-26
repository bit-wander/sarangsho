from fastapi import APIRouter, Depends, HTTPException 
from fastapi.security import OAuth2PasswordRequestForm 
from sqlmodel import Session, select
from app.db.database import get_session 
from app.models.user import User 
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password 
from app.utils.jwt import create_access_token 
from sqlalchemy import or_

router = APIRouter(prefix="/auth", tags=["Authentication"]) 

@router.post("/register") 
def register(user: UserCreate, session: Session = Depends(get_session)): 
    statement = select(User).where(or_(
        User.email == user.email,
        User.username == user.username
    ))

    existing_user = session.exec(statement).first() 

    if existing_user: 
        raise HTTPException(status_code=400, detail="User already exists") 
    
    new_user = User(
        username=user.username, 
        email=user.email, 
        password_hash=hash_password(user.password)
    ) 
    session.add(new_user) 
    session.commit() 
    session.refresh(new_user) 
    return {"message": "User registered successfully"} 

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: Session = Depends(get_session)): 
    
    statement = select(User).where(User.email == form_data.username) 
    existing_user = session.exec(statement).first() 

    if not existing_user or not verify_password(form_data.password, existing_user.password_hash): 
        raise HTTPException(status_code=401, detail="Invalid credentials") 
    
    access_token = create_access_token(data={"sub": str(existing_user.id), "role": existing_user.role}) 
    return {"access_token": access_token, "token_type": "bearer"} 
