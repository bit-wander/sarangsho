from typing import List
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base
from .book import book_genre

'''
Table genre{
  id integer [primary key]
  name varchar 
}
'''

class Genre(Base):
    __tablename__ = "genres"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    name: Mapped[str] = mapped_column(
        String, index=True, nullable=False
    )
    books: Mapped[List["Book"]] = relationship(
        secondary=book_genre,
        back_populates="genres"
    )