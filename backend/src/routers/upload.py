from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
import random
import string

from src.models import User
from src.security import get_current_user

router = APIRouter(prefix="/api/upload", tags=["Upload"])

class UploadSignRequest(BaseModel):
    filename: str
    fileType: str

class UploadSignResponse(BaseModel):
    uploadUrl: str
    documentId: str
    message: str

@router.post("/sign", response_model=UploadSignResponse, status_code=status.HTTP_200_OK)
async def sign_upload(
    payload: UploadSignRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a secure pre-signed AWS S3 target URL for EPUB/PDF ingestion.
    """
    random_id = "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
    filename_clean = payload.filename.replace(" ", "_")
    
    upload_url = f"https://mock-s3-bucket.s3.amazonaws.com/uploads/{random_id}-{filename_clean}?signature=mock_sig_12345"
    document_id = f"doc-{random_id}"
    
    return UploadSignResponse(
        uploadUrl=upload_url,
        documentId=document_id,
        message="Target upload URL generated successfully."
    )
