import base64
import io
import mimetypes
import os
from PIL import Image

try:
    from groq import Groq
except ImportError:
    Groq = None


def encode_image(image_path: str, max_size: int = 1024) -> tuple[str, str]:
    """
    Open image, resize to reasonable dimensions for API, and return base64 + mime_type.
    """
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type or not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=85)
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            return encoded, "image/jpeg"
    except Exception:
        with open(image_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return encoded, mime_type


def generate_caption(image_path: str) -> str:
    """
    Generate an image caption using Groq Cloud Vision (zero RAM overhead)
    with resilient fallbacks.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or not Groq:
        return "A personal photograph from the user's memories."

    try:
        encoded_img, mime = encode_image(image_path)
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Describe this photo concisely in 1-2 clear sentences for an Alzheimer's memory reconstruction system:",
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
            temperature=0.4,
        )
        caption = response.choices[0].message.content.strip()
        if caption:
            return caption
    except Exception as e:
        print(f"Primary Groq Vision failed: {e}")

    try:
        encoded_img, mime = encode_image(image_path)
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Describe this photo concisely in 1-2 sentences:",
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
            temperature=0.4,
        )
        caption = response.choices[0].message.content.strip()
        if caption:
            return caption
    except Exception as e2:
        print(f"Secondary Groq Vision failed: {e2}")

    return "A personal photograph containing people and familiar surroundings."
