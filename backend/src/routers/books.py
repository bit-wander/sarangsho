from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List

from src.database import get_db
from src.models import Book, Author, Genre
from src.schemas import BookSearchResponse

router = APIRouter(prefix="/api/books", tags=["Books"])

@router.get("/search", response_model=List[BookSearchResponse])
async def search_books(
    q: str = Query(..., min_length=1, description="Search query for books"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search for books in the local database (populated from the Rokomari dataset).
    Searches by book title, author name, or genre.
    """
    q_pattern = f"%{q}%"
    
    stmt = (
        select(Book)
        .join(Book.authors, isouter=True)
        .join(Book.genres, isouter=True)
        .where(
            or_(
                Book.title.ilike(q_pattern),
                Author.name.ilike(q_pattern),
                Genre.name.ilike(q_pattern)
            )
        )
        .options(
            selectinload(Book.authors),
            selectinload(Book.genres)
        )
        .distinct()
        .limit(15)
    )
    
    result = await db.execute(stmt)
    books = result.scalars().all()
    
    # If no matches are found, return a default set of popular books to keep the UI active
    if not books:
        stmt_fallback = (
            select(Book)
            .options(
                selectinload(Book.authors),
                selectinload(Book.genres)
            )
            .limit(10)
        )
        res_fallback = await db.execute(stmt_fallback)
        books = res_fallback.scalars().all()
        
    cleaned_books: List[BookSearchResponse] = []
    for b in books:
        author_names = [a.name for a in b.authors] if b.authors else ["Unknown Author"]
        cleaned_books.append(
            BookSearchResponse(
                google_books_id=b.google_books_id or f"db-{b.id}",
                title=b.title,
                authors=author_names,
                description=b.description or "",
                thumbnail_url=b.thumbnail_url
            )
        )
        
    return cleaned_books