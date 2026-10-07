from fastapi import APIRouter, UploadFile, File
import os
import shutil
import uuid
from pathlib import Path

from app.services.ai.image_adapter import (
    enhance_uploaded_image as run_image_enhancement,
)
from app.utils.file_cleanup import delete_file

router = APIRouter(prefix="/image-ai", tags=["Image AI"])

TEMP_DIR = "temp_uploads"


@router.post("/enhance")
async def enhance_image_route(file: UploadFile = File(...)):
    # Ensure temp directory
    os.makedirs(TEMP_DIR, exist_ok=True)

    # Safe filename
    file_extension = Path(file.filename).suffix
    safe_filename = f"{uuid.uuid4()}{file_extension}"
    temp_path = os.path.join(TEMP_DIR, safe_filename)

    try:
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run enhancement
        result = run_image_enhancement(temp_path)

        if not result["success"]:
            return result

        return {
            "success": True,
            "enhanced_url": result["enhanced_url"],
            "metrics": result["metrics"],
            "pipeline_used": result["pipeline_used"],
        }

    finally:
        # Always remove uploaded file
        if os.path.exists(temp_path):
            delete_file(temp_path)
