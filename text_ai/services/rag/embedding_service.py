from sentence_transformers import SentenceTransformer
import numpy as np
from text_ai.config.config import settings

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model


def get_embedding(text: str):
    if not text:
        return np.zeros(settings.EMBEDDING_DIM, dtype="float32")
    text = text.strip()
    if not text:
        return np.zeros(settings.EMBEDDING_DIM, dtype="float32")
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return np.array(embedding, dtype="float32")
