"""
tone_classifier.py

Zero-RAM Tone Classifier for ReMIND.
Uses cloud API / zero-RAM analyzer to prevent memory exhaustion on Render Free Tier (512MB).
"""

from voice_ai.analysis.zero_ram_analyzer import analyze_speech_sentiment
from voice_ai.utils.logger import get_logger

logger = get_logger("ToneClassifier")


def classify_tone(text: str) -> dict:
    """
    Classify conversational tone from text with 0 MB server RAM overhead.
    """
    try:
        if not text or not text.strip():
            return {
                "tones": ["neutral"],
                "primary_tone": "neutral",
                "tone_strength": 0.0,
            }

        data = analyze_speech_sentiment(text)
        result = {
            "tones": data.get("tones", ["neutral"]),
            "primary_tone": data.get("primary_tone", "neutral"),
            "tone_strength": data.get("tone_strength", 0.85),
        }
        logger.info(f"Tone detected: {result['primary_tone']} ({result['tone_strength']})")
        return result
    except Exception as e:
        logger.error(f"Tone classification failed: {str(e)}")
        return {"tones": ["neutral"], "primary_tone": "neutral", "tone_strength": 0.0}
