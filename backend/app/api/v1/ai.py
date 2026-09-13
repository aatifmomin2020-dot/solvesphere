from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.ai import AIAnalysis, SimilarityResult

from app.services.ai_evaluation import AIEvaluator

router = APIRouter(prefix="/ai", tags=["AI Intelligence & Evaluation"])


@router.get("/evaluation", summary="AI Metrics & Evaluation Dashboard (Section 21 & 22)")
async def get_ai_evaluation(db: AsyncSession = Depends(get_db)):
    """Exposes calculated evaluation metrics over internal prototype benchmark dataset."""
    analysis_cnt = await db.execute(select(func.count(AIAnalysis.id)))
    tot_analyzed = analysis_cnt.scalar() or 0

    benchmark_results = AIEvaluator.evaluate_benchmark()
    benchmark_results["observability"]["total_challenges_analyzed"] = tot_analyzed
    return benchmark_results

