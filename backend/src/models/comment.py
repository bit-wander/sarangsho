import enum
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class EntityType(str, enum.Enum):
    REVIEW = "REVIEW"
    COMMENT = "COMMENT"
    BOOK = "BOOK"
    ACTIVITY = "ACTIVITY"

class Comment(Base):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        )
    )
    entity: Mapped[EntityType] = mapped_column(
        Enum(
            EntityType, 
            name="entity_type", 
            create_type=True), 
        nullable=False
    )
    entity_id: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    body: Mapped[str] = mapped_column(
        String
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )