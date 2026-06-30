from sqlalchemy import String, Text, Integer, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

'''
Table publisher{
  id integer [primary key]
  description varchar 
  name varchar 
  address varchar 
  mobile varchar
}
'''

class Publisher(Base):
    __tablename__ = "publishers"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    name: Mapped[str] = mapped_column(
        String(length=255), index=True
    )
    description: Mapped[str] = mapped_column(
        String
    )
    address: Mapped[str] = mapped_column(
        String
    )
    mobile: Mapped[str] = mapped_column(
        String
    )