from fastapi import APIRouter, Depends, HTTPException, status 
from sqlmodel import Session, select, func
from app.db.database import get_session 
from app.models.book import Book 
from app.schemas.book import BookCreate, BookUpdate, BookResponse 
from app.models.review import Review
from typing import List, Optional
from fastapi import Query
from sqlalchemy import or_
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.utils.file_upload import save_cover_image
from fastapi import File, UploadFile
import os

router = APIRouter(prefix="/books", tags=["Books"]) 
UPLOAD_DIR = "uploads/covers"

# Create a new book 
@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED) 
def create_book(
    book: BookCreate, 
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin)
) -> Book: 
    db_book = Book(**book.dict()) 
    session.add(db_book) 
    session.commit() 
    session.refresh(db_book) 
    return db_book 

# Get all books 
@router.get("/", response_model=List[BookResponse]) 
def read_books(
    session: Session = Depends(get_session),
    skip:int = 0,
    limit:int = Query(default=10, le=100),
    search: Optional[str] = None,
    genre:Optional[str] = None,
    sort_by_rating: bool = False
):

    statement = (
        select(
            Book,
            func.avg(Review.rating).label("average_rating")
            )
        .outerjoin(Review)
        .group_by(Book.id)
        .order_by(func.avg(Review.rating).desc() if sort_by_rating else Book.id) 
    ) 

    # Search by title, author, or description
    if search:
        search_term = f"%{search}%" 
        statement = statement.where(
            or_(
                Book.title.ilike(search_term),
                Book.author.ilike(search_term),
                Book.description.ilike(search_term),
            )
        )

    # Filter by genre
    if genre: 
        statement = statement.where(Book.genre == genre) 

    # Sort by rating if sort_by_rating is True
    if sort_by_rating:
        statement = statement.order_by(func.avg(Review.rating).desc())
    else:
        statement = statement.order_by(Book.created_at.desc())

    books = session.exec(statement.offset(skip).limit(limit)).all() 

    books = [
        BookResponse(
            **book.model_dump(),
            average_rating=rating
        )
        for book, rating in books
    ]

    return books


# Get a single book by ID 
@router.get("/{book_id}", response_model=BookResponse) 
def read_book(
    book_id: int, 
    session: Session = Depends(get_session)
) -> Book: 
    book = session.get(Book, book_id) 
    if not book: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found") 
    return book 


# Update a book 
@router.put("/{book_id}", response_model=BookResponse) 
def update_book(
    book_id: int, 
    book: BookUpdate, 
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin)
) -> Book: 
    db_book = session.get(Book, book_id) 
    if not db_book: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found") 
    
    book_data = book.dict(exclude_unset=True) 
    for key, value in book_data.items(): 
        setattr(db_book, key, value) 
    
    session.add(db_book) 
    session.commit() 
    session.refresh(db_book) 
    return db_book 


# Delete a book 
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT) 
def delete_book(
    book_id: int, 
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin)
) -> None: 
    book = session.get(Book, book_id) 
    if not book: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found") 
    session.delete(book) 
    session.commit() 

@router.get("/{book_id}/rating")
def get_book_average_rating(book_id: int, session: Session = Depends(get_session)):
    statement = select(func.avg(Review.rating)).where(Review.book_id == book_id)
    average_rating = session.exec(statement).first()
    return {
        "book_id": book_id,
        "average_rating": round(average_rating, 2) if average_rating else 0
        }

@router.post("/{book_id}/upload-cover")
def upload_book_cover(
    book_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin)
) -> str:

    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    if book.cover_image:
        old_cover_path = book.cover_image.replace("/uploads/covers/", "")
        old_cover_path = os.path.join(UPLOAD_DIR, old_cover_path)
        if os.path.exists(old_cover_path):
            os.remove(old_cover_path)
    
    cover_path = save_cover_image(file)
    book.cover_image = cover_path
    session.add(book)
    session.commit()
    session.refresh(book)
    return cover_path