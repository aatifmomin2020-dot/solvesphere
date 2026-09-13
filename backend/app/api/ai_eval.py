from fastapi import APIRouter, Depends
from app.ai.ai_observability import get_ai_evaluation_dashboard_data
from app.models.schemas import User
from app.auth.rbac import require_role

router = APIRouter(prefix="/ai", tags=["AI Observability & Evaluation"])

@router.get("/eval-metrics", response_model=dict)
def get_ai_eval_metrics():
    """
    Returns dedicated AI Observability metrics:
    - Domain classification accuracy & F1 score
    - Semantic duplicate precision, recall, and cosine thresholding
    - Top-1 & Top-3 recommendation relevance
    - Average latency, P95 latency, and token cost estimates
    """
    return get_ai_evaluation_dashboard_data()
