from sqlmodel import SQLModel, create_engine, Session 
from app.core.config import settings
from app.models.user import User 
from app.models.book import Book

engine = create_engine(settings.DATABASE_URL, echo=True) 

def create_db_and_tables():
    SQLModel.metadata.create_all(engine) 

def get_session():
    with Session(engine) as session:
        yield session
