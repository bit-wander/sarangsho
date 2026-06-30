from datetime import datetime, timezone
from sqlalchemy import ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class Highlight(Base):
    __tablename__ = "highlights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_book_id: Mapped[int] = mapped_column(
        ForeignKey("user_books.id", ondelete="CASCADE"), 
        nullable=False
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationship back to UserBook
    user_book: Mapped["UserBook"] = relationship(back_populates="highlights")
    
    # Relationship to notes attached to this highlight
    notes: Mapped[list["Note"]] = relationship(back_populates="highlight", cascade="all, delete-orphan")
