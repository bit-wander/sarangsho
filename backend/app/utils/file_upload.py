import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
UPLOAD_DIR = "uploads/covers"

def save_cover_image(file: UploadFile) -> str:
    # Validate extension
    if file.filename.split(".")[-1].lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Validate file size
    if file.size > 1024 * 1024 * 5:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large")

    # Create unique filename
    filename = f"{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    return f"/uploads/covers/{filename}"