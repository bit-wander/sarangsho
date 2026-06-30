from typing import List
from sqlalchemy import String, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    name: Mapped[str] = mapped_column(
        String(length=255), index=True
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    books: Mapped[List["Book"]] = relationship(
        secondary="book_author",
        back_populates="authors"
    )