import os

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/opus",
    "audio/x-ogg",
    "application/ogg",
    "audio/webm",
]
ALLOWED_TEXT_TYPES = ["text/plain"]
MAX_FILE_SIZE = 50 * 1024 * 1024


def validate_file(content_type: str, file_size: int, filename: str = None):
    allowed_types = ALLOWED_IMAGE_TYPES + ALLOWED_AUDIO_TYPES + ALLOWED_TEXT_TYPES
    is_extension_valid = False
    if filename:
        ext = os.path.splitext(filename)[1].lower()
        if ext in [".ogg", ".opus", ".mp3", ".wav", ".jpg", ".jpeg", ".png", ".webp", ".txt"]:
            is_extension_valid = True

    if content_type not in allowed_types and not is_extension_valid:
        return False
    if file_size > MAX_FILE_SIZE:
        return False
    return True
