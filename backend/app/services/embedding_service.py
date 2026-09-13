import math
import hashlib
from typing import List, Tuple, Optional
from app.core.logging import logger

_MODEL_INSTANCE = None
_MODEL_FAILED = False


class EmbeddingService:
    """Production 384-dimensional vector embedding service powered by SentenceTransformer('all-MiniLM-L6-v2')."""

    MODEL_NAME = "all-MiniLM-L6-v2"
    EMBEDDING_DIM = 384

    @classmethod
    def get_model(cls):
        global _MODEL_INSTANCE, _MODEL_FAILED
        if _MODEL_INSTANCE is not None:
            return _MODEL_INSTANCE
        if _MODEL_FAILED:
            return None

        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model '{cls.MODEL_NAME}'...")
            _MODEL_INSTANCE = SentenceTransformer(cls.MODEL_NAME)
            logger.info(f"SentenceTransformer '{cls.MODEL_NAME}' loaded successfully.")
            return _MODEL_INSTANCE
        except Exception as e:
            logger.warning(f"SentenceTransformer model load fallback: {e}")
            _MODEL_FAILED = True
            return None

    @classmethod
    def generate_embedding(cls, text: str) -> Tuple[List[float], str]:
        """
        Generates a 384-dimensional normalized vector embedding.
        Returns tuple of (embedding_list, status_flag).
        """
        model = cls.get_model()
        if model is not None:
            try:
                raw_emb = model.encode(text, normalize_embeddings=True)
                vec = raw_emb.tolist()
                if len(vec) == cls.EMBEDDING_DIM:
                    return vec, "SENTENCE_TRANSFORMER"
            except Exception as exc:
                logger.error(f"Error during SentenceTransformer encoding: {exc}")

        # Deterministic Feature Hashing Fallback if model loading/encoding fails
        words = text.lower().split()
        vector = [0.0] * cls.EMBEDDING_DIM
        for idx, word in enumerate(words):
            h = int(hashlib.md5(word.encode()).hexdigest(), 16) % cls.EMBEDDING_DIM
            vector[h] += 1.0 / (idx + 1)

        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [x / norm for x in vector]

        return vector, "DETERMINISTIC_FALLBACK"
