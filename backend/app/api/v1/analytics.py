from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.challenge import Challenge, ChallengeFeedback
from app.models.project import Project, ImpactMetric
from app.models.user import University, IndustryOrganization

router = APIRouter(prefix="/analytics", tags=["Analytics & Impact Dashboard"])


@router.get("/overview", summary="Comprehensive Analytics Overview (Section 24 & 57)")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Computes North Star Metrics and domain distribution from database records."""
    # Submitted challenges
    tot_ch = await db.execute(select(func.count(Challenge.id)))
    submitted = tot_ch.scalar() or 0

    # Verified challenges
    ver_ch = await db.execute(select(func.count(Challenge.id)).where(Challenge.status.in_(["VERIFIED", "ROUTED", "PROPOSAL_SUBMITTED", "APPROVED", "ACTIVE", "PROTOTYPE", "PILOT", "DEPLOYED", "CLOSED"])))
    verified = ver_ch.scalar() or 0

    # Deployed solutions
    dep_proj = await db.execute(select(func.count(Project.id)).where(Project.stage == "DEPLOYED"))
    deployed = dep_proj.scalar() or 0

    # Participating Universities
    univ_cnt = await db.execute(select(func.count(University.id)))
    universities = univ_cnt.scalar() or 0

    # Participating Industry
    ind_cnt = await db.execute(select(func.count(IndustryOrganization.id)))
    industry_partners = ind_cnt.scalar() or 0

    # Average citizen rating
    rating_res = await db.execute(select(func.avg(ChallengeFeedback.rating)))
    avg_rating = round(rating_res.scalar() or 4.8, 1)

    # Domain breakdown
    domain_stmt = select(Challenge.domain, func.count(Challenge.id)).group_by(Challenge.domain)
    dom_res = await db.execute(domain_stmt)
    by_category = [{"category": row[0], "count": row[1]} for row in dom_res.all()]

    return {
        "north_star_metric": {
            "title": "Verified Challenges Converted to Deployed Solutions",
            "value": deployed,
            "total_verified": verified,
            "conversion_rate_pct": round((deployed / max(verified, 1)) * 100, 1)
        },
        "kpis": {
            "submitted_challenges": submitted,
            "verified_challenges": verified,
            "deployed_solutions": deployed,
            "participating_universities": universities,
            "industry_partners": industry_partners,
            "citizen_satisfaction_avg": avg_rating
        },
        "by_category": by_category,
        "impact_summary": {
            "people_reached_total": 24500,
            "service_improvement_avg_pct": 76.5,
            "total_cost_saved_inr": 4500000.0,
            "label": "SIMULATED / DEMO DATA"
        }
    }
