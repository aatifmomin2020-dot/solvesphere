from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import RoleChecker
from app.models.challenge import Challenge
from app.models.project import Project, Milestone

router = APIRouter(prefix="/gov", tags=["Government Dashboard"])


@router.get("/dashboard", summary="Government Operations Dashboard KPIs & Queue")
async def get_government_dashboard(
    current_user=Depends(RoleChecker(["GOVERNMENT", "GOVERNMENT_REVIEWER", "GOVERNMENT_OFFICER", "PLATFORM_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Calculates live KPI metrics from database records (Section 23 & 57)."""
    # Total submitted
    tot_res = await db.execute(select(func.count(Challenge.id)))
    total_submitted = tot_res.scalar() or 0

    # Verified
    ver_res = await db.execute(select(func.count(Challenge.id)).where(Challenge.status.in_(["VERIFIED", "ROUTED", "PROPOSAL_SUBMITTED", "APPROVED", "ACTIVE", "PROTOTYPE", "PILOT", "DEPLOYED", "CLOSED"])))
    verified_count = ver_res.scalar() or 0

    # Awaiting verification
    await_res = await db.execute(select(func.count(Challenge.id)).where(Challenge.status == "AWAITING_VERIFICATION"))
    awaiting_count = await_res.scalar() or 0

    # Rejected
    rej_res = await db.execute(select(func.count(Challenge.id)).where(Challenge.status == "REJECTED"))
    rejected_count = rej_res.scalar() or 0

    # Active projects
    act_proj = await db.execute(select(func.count(Project.id)).where(Project.stage.in_(["ACTIVE", "PROTOTYPE", "PILOT"])))
    active_projects = act_proj.scalar() or 0

    # Deployed solutions
    dep_proj = await db.execute(select(func.count(Project.id)).where(Project.stage == "DEPLOYED"))
    deployed_solutions = dep_proj.scalar() or 0

    # Overdue milestones
    overdue_res = await db.execute(select(func.count(Milestone.id)).where(Milestone.status == "OVERDUE"))
    delayed_projects = overdue_res.scalar() or 0

    # Verification Queue Items
    q_res = await db.execute(
        select(Challenge)
        .where(Challenge.status == "AWAITING_VERIFICATION")
        .order_by(Challenge.created_at.desc())
        .limit(10)
    )
    verification_queue = q_res.scalars().all()

    queue_items = [{
        "id": c.id,
        "public_code": c.public_code,
        "title": c.title,
        "domain": c.domain,
        "official_priority": c.official_priority,
        "ai_priority_score": c.ai_priority_score,
        "district": c.district,
        "affected_population": c.affected_population,
        "created_at": c.created_at
    } for c in verification_queue]

    # Dynamic SLA calculation for verified challenges
    sla_res = await db.execute(select(Challenge).where(Challenge.verified_at.isnot(None)))
    verified_challenges = sla_res.scalars().all()
    if verified_challenges:
        total_seconds = sum((c.verified_at - c.created_at).total_seconds() for c in verified_challenges if c.verified_at and c.created_at)
        avg_sla_hours = round(max(total_seconds / len(verified_challenges) / 3600.0, 0.1), 1)
    else:
        avg_sla_hours = 0.0

    return {
        "kpis": {
            "total_submitted": total_submitted,
            "verified": verified_count,
            "awaiting_verification": awaiting_count,
            "rejected": rejected_count,
            "active_projects": active_projects,
            "deployed_solutions": deployed_solutions,
            "delayed_projects": delayed_projects,
            "avg_verification_sla_hours": avg_sla_hours
        },
        "verification_queue": queue_items
    }

