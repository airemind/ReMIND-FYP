"""
zero_ram_analyzer.py

Zero-RAM Emotion & Tone Analyzer for ReMIND.
Uses Groq Cloud API for ultra-fast, zero-RAM inference with an instant
heuristic fallback to prevent memory spikes on Render's 512MB Free Tier.
"""

import os
import json
import re
from voice_ai.utils.logger import get_logger

logger = get_logger("ZeroRamAnalyzer")

try:
    from groq import Groq
except ImportError:
    Groq = None

# Cache last analyzed transcript to avoid calling Groq twice for emotion & tone
_cached_transcript = None
_cached_result = None


def get_groq_api_key() -> str:
    """Robustly fetch GROQ_API_KEY from environment or settings."""
    try:
        from app.config.settings import settings
        if getattr(settings, "GROQ_API_KEY", None):
            return settings.GROQ_API_KEY
    except Exception:
        pass

    try:
        from backend_final.app.config.settings import settings
        if getattr(settings, "GROQ_API_KEY", None):
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


def _lexical_fallback(text: str) -> dict:
    """
    Lightweight, zero-RAM lexical fallback for emotion and tone detection.
    Runs in < 1ms without loading any PyTorch models.
    """
    lower = text.lower()
    words = set(re.findall(r"\b\w+\b", lower))

    # Emotion keywords
    joy_kw = {"happy", "glad", "joy", "smile", "laugh", "wonderful", "great", "love", "excited", "fun", "blessed", "good", "peaceful", "delighted"}
    sad_kw = {"sad", "unhappy", "cry", "tears", "miss", "grief", "lost", "alone", "hurt", "pain", "sorry", "lonely", "depressed", "mourn"}
    anger_kw = {"angry", "mad", "furious", "annoyed", "hate", "frustrated", "irritated"}
    fear_kw = {"afraid", "scared", "fear", "nervous", "worried", "terrified", "anxious"}
    surprise_kw = {"surprised", "shocked", "amazed", "astonished", "unexpected"}

    joy_score = len(words & joy_kw)
    sad_score = len(words & sad_kw)
    anger_score = len(words & anger_kw)
    fear_score = len(words & fear_kw)
    surprise_score = len(words & surprise_kw)

    emotion_scores = [
        ("joy", joy_score),
        ("sadness", sad_score),
        ("anger", anger_score),
        ("fear", fear_score),
        ("surprise", surprise_score),
    ]
    emotion_scores.sort(key=lambda x: x[1], reverse=True)

    primary_emotion, max_score = emotion_scores[0]
    if max_score == 0:
        primary_emotion = "neutral"
        conf = 0.85
    else:
        conf = round(min(0.70 + (max_score * 0.1), 0.98), 2)

    top_emotions = [
        {"label": primary_emotion, "confidence": conf},
        {"label": "neutral", "confidence": round(max(0.1, 1.0 - conf), 2)}
    ]

    # Tone keywords
    tones = []
    if any(k in lower for k in ["remember", "past", "childhood", "years ago", "back then", "growing up", "memories", "grandfather", "grandmother"]):
        tones.append("nostalgic")
    if any(k in lower for k in ["think", "realize", "wonder", "looking back", "lesson", "understand"]):
        tones.append("reflective")
    if any(k in lower for k in ["thank", "grateful", "appreciate", "blessing", "fortunate"]):
        tones.append("appreciative")
    if joy_score > 0:
        tones.append("joyful")
    if any(k in lower for k in ["care", "help", "protect", "cherish", "family", "together"]):
        tones.append("caring")
    if sad_score > 0:
        tones.append("sad")
    if any(k in lower for k in ["deeply", "heart", "moving", "touching"]):
        tones.append("emotional")

    if not tones:
        tones = ["neutral"]
        primary_tone = "neutral"
        tone_strength = 0.80
    else:
        primary_tone = tones[0]
        tone_strength = 0.85

    return {
        "emotion": primary_emotion,
        "emotion_confidence": conf,
        "top_emotions": top_emotions,
        "tones": tones,
        "primary_tone": primary_tone,
        "tone_strength": tone_strength,
    }


def analyze_speech_sentiment(text: str) -> dict:
    """
    Analyze speech emotion and tone with zero server RAM footprint.
    Prioritizes Groq Cloud API, falls back to lightweight lexical rules.
    """
    global _cached_transcript, _cached_result

    if not text or not text.strip():
        return {
            "emotion": "neutral",
            "emotion_confidence": 0.0,
            "top_emotions": [{"label": "neutral", "confidence": 0.0}],
            "tones": ["neutral"],
            "primary_tone": "neutral",
            "tone_strength": 0.0,
        }

    clean_text = text.strip()

    # Return cached result if already analyzed for this transcript
    if _cached_transcript == clean_text and _cached_result is not None:
        return _cached_result

    api_key = get_groq_api_key()
    if api_key and Groq:
        try:
            client = Groq(api_key=api_key)
            prompt = (
                f"Analyze the emotion and tone of this spoken memory transcript:\n"
                f'"{clean_text}"\n\n'
                f"Respond with ONLY valid JSON with keys:\n"
                f'- emotion (one of: joy, sadness, anger, fear, surprise, disgust, neutral)\n'
                f'- emotion_confidence (float 0.0 to 1.0)\n'
                f'- top_emotions (list of up to 3 objects with keys "label" and "confidence")\n'
                f'- tones (list of strings chosen from: nostalgic, reflective, appreciative, joyful, emotional, sad, caring, curious, excited, neutral)\n'
                f'- primary_tone (string)\n'
                f'- tone_strength (float 0.0 to 1.0)'
            )

            # Try Qwen 3.8 / 27b or fallback model
            response = client.chat.completions.create(
                model="qwen/qwen3.8-27b",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=220,
                timeout=6,
            )

            content = response.choices[0].message.content or ""
            data = json.loads(content)

            result = {
                "emotion": str(data.get("emotion", "neutral")).lower(),
                "emotion_confidence": round(float(data.get("emotion_confidence", 0.85)), 2),
                "top_emotions": data.get("top_emotions", [{"label": "neutral", "confidence": 0.85}]),
                "tones": [str(t).lower() for t in data.get("tones", ["neutral"])],
                "primary_tone": str(data.get("primary_tone", "neutral")).lower(),
                "tone_strength": round(float(data.get("tone_strength", 0.85)), 2),
            }

            _cached_transcript = clean_text
            _cached_result = result
            logger.info(f"Zero-RAM Groq sentiment analysis succeeded: {result['emotion']} | {result['primary_tone']}")
            return result
        except Exception as e:
            logger.warning(f"Groq sentiment analysis failed ({e}), using zero-RAM lexical fallback")

    # Fast zero-RAM fallback
    fallback_res = _lexical_fallback(clean_text)
    _cached_transcript = clean_text
    _cached_result = fallback_res
    return fallback_res

