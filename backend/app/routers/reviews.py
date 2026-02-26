from fastapi import APIRouter, Depends, HTTPException, status 
from sqlmodel import Session, select 
from app.db.database import get_session 
from app.models.review import Review 
from app.models.book import Book
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse 
from typing import List, Optional
from fastapi import Query
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"]) 

# Create a new review 
@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED) 
def create_review(
    review: ReviewCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> Review: 

    # Check if book exists
    book = session.get(Book, review.book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    # Check if user already reviewed this book
    existing_review = session.exec(
        select(Review).where(Review.book_id == review.book_id, Review.user_id == current_user.id)
    ).first()
    if existing_review:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already reviewed this book")

    db_review = Review(**review.dict(), user_id=current_user.id) 
    session.add(db_review) 
    session.commit() 
    session.refresh(db_review) 
    return db_review 

# Get reviews for a book
@router.get("/book/{book_id}", response_model=List[ReviewResponse])
def get_book_reviews(
    book_id: int,
    session: Session = Depends(get_session)
) -> List[Review]:
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    reviews = session.exec(select(Review).where(Review.book_id == book_id)).all()
    return reviews

# Delete reviews (owner or admin)
@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> None:
    review = session.get(Review, review_id)

    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    session.delete(review)
    session.commit()
