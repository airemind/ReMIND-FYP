from pathlib import Path
import sys

# Project root (ReMIND-FYP)
PROJECT_ROOT = Path(__file__).resolve().parents[4]

# Allow importing voice_ai package
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from voice_ai.orchestration.voice_pipeline import run_voice_pipeline


def process_voice(
    audio_path: str,
    response_text: str = None,
    force_refresh: bool = False,
):
    return run_voice_pipeline(
        input_audio_path=audio_path,
        response_text=response_text,
        force_refresh=force_refresh,
    )
