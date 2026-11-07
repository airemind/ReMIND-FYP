import base64
import ctypes
import gc
import io
import mimetypes
import os
import re
from PIL import Image

try:
    from groq import Groq
except ImportError:
    Groq = None


def release_memory():
    gc.collect()
    try:
        libc = ctypes.CDLL("libc.so.6")
        libc.malloc_trim(0)
    except Exception:
        pass


def get_groq_api_key() -> str:
    """
    Robustly get GROQ_API_KEY from settings, os.environ, or .env files.
    """
    try:
        from app.config.settings import settings
        if settings.GROQ_API_KEY:
            return settings.GROQ_API_KEY
    except Exception:
        pass

    try:
        from backend_final.app.config.settings import settings
        if settings.GROQ_API_KEY:
            return settings.GROQ_API_KEY
    except Exception:
        pass

    if os.getenv("GROQ_API_KEY"):
        return os.getenv("GROQ_API_KEY")

    try:
        from dotenv import load_dotenv
        load_dotenv("backend_final/.env")
        load_dotenv(".env")
        load_dotenv(".env.local")
        return os.getenv("GROQ_API_KEY", "")
    except Exception:
        return ""


def encode_image(image_path: str, max_size: int = 512) -> tuple[str, str]:
    """
    Open image, downscale to max 512px, compress to keep RAM footprint < 1MB.
    """
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type or not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=75, optimize=True)
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            buffer.close()
            return encoded, "image/jpeg"
    except Exception:
        with open(image_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return encoded, mime_type


def generate_caption(image_path: str) -> str:
    """
    Generate an accurate image caption using Groq Multimodal Vision (zero RAM overhead)
    with clean memory reclamation and truthful fallbacks.
    """
    api_key = get_groq_api_key()
    if not api_key or not Groq:
        return "An uploaded photograph or image."

    caption = None
    try:
        encoded_img, mime = encode_image(image_path)
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Describe this photo concisely in 1-2 clear, factual sentences "
                                "for a memory reconstruction system. Mention who or what is visible, "
                                "their appearance or clothing, and the setting:"
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime};base64,{encoded_img}",
                            },
                        },
                    ],
                }
            ],
            max_tokens=150,
            temperature=0.3,
        )
        raw_text = response.choices[0].message.content or ""
        # Strip any thinking tags if present
        clean_text = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
        if clean_text:
            caption = clean_text
    except Exception as e:
        print(f"Groq Vision failed: {e}")

    # Immediately release image buffers from memory
    release_memory()

    return caption or "An uploaded photograph or image."
