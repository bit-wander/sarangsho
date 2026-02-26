
from sqlmodel import SQLModel, Field, Relationship 
from datetime import datetime, timezone  
from typing import Optional, List 
from sqlalchemy import DateTime

class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    rating:int = Field(ge=1, le=5)
    review_text: Optional[str] = Field(default=None) 

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Foreign Key
    book_id: int = Field(index=True, foreign_key="books.id")
    user_id: int = Field(index=True, foreign_key="users.id")

    # Relationships
    book: "Book" = Relationship(back_populates="reviews")
    user: "User" = Relationship(back_populates="reviews")