import enum
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint, Integer, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base


# Python Enum equivalent to PostgreSQL ENUM
class ReadingStatus(str, enum.Enum):
    WANT_TO_READ = "WANT_TO_READ"
    READING = "READING"
    COMPLETED = "COMPLETED"

class UserBook(Base):
    __tablename__ = "user_books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # Map to Native PostgreSQL ENUM
    status: Mapped[ReadingStatus] = mapped_column(
        ENUM(ReadingStatus, name="reading_status", create_type=True),
        nullable=False,
        default=ReadingStatus.WANT_TO_READ
    )

    pages_read: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    
    rating: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    
    review: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    finish_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships for easy object traversal
    user: Mapped["User"] = relationship(back_populates="books")
    book: Mapped["Book"] = relationship(back_populates="users")
    
    highlights: Mapped[list["Highlight"]] = relationship(back_populates="user_book", cascade="all, delete-orphan")
    notes: Mapped[list["Note"]] = relationship(back_populates="user_book", cascade="all, delete-orphan")

    # Composite Unique Constraint to prevent a user from duplicating the same book entry
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_user_book"),
    )