from sqlalchemy.dialects.postgresql import ENUM, ARRAY
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base
from .user_book import UserBook


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    READER = "READER"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True) 
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    role: Mapped[UserRole] = mapped_column(
        ENUM(UserRole, 
        name="user_role", 
        create_type=True), 
        nullable=False, 
        default=UserRole.READER
        ) 
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    favorite_genres: Mapped[list[int] | None] = mapped_column(
        ARRAY(Integer), nullable=True
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String, nullable=True
    )

    # Relationships
    books: Mapped[list["UserBook"]] = relationship(back_populates="user", cascade="all, delete-orphan")