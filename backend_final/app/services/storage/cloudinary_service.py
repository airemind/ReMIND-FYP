# import cloudinary
# import cloudinary.uploader
# from app.config.settings import settings

# cloudinary.config(
#     cloud_name=settings.CLOUDINARY_CLOUD_NAME,
#     api_key=settings.CLOUDINARY_API_KEY,
#     api_secret=settings.CLOUDINARY_API_SECRET,
#     secure=True,
# )


# def upload_image(file_path: str, folder: str = "remind/images"):

#     result = cloudinary.uploader.upload(
#         file_path,
#         folder=folder,
#         resource_type="image",
#         unique_filename=True,
#         overwrite=True,
#         invalidate=True,
#     )

#     return {"public_id": result["public_id"], "url": result["secure_url"]}


# def upload_audio(file_path: str, folder: str = "remind/audio"):

#     result = cloudinary.uploader.upload(
#         file_path,
#         folder=folder,
#         resource_type="video",
#         unique_filename=True,
#         overwrite=True,
#         invalidate=True,
#     )

#     return {"public_id": result["public_id"], "url": result["secure_url"]}


# def delete_image(public_id: str, resource_type: str = "image"):
#     return cloudinary.uploader.destroy(public_id, resource_type=resource_type)


# def delete_audio(public_id: str, resource_type: str = "video"):
#     return cloudinary.uploader.destroy(public_id, resource_type=resource_type)

import os
import shutil
from pathlib import Path

STATIC_ROOT = Path("static")

IMAGE_DIR = STATIC_ROOT / "images"
AUDIO_DIR = STATIC_ROOT / "audio"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def upload_image(file_path: str, folder: str = None):

    filename = os.path.basename(file_path)

    destination = IMAGE_DIR / filename

    shutil.copy(file_path, destination)

    return {"url": f"/static/images/{filename}"}


def upload_audio(file_path: str, folder: str = None):

    filename = os.path.basename(file_path)

    destination = AUDIO_DIR / filename

    shutil.copy(file_path, destination)

    return {"url": f"/static/audio/{filename}"}


def delete_image(public_id: str, resource_type: str = "image"):
    return True


def delete_audio(public_id: str, resource_type: str = "video"):
    return True
