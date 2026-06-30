from sqlalchemy.dialects.postgresql import ENUM, ARRAY
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base


class StreakLog(Base):
    __tablename__="streak_logs"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        )
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    have_read: Mapped[bool] = mapped_column(
        Boolean, default=True
    )
