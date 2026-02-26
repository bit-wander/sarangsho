from sqlmodel import SQLModel, Field, Relationship 
from datetime import datetime, timezone  
from typing import Optional 
from sqlalchemy import DateTime

def get_datetime_utc() -> datetime: 
    return datetime.now(timezone.utc)

class Book(SQLModel, table=True): 
    __tablename__ = "books" 

    id: Optional[int] = Field(default=None, primary_key=True) 
    title: str = Field(index=True) 
    author: str 
    description: Optional[str] = Field(default=None) 
    isbn: Optional[str] = Field(default=None, unique=True)
    genre: Optional[str] = Field(default=None, index=True)
    cover_image: Optional[str] = Field(default=None) 
    published_date: Optional[datetime] = Field(default=None) 
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True)) 
    created_by: Optional[int] = Field(default=None, foreign_key="users.id") 

    # Relationships
    user: Optional["User"] = Relationship(back_populates="books") 
    