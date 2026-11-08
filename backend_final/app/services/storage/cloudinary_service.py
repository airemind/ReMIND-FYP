import os
import shutil
from pathlib import Path
from app.config.settings import settings

STATIC_ROOT = Path("static")
IMAGE_DIR = STATIC_ROOT / "images"
AUDIO_DIR = STATIC_ROOT / "audio"
MEMORY_IMAGE_DIR = STATIC_ROOT / "memory_images"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
MEMORY_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

# Cloudinary Setup
CLOUDINARY_AVAILABLE = False
try:
    import cloudinary
    import cloudinary.uploader

    cloud_name = settings.CLOUDINARY_CLOUD_NAME or os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = settings.CLOUDINARY_API_KEY or os.getenv("CLOUDINARY_API_KEY")
    api_secret = settings.CLOUDINARY_API_SECRET or os.getenv("CLOUDINARY_API_SECRET")

    if cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        CLOUDINARY_AVAILABLE = True
except Exception as e:
    print(f"Cloudinary setup note: {e}")


def upload_image(file_path: str, folder: str = "remind/images") -> dict:
    """
    Upload image to Cloudinary for permanent storage across container restarts.
    Falls back to local static directory if Cloudinary is unavailable.
    """
    if CLOUDINARY_AVAILABLE:
        try:
            result = cloudinary.uploader.upload(
                file_path,
                folder=folder,
                resource_type="image",
                unique_filename=True,
                overwrite=True,
                invalidate=True,
            )
            if result.get("secure_url"):
                return {
                    "public_id": result.get("public_id"),
                    "url": result.get("secure_url"),
                }
        except Exception as e:
            print(f"Cloudinary image upload failed, falling back to local: {e}")

    # Fallback to local disk
    filename = os.path.basename(file_path)
    destination = MEMORY_IMAGE_DIR / filename
    if os.path.abspath(file_path) != os.path.abspath(destination):
        shutil.copy2(file_path, destination)

    return {"public_id": filename, "url": f"/static/memory_images/{filename}"}


def upload_audio(file_path: str, folder: str = "remind/audio") -> dict:
    """
    Upload audio to Cloudinary for permanent storage across container restarts.
    Falls back to local static directory if Cloudinary is unavailable.
    """
    if CLOUDINARY_AVAILABLE:
        try:
            result = cloudinary.uploader.upload(
                file_path,
                folder=folder,
                resource_type="video",  # Cloudinary uses 'video' for audio files
                unique_filename=True,
                overwrite=True,
                invalidate=True,
            )
            if result.get("secure_url"):
                return {
                    "public_id": result.get("public_id"),
                    "url": result.get("secure_url"),
                }
        except Exception as e:
            print(f"Cloudinary audio upload failed, falling back to local: {e}")

    # Fallback to local disk
    filename = os.path.basename(file_path)
    destination = AUDIO_DIR / filename
    if os.path.abspath(file_path) != os.path.abspath(destination):
        shutil.copy2(file_path, destination)

    return {"public_id": filename, "url": f"/static/audio/{filename}"}


def delete_image(public_id: str, resource_type: str = "image"):
    if CLOUDINARY_AVAILABLE:
        try:
            import cloudinary.uploader
            return cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        except Exception:
            pass
    return True


def delete_audio(public_id: str, resource_type: str = "video"):
    if CLOUDINARY_AVAILABLE:
        try:
            import cloudinary.uploader
            return cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        except Exception:
            pass
    return True
