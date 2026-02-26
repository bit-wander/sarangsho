from fastapi import APIRouter, Depends, HTTPException, status 
from sqlmodel import Session, select 
from app.db.database import get_session 
from app.models.book import Book 
from app.schemas.book import BookCreate, BookUpdate, BookResponse 
from typing import List, Optional
from fastapi import Query

router = APIRouter(prefix="/books", tags=["Books"]) 


# Create a new book 
@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED) 
def create_book(
    book: BookCreate, 
    session: Session = Depends(get_session)
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
    genre:Optional[str] = None
) -> List[Book]: 
    statement = select(Book) 
    if genre: 
        statement = statement.where(Book.genre == genre) 
    books = session.exec(statement.offset(skip).limit(limit)).all() 
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
    session: Session = Depends(get_session)
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
    session: Session = Depends(get_session)
) -> None: 
    book = session.get(Book, book_id) 
    if not book: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found") 
    session.delete(book) 
    session.commit() 
