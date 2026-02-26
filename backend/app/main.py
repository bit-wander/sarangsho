from fastapi import FastAPI 
from fastapi.staticfiles import StaticFiles 
from .db import database 
from .routers import auth 
from .routers import books
from .routers import reviews

app = FastAPI()


app.include_router(auth.router)
app.include_router(books.router)
app.include_router(reviews.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
def on_startup():
    database.create_db_and_tables() 



@app.get("/")
def read_root():
    return {"message": "Sarangsho API is running"}
