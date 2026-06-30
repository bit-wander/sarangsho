from typing import List
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base
from .user_book import UserBook


book_genre = Table(
    "book_genre",
    Base.metadata,
    Column("book_id", ForeignKey("books.id", ondelete="CASCADE"), primary_key=True),
    Column("genre_id", ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True)
)

book_author = Table(
    "book_author",
    Base.metadata,
    Column("book_id", ForeignKey("books.id", ondelete="CASCADE"), primary_key=True),
    Column("author_id", ForeignKey("authors.id", ondelete="CASCADE"), primary_key=True)
)

class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    google_books_id: Mapped[str | None] = mapped_column(
        String(length=255), unique=True, index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(
        String(length=255), nullable=False,
        index=True
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    genres: Mapped[List["Genre"]] = relationship(
        secondary=book_genre, 
        back_populates="books"
    )
    authors: Mapped[List["Author"]] = relationship(
        secondary=book_author,
        back_populates="books"
    )
    publisher: Mapped[str | None] = mapped_column(
        String(length=255), nullable=True
    )
    published_year: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    rating: Mapped[int | None] = mapped_column(
        Integer, default=0, nullable=True
    )
    total_pages: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    ISBN: Mapped[str | None] = mapped_column(
        String, nullable=True
    )
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_online_available: Mapped[bool | None] = mapped_column(
        Boolean, default=False, nullable=True
    )
    # Relationships
    users: Mapped[list[UserBook]] = relationship(back_populates="book", cascade="all, delete-orphan")
