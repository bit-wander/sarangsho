from typing import Optional
from sqlmodel import SQLModel
from datetime import datetime

class ReviewBase(SQLModel):
    rating: int
    book_id: int
    review_text: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True