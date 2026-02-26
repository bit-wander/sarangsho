from typing import Optional 
from pydantic import BaseModel 
from datetime import datetime 

class BookBase(BaseModel): 
    title: str 
    author: str 
    description: Optional[str] = None 
    isbn: Optional[str] = None 
    genre: Optional[str] = None 
    cover_image: Optional[str] = None 
    published_date: Optional[datetime] = None 
    created_by: Optional[int] = None 

class BookCreate(BookBase): 
    pass 

class BookUpdate(BookBase): 
    pass 

class BookResponse(BookBase): 
    id: int 
    created_at: datetime 
    average_rating: Optional[float] = None 

    class Config: 
        from_attributes = True 