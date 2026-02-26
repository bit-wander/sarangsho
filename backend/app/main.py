from fastapi import FastAPI 
from fastapi.staticfiles import StaticFiles 
from .db import database 
from .routers import auth 
from .routers import books
from .routers import reviews
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
