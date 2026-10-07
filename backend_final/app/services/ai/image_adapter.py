from pathlib import Path
import sys

# Project root (ReMIND-FYP)
PROJECT_ROOT = Path(__file__).resolve().parents[4]

# Allow importing image_ai package from project root
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Local AI pipelines
from image_ai.pipeline.caption_pipeline import caption_image


def process_image(image_path: str):
    """
    Generate an image caption using the local BLIP pipeline.
    """
    return caption_image(image_path)
