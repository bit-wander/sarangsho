from pydantic import BaseModel, Field
from typing import List, Optional

from src.models.user_book import ReadingStatus

class BookSearchResponse(BaseModel):
    google_books_id: str = Field(..., description="The unique ID from Google Books API")
    title: str = Field(..., description="The title of the book")
    authors: List[str] = Field(default_factory=list, description="List of authors")
    description: Optional[str] = Field(None, description="A brief snippet or description of the book")
    thumbnail_url: Optional[str] = Field(None, description="URL pointing to the book cover image")

    class Config:
        from_attributes = True


class ShelfUpdateRequest(BaseModel):
    google_books_id: str
    status: ReadingStatus

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="Unique username")
    email: str = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password with minimum 6 characters")
    age: Optional[int] = Field(None, ge=0, description="Age of the user")
    bio: Optional[str] = Field(None, description="Short biography of the user")
    avatar_url: Optional[str] = Field(None, description="Avatar image URL")
    full_name: Optional[str] = Field(None, description="Full name of the user")

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    age: Optional[int]
    bio: Optional[str]
    avatar_url: Optional[str]
    full_name: Optional[str]
    role: Optional[str] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str