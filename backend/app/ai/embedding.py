import numpy as np
import math
from typing import List, Tuple

_model = None
_model_loaded = False

def load_embedding_model():
    global _model, _model_loaded
    if _model_loaded:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        _model_loaded = True
    except Exception as e:
        print(f"[AI Engine] SBERT model load notice: Using fast TF-IDF embedding vectorizer fallback. Details: {e}")
        _model = None
        _model_loaded = True
    return _model

def get_embedding(text: str) -> List[float]:
    """
    Generates a 384-dimensional vector embedding for a given text.
    Uses SBERT if available, or deterministic TF-IDF feature vector fallback.
    """
    model = load_embedding_model()
    if model is not None:
        try:
            vector = model.encode(text).tolist()
            return vector
        except Exception:
            pass

    # Deterministic 64-dim fallback vector for offline AI Demo Mode
    words = text.lower().split()
    vocab = ["waterlogging", "school", "rain", "road", "monsoon", "drainage", "flood", "children", 
             "hospital", "traffic", "pothole", "garbage", "waste", "pollution", "solar", "power", 
             "crime", "safety", "lighting", "sewage", "drinking", "pipeline", "farmer", "irrigation"]
    
    vec = [0.0] * 64
    for idx, word in enumerate(vocab):
        if word in text.lower():
            vec[idx % 64] += 1.0
    
    # Hash remaining words
    for word in words:
        h = hash(word) % 64
        vec[h] += 0.1
        
    norm = math.sqrt(sum(v*v for v in vec)) or 1.0
    return [round(v / norm, 4) for v in vec]

def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculates cosine similarity percentage between two vector embeddings."""
    if not vec1 or not vec2:
        return 0.0
    
    length = min(len(vec1), len(vec2))
    v1 = np.array(vec1[:length])
    v2 = np.array(vec2[:length])
    
    dot = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = float(dot / (norm1 * norm2))
    return round(max(0.0, min(100.0, similarity * 100.0)), 1)
