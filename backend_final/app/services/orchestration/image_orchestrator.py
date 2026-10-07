import os
import shutil
import hashlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.chat import Chat
from app.models.media import Media

from app.services.ai.image_adapter import process_image
from app.services.ai.text_adapter import process_text

from app.logs.ai_logger import ai_logger
from app.logs.error_logger import error_logger

from app.cache.redis_cache import get_cache, set_cache

from app.services.admin.metric_logger_service import store_metric


# Persistent directory for uploaded memory images
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../")
)

MEMORY_IMAGE_DIR = os.path.join(
    BASE_DIR,
    "static",
    "memory_images"
)

os.makedirs(MEMORY_IMAGE_DIR, exist_ok=True)


def process_and_store_image(
    image_path: str,
    db: Session,
    user_id: int,
    chat_id: int = None,
    profile=None,
    patient_profile=None,
    session_id: str = "unknown",
):
    try:
        ai_logger.info("Image orchestration started")

        # Hash for cache
        with open(image_path, "rb") as f:
            file_hash = hashlib.md5(f.read()).hexdigest()

        cache_key = f"image:{file_hash}"

        cached_response = get_cache(cache_key)

        if cached_response:
            ai_logger.info("Image cache hit")
            return cached_response

        # Image AI
        image_result = process_image(image_path)

        if not image_result["success"]:
            return image_result

        # Text AI
        text_result = process_text(
            user_input=image_result["caption"],
            image={
                "caption": image_result["caption"],
            },
            profile=profile,
        )

        memory_response = text_result.get(
            "response",
            image_result["caption"],
        )

        # Copy original image to persistent storage
        filename = os.path.basename(image_path)

        persistent_path = os.path.join(
            MEMORY_IMAGE_DIR,
            filename
        )

        shutil.copy2(
            image_path,
            persistent_path
        )

        original_url = f"/static/memory_images/{filename}"

        # No enhancement during initial upload
        enhanced_path = None

        # Save media
        media = Media(
            user_id=user_id,
            chat_id=chat_id,
            media_type="image",
            original_url=original_url,
            enhanced_url=None,
            caption=memory_response,
        )

        db.add(media)
        db.commit()
        db.refresh(media)

        # Update chat activity
        if chat_id:
            chat = db.query(Chat).filter(
                Chat.id == chat_id
            ).first()

            if chat:
                chat.last_activity = datetime.now(timezone.utc)
                chat.message_count += 1
                db.commit()

        # Final result
        result = {
            "success": True,
            "media_id": media.id,
            "caption": image_result["caption"],
            "memory_response": memory_response,
            "intent": text_result["intent"],
            "entities": text_result["entities"],
            "retrieved_context": text_result["retrieved_context"],
            "original_url": original_url,
            "enhanced_url": None,
            "metrics": image_result["metrics"],
            "pipeline_used": [
                "IMAGE_AI",
                "TEXT_AI"
            ],
            "cache_used": False,
        }

        # Metrics
        store_metric(
            db=db,
            user_id=user_id,
            session_id=session_id,
            ai_module="IMAGE_AI",
            pipeline_used="IMAGE_AI,TEXT_AI",
            latency=image_result["metrics"]["processing_time"],
            estimated_cost=0.0,
            cache_used=False,
        )

        # Cache
        set_cache(
            cache_key,
            result,
            expiration=3600,
        )

        # Delete temporary file
        if os.path.exists(image_path):
            os.remove(image_path)

        ai_logger.info(
            "Image orchestration completed successfully"
        )

        return result

    except Exception as e:
        error_logger.error(
            f"Image orchestration failed: {str(e)}"
        )

        return {
            "success": False,
            "error": str(e),
        }
