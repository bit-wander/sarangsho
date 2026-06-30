from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.database import get_db
from src.models import Book, Author, Genre, User, UserRole
from src.security import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Helper Dependency to restrict to Admin only
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges to perform this action."
        )
    return current_user

# --- Pydantic Schemas ---
class AdminBookResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    publisher: Optional[str] = None
    published_year: Optional[str] = None
    rating: Optional[float] = None
    total_pages: int
    ISBN: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_online_available: bool
    authors: List[str]
    genres: List[str]

    class Config:
        from_attributes = True

class BookCreateUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    publisher: Optional[str] = None
    published_year: Optional[str] = None
    total_pages: int = 100
    ISBN: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_online_available: bool = False
    authors: List[str] = []
    genres: List[str] = []

class AdminAuthorResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AuthorCreateUpdate(BaseModel):
    name: str
    description: Optional[str] = None

class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class UserAdminUpdate(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None

# --- Book Endpoints ---
@router.get("/books", response_model=List[AdminBookResponse])
async def get_books(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Book).options(selectinload(Book.authors), selectinload(Book.genres)).order_by(Book.id.desc())
    res = await db.execute(stmt)
    books = res.scalars().all()
    
    out = []
    for b in books:
        out.append(AdminBookResponse(
            id=b.id,
            title=b.title,
            description=b.description,
            publisher=b.publisher,
            published_year=b.published_year,
            rating=b.rating,
            total_pages=b.total_pages or 100,
            ISBN=b.ISBN,
            thumbnail_url=b.thumbnail_url,
            is_online_available=b.is_online_available or False,
            authors=[a.name for a in b.authors] if b.authors else [],
            genres=[g.name for g in b.genres] if b.genres else []
        ))
    return out

@router.post("/books", response_model=AdminBookResponse)
async def create_book(payload: BookCreateUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    # Create book
    new_book = Book(
        title=payload.title,
        description=payload.description,
        publisher=payload.publisher,
        published_year=payload.published_year,
        total_pages=payload.total_pages,
        ISBN=payload.ISBN,
        thumbnail_url=payload.thumbnail_url,
        is_online_available=payload.is_online_available,
        authors=[],
        genres=[]
    )
    
    # Process authors
    for author_name in payload.authors:
        if not author_name.strip():
            continue
        stmt = select(Author).where(Author.name == author_name.strip())
        res = await db.execute(stmt)
        author = res.scalars().first()
        if not author:
            author = Author(name=author_name.strip())
            db.add(author)
        new_book.authors.append(author)
        
    # Process genres
    for genre_name in payload.genres:
        if not genre_name.strip():
            continue
        stmt = select(Genre).where(Genre.name == genre_name.strip())
        res = await db.execute(stmt)
        genre = res.scalars().first()
        if not genre:
            genre = Genre(name=genre_name.strip())
            db.add(genre)
        new_book.genres.append(genre)
        
    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)
    
    return AdminBookResponse(
        id=new_book.id,
        title=new_book.title,
        description=new_book.description,
        publisher=new_book.publisher,
        published_year=new_book.published_year,
        rating=new_book.rating,
        total_pages=new_book.total_pages,
        ISBN=new_book.ISBN,
        thumbnail_url=new_book.thumbnail_url,
        is_online_available=new_book.is_online_available,
        authors=[a.name for a in new_book.authors],
        genres=[g.name for g in new_book.genres]
    )

@router.put("/books/{book_id}", response_model=AdminBookResponse)
async def update_book(book_id: int, payload: BookCreateUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Book).where(Book.id == book_id).options(selectinload(Book.authors), selectinload(Book.genres))
    res = await db.execute(stmt)
    book = res.scalars().first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    book.title = payload.title
    book.description = payload.description
    book.publisher = payload.publisher
    book.published_year = payload.published_year
    book.total_pages = payload.total_pages
    book.ISBN = payload.ISBN
    book.thumbnail_url = payload.thumbnail_url
    book.is_online_available = payload.is_online_available
    
    # Clear and rebuild authors
    book.authors = []
    for author_name in payload.authors:
        if not author_name.strip():
            continue
        stmt_a = select(Author).where(Author.name == author_name.strip())
        res_a = await db.execute(stmt_a)
        author = res_a.scalars().first()
        if not author:
            author = Author(name=author_name.strip())
            db.add(author)
        book.authors.append(author)
        
    # Clear and rebuild genres
    book.genres = []
    for genre_name in payload.genres:
        if not genre_name.strip():
            continue
        stmt_g = select(Genre).where(Genre.name == genre_name.strip())
        res_g = await db.execute(stmt_g)
        genre = res_g.scalars().first()
        if not genre:
            genre = Genre(name=genre_name.strip())
            db.add(genre)
        book.genres.append(genre)
        
    await db.commit()
    await db.refresh(book)
    
    return AdminBookResponse(
        id=book.id,
        title=book.title,
        description=book.description,
        publisher=book.publisher,
        published_year=book.published_year,
        rating=book.rating,
        total_pages=book.total_pages,
        ISBN=book.ISBN,
        thumbnail_url=book.thumbnail_url,
        is_online_available=book.is_online_available,
        authors=[a.name for a in book.authors],
        genres=[g.name for g in book.genres]
    )

@router.delete("/books/{book_id}")
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Book).where(Book.id == book_id)
    res = await db.execute(stmt)
    book = res.scalars().first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    await db.delete(book)
    await db.commit()
    return {"message": f"Book '{book.title}' deleted successfully"}

