import enum
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base
from datetime import datetime, timezone


'''
Table reviews {
  id integer [primary key]
  book_id integer
  title varchar
  body text [note: 'Content of the post']
  user_id integer
  status varchar
  created_at timestamp
  modified_at timestamp
}
'''

class ReviewStatus(str, enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(
        String(length=255), nullable=False,
        index=True
    )
    body: Mapped[str] = mapped_column(
        String
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    status: Mapped[ReviewStatus] = mapped_column(
        ENUM(ReviewStatus, name="review_status", create_type=True)
    ) 
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    modified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    
    # Relationships
    user: Mapped["User"] = relationship()
    book: Mapped["Book"] = relationship()
    
