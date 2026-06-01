import os
import sys

from app.config.settings import settings

AI_IMAGE_PATH = settings.AI_IMAGE_PATH

PROJECT_ROOT = os.path.dirname(
    AI_IMAGE_PATH
)

sys.path.append(
    PROJECT_ROOT
)

# =========================
# FAST REALTIME PIPELINE
# =========================

from image_ai.pipeline.caption_pipeline import (
    caption_image
)

# =========================
# HEAVY ENHANCEMENT PIPELINE
# =========================

from image_ai.pipeline.enhancement_pipeline import (
    enhance_image
)

# =========================
# REALTIME CHAT IMAGE AI
# =========================

def process_image(
    image_path: str
):

    return caption_image(
        image_path
    )

# =========================
# OPTIONAL ENHANCEMENT
# =========================

def enhance_uploaded_image(
    image_path: str
):

    return enhance_image(
        image_path
    )
