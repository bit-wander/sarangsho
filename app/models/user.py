from sqlmodel import SQLModel, Field, Relationship 
from datetime import datetime, timezone  
from typing import Optional, List 
from sqlalchemy import DateTime

def get_datetime_utc() -> datetime: 
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    __tablename__ = "users" 
    
    id: Optional[int] = Field(default=None, primary_key=True) 
    username: str = Field(unique=True, index=True) 
    email: str = Field(unique=True, index=True) 
    password_hash: str
    role: str = Field(default="user") 
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True)) 

    # Relationships
    books: List["Book"] = Relationship(back_populates="user")