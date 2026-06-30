from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

from src.database import get_db
from src.models import Book, UserBook, ReadingStatus, User, Highlight, Note, Author, Genre
from src.security import get_current_user

router = APIRouter(prefix="/api/shelves", tags=["Shelves"])

# Pydantic Schemas for Sync
class HighlightSync(BaseModel):
    id: str
    text: str
    color: str
    createdAt: str

class NoteSync(BaseModel):
    id: str
    highlightId: Optional[str] = None
    text: str
    createdAt: str

class BookSync(BaseModel):
    id: str
    title: str
    author: str
    coverUrl: Optional[str] = ""
    category: str  # "Currently Reading" | "Already Finished" | "Plan to Read"
    currentPage: int
    totalPages: int
    rating: Optional[int] = None
    review: Optional[str] = None
    description: Optional[str] = ""
    genre: Optional[str] = ""
    publishedYear: Optional[str] = ""
    isbn: Optional[str] = ""
    isOnlineAvailable: Optional[bool] = False
    publisher: Optional[str] = ""
    highlights: Optional[List[HighlightSync]] = []
    notes: Optional[List[NoteSync]] = []

def map_category_to_status(category: str) -> ReadingStatus:
    if category == "Currently Reading":
        return ReadingStatus.READING
    elif category == "Already Finished":
        return ReadingStatus.COMPLETED
    return ReadingStatus.WANT_TO_READ

def map_status_to_category(status: ReadingStatus) -> str:
    if status == ReadingStatus.READING:
        return "Currently Reading"
    elif status == ReadingStatus.COMPLETED:
        return "Already Finished"
    return "Plan to Read"