# --- Author Endpoints ---
@router.get("/authors", response_model=List[AdminAuthorResponse])
async def get_authors(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Author).order_by(Author.id.desc())
    res = await db.execute(stmt)
    authors = res.scalars().all()
    return authors

@router.post("/authors", response_model=AdminAuthorResponse)
async def create_author(payload: AuthorCreateUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Author).where(Author.name == payload.name.strip())
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="Author already exists")
        
    author = Author(name=payload.name.strip(), description=payload.description)
    db.add(author)
    await db.commit()
    await db.refresh(author)
    return author

@router.put("/authors/{author_id}", response_model=AdminAuthorResponse)
async def update_author(author_id: int, payload: AuthorCreateUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Author).where(Author.id == author_id)
    res = await db.execute(stmt)
    author = res.scalars().first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
        
    author.name = payload.name.strip()
    author.description = payload.description
    await db.commit()
    await db.refresh(author)
    return author

@router.delete("/authors/{author_id}")
async def delete_author(author_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(Author).where(Author.id == author_id)
    res = await db.execute(stmt)
    author = res.scalars().first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
        
    await db.delete(author)
    await db.commit()
    return {"message": f"Author '{author.name}' deleted successfully"}

# --- User Endpoints ---
@router.get("/users", response_model=List[AdminUserResponse])
async def get_users(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(User).order_by(User.id.desc())
    res = await db.execute(stmt)
    users = res.scalars().all()
    
    out = []
    for u in users:
        out.append(AdminUserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            full_name=u.full_name,
            role=u.role.value if hasattr(u.role, "value") else str(u.role),
            avatar_url=u.avatar_url,
            created_at=u.created_at.isoformat() if u.created_at else datetime.utcnow().isoformat()
        ))
    return out

@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(user_id: int, payload: UserAdminUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.username = payload.username
    user.email = payload.email
    user.full_name = payload.full_name
    user.avatar_url = payload.avatar_url
    user.role = UserRole(payload.role.upper())
    
    await db.commit()
    await db.refresh(user)
    
    return AdminUserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        avatar_url=user.avatar_url,
        created_at=user.created_at.isoformat() if user.created_at else datetime.utcnow().isoformat()
    )

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own administrative account")
        
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    return {"message": f"User card '{user.username}' revoked successfully"}
