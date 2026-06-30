from datetime import datetime, timezone
from sqlalchemy import ForeignKey, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_book_id: Mapped[int] = mapped_column(
        ForeignKey("user_books.id", ondelete="CASCADE"), 
        nullable=False
    )
    highlight_id: Mapped[int | None] = mapped_column(
        ForeignKey("highlights.id", ondelete="CASCADE"), 
        nullable=True
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user_book: Mapped["UserBook"] = relationship(back_populates="notes")
    highlight: Mapped["Highlight"] = relationship(back_populates="notes")