@router.get("", status_code=status.HTTP_200_OK)
async def get_shelf(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all books on the current user's shelf including highlights and notes.
    """
    stmt = (
        select(UserBook)
        .where(UserBook.user_id == current_user.id)
        .options(
            selectinload(UserBook.book).selectinload(Book.authors),
            selectinload(UserBook.book).selectinload(Book.genres),
            selectinload(UserBook.highlights),
            selectinload(UserBook.notes)
        )
    )
    result = await db.execute(stmt)
    user_books = result.scalars().all()
    
    response_books = []
    for ub in user_books:
        book = ub.book
        # Resolve authors and genres
        author_names = ", ".join([a.name for a in book.authors]) if book.authors else "Unknown Author"
        genre_name = book.genres[0].name if book.genres else "General"
        
        response_books.append({
            "id": book.google_books_id or f"db-{book.id}",
            "title": book.title,
            "author": author_names,
            "coverUrl": book.thumbnail_url or "",
            "category": map_status_to_category(ub.status),
            "currentPage": ub.pages_read,
            "totalPages": book.total_pages,
            "rating": ub.rating,
            "review": ub.review,
            "description": book.description or "",
            "genre": genre_name,
            "publishedYear": book.published_year or "",
            "isbn": book.ISBN or "",
            "isOnlineAvailable": book.is_online_available or False,
            "publisher": book.publisher or "",
            "highlights": [
                {
                    "id": h.id,  # Keep integer or string representation
                    "text": h.text,
                    "color": h.color,
                    "createdAt": h.created_at.isoformat() if h.created_at else ""
                } for h in ub.highlights
            ],
            "notes": [
                {
                    "id": n.id,
                    "highlightId": n.highlight_id,
                    "text": n.text,
                    "createdAt": n.created_at.isoformat() if n.created_at else ""
                } for n in ub.notes
            ]
        })
        
    return response_books

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_shelf(
    payload: List[BookSync],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk synchronize books, progress, highlights, and notes from local storage.
    """
    for b_sync in payload:
        # 1. Resolve or create Book
        stmt_book = select(Book).where(Book.google_books_id == b_sync.id)
        res_book = await db.execute(stmt_book)
        book = res_book.scalars().first()
        
        if not book:
            book = Book(
                google_books_id=b_sync.id,
                title=b_sync.title,
                description=b_sync.description,
                publisher=b_sync.publisher,
                published_year=b_sync.publishedYear,
                total_pages=b_sync.totalPages,
                ISBN=b_sync.isbn,
                thumbnail_url=b_sync.coverUrl,
                is_online_available=b_sync.isOnlineAvailable
            )
            db.add(book)
            await db.flush() # Ensure we get book.id
            
            # Resolve Author
            if b_sync.author:
                author_names = [name.strip() for name in b_sync.author.split(",")]
                for name in author_names:
                    stmt_auth = select(Author).where(Author.name == name)
                    res_auth = await db.execute(stmt_auth)
                    author = res_auth.scalars().first()
                    if not author:
                        author = Author(name=name, description="")
                        db.add(author)
                        await db.flush()
                    book.authors.append(author)
            
            # Resolve Genre
            if b_sync.genre:
                stmt_genre = select(Genre).where(Genre.name == b_sync.genre)
                res_genre = await db.execute(stmt_genre)
                genre = res_genre.scalars().first()
                if not genre:
                    genre = Genre(name=b_sync.genre)
                    db.add(genre)
                    await db.flush()
                book.genres.append(genre)
                
            await db.flush()

        # 2. Resolve or create UserBook
        stmt_ub = select(UserBook).where(
            UserBook.user_id == current_user.id,
            UserBook.book_id == book.id
        )
        res_ub = await db.execute(stmt_ub)
        ub = res_ub.scalars().first()
        
        now = datetime.now(timezone.utc)
        status_val = map_category_to_status(b_sync.category)
        
        if not ub:
            ub = UserBook(
                user_id=current_user.id,
                book_id=book.id,
                status=status_val,
                pages_read=b_sync.currentPage,
                rating=b_sync.rating,
                review=b_sync.review,
                start_date=now if status_val in [ReadingStatus.READING, ReadingStatus.COMPLETED] else None,
                finish_date=now if status_val == ReadingStatus.COMPLETED else None
            )
            db.add(ub)
            await db.flush()
        else:
            ub.status = status_val
            ub.pages_read = b_sync.currentPage
            ub.rating = b_sync.rating
            ub.review = b_sync.review
            if status_val == ReadingStatus.READING and not ub.start_date:
                ub.start_date = now
            elif status_val == ReadingStatus.COMPLETED and not ub.finish_date:
                ub.finish_date = now
            await db.flush()

        # 3. Synchronize Highlights and Notes (Recreation Strategy)
        # Delete existing notes first (since they depend on highlights)
        await db.execute(delete(Note).where(Note.user_book_id == ub.id))
        await db.execute(delete(Highlight).where(Highlight.user_book_id == ub.id))
        await db.flush()
        
        # Insert highlights
        highlight_mapping = {} # client_id -> db_id
        for hl in b_sync.highlights:
            dt = datetime.fromisoformat(hl.createdAt.replace("Z", "+00:00")) if hl.createdAt else now
            db_hl = Highlight(
                user_book_id=ub.id,
                text=hl.text,
                color=hl.color,
                created_at=dt
            )
            db.add(db_hl)
            await db.flush()
            highlight_mapping[hl.id] = db_hl.id
            
        # Insert notes
        for nt in b_sync.notes:
            dt = datetime.fromisoformat(nt.createdAt.replace("Z", "+00:00")) if nt.createdAt else now
            mapped_hl_id = highlight_mapping.get(nt.highlightId) if nt.highlightId else None
            db_nt = Note(
                user_book_id=ub.id,
                highlight_id=mapped_hl_id,
                text=nt.text,
                created_at=dt
            )
            db.add(db_nt)
            
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync database commit failed: {str(e)}"
        )
        
    return {"message": "Shelf synced successfully."}

@router.delete("/{book_id}", status_code=status.HTTP_200_OK)
async def delete_from_shelf(
    book_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a book from the user's shelf.
    """
    # Find book by google_books_id
    stmt_book = select(Book).where(Book.google_books_id == book_id)
    res_book = await db.execute(stmt_book)
    book = res_book.scalars().first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found in database.")
        
    stmt_del = delete(UserBook).where(
        UserBook.user_id == current_user.id,
        UserBook.book_id == book.id
    )
    result = await db.execute(stmt_del)
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Book not found on user's shelf.")
        
    return {"message": "Book removed from shelf."}