import time

from image_ai.services.captioning.blip_service import generate_caption
from image_ai.services.utils.logger import log_info, log_error


def caption_image(image_path: str):
    try:
        start_time = time.time()

        log_info("Caption pipeline started")

        caption = generate_caption(image_path)

        processing_time = round(time.time() - start_time, 2)

        log_info("Caption generated")

        return {
            "success": True,
            "caption": caption,
            "image_path": image_path,
            "pipeline_used": ["CAPTION_ONLY"],
            "cache_used": False,
            "metrics": {"processing_time": processing_time},
        }

    except Exception as e:
        log_error(str(e))

        return {"success": False, "error": str(e)}
