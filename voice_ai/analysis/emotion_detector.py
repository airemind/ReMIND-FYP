"""
emotion_detector.py

Zero-RAM Emotion Detector for ReMIND.
Uses cloud API / zero-RAM analyzer to prevent memory exhaustion on Render Free Tier (512MB).
"""

from voice_ai.analysis.zero_ram_analyzer import analyze_speech_sentiment
from voice_ai.utils.logger import get_logger

logger = get_logger("EmotionDetector")


def detect_emotion(text: str) -> dict:
    """
    Detect emotion from text with 0 MB server RAM overhead.
    """
    try:
        if not text or not text.strip():
            return {
                "emotion": "neutral",
                "emotion_confidence": 0.0,
                "top_emotions": [{"label": "neutral", "confidence": 0.0}],
            }

        data = analyze_speech_sentiment(text)
        result = {
            "emotion": data.get("emotion", "neutral"),
            "emotion_confidence": data.get("emotion_confidence", 0.85),
            "top_emotions": data.get("top_emotions", [{"label": "neutral", "confidence": 0.85}]),
        }
        logger.info(f"Emotion detected: {result['emotion']} ({result['emotion_confidence']})")
        return result
    except Exception as e:
        logger.error(f"Emotion detection failed: {str(e)}")
        return {
            "emotion": "neutral",
            "emotion_confidence": 0.0,
            "top_emotions": [{"label": "neutral", "confidence": 0.0}],
        }
