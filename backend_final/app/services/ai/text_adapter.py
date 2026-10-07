from pathlib import Path
import sys

# Project root (ReMIND-FYP)
PROJECT_ROOT = Path(__file__).resolve().parents[4]

# Allow importing text_ai package
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from text_ai.pipeline.core_pipeline import run_pipeline


def process_text(
    user_input: str,
    audio=None,
    image=None,
    profile=None,
    recent_conversations=None,
):
    return run_pipeline(
        user_input=user_input,
        audio=audio,
        image=image,
        profile=profile,
        conversation_history=recent_conversations,
    )
