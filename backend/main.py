import sys
from pathlib import Path

# Add directories to sys.path to support execution from any directory context
backend_dir = Path(__file__).resolve().parent
src_dir = backend_dir / "src"
for path in [backend_dir, src_dir]:
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.books import router as books_router
from routers.shelves import router as shelves_router
from routers.auth import router as auth_router
from routers.activities import router as activities_router
from routers.streaks import router as streaks_router
from routers.pricing import router as pricing_router
from routers.upload import router as upload_router
from routers.admin import router as admin_router

app = FastAPI(
    title="Sarangsho API",
    description="Backend API for book tracking and search",
    version="0.1.0"
)

# Configure CORS so the frontend can interact with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to frontend origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(shelves_router)
app.include_router(activities_router)
app.include_router(streaks_router)
app.include_router(pricing_router)
app.include_router(upload_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Sarangsho API. Go to /docs for API documentation."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
