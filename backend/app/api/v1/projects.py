import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Project, Milestone, ImpactMetric, Partnership
from app.models.challenge import Challenge

router = APIRouter(prefix="/projects", tags=["Project Workspace & Milestones"])


class MilestoneUpdateRequest(BaseModel):
    status: str # NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE, APPROVED
    completion_percentage: int
    evidence_url: Optional[str] = None


@router.get("", summary="List All Innovation Projects")
async def list_projects(db: AsyncSession = Depends(get_db)):
    stmt = select(Project).order_by(Project.updated_at.desc())
    res = await db.execute(stmt)
    projects = res.scalars().all()

    return [{
        "id": p.id,
        "title": p.title,
        "stage": p.stage,
        "progress_percentage": p.progress_percentage,
        "is_delayed": p.is_delayed,
        "deployed_at": p.deployed_at,
        "is_demo": p.is_demo
    } for p in projects]


@router.get("/{project_id}", summary="Get Full Project Workspace Details")
async def get_project_workspace(project_id: str, db: AsyncSession = Depends(get_db)):
    """8-Stage Project Workspace details with team, milestones & impact metrics (Section 31)."""
    p_res = await db.execute(select(Project).where(Project.id == project_id))
    p = p_res.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch Milestones
    m_res = await db.execute(select(Milestone).where(Milestone.project_id == p.id).order_by(Milestone.sequence_order))
    milestones = m_res.scalars().all()

    # Fetch Partnerships
    part_res = await db.execute(select(Partnership).where(Partnership.project_id == p.id))
    partnerships = part_res.scalars().all()

    # Fetch Impact Metrics
    imp_res = await db.execute(select(ImpactMetric).where(ImpactMetric.project_id == p.id))
    impact = imp_res.scalar_one_or_none()

    # Fetch Challenge
    ch_res = await db.execute(select(Challenge).where(Challenge.id == p.challenge_id))
    challenge = ch_res.scalar_one_or_none()

    return {
        "project": {
            "id": p.id,
            "title": p.title,
            "stage": p.stage,
            "progress_percentage": p.progress_percentage,
            "is_delayed": p.is_delayed,
            "start_date": p.start_date,
            "deployed_at": p.deployed_at,
            "is_demo": p.is_demo
        },
        "challenge": {
            "public_code": challenge.public_code if challenge else "SS-1042",
            "title": challenge.title if challenge else "Urban Waterlogging Near ABC School",
            "domain": challenge.domain if challenge else "Environment",
            "district": challenge.district if challenge else "Pune"
        },
        "milestones": [{
            "id": m.id,
            "title": m.title,
            "sequence_order": m.sequence_order,
            "status": m.status,
            "completion_percentage": m.completion_percentage,
            "due_date": m.due_date,
            "completed_at": m.completed_at
        } for m in milestones],
        "partnerships": [{
            "id": part.id,
            "funding_amount_inr": part.funding_amount_inr,
            "contribution_types": part.contribution_types,
            "status": part.status,
            "description": part.description
        } for part in partnerships],
        "impact": {
            "people_reached": impact.people_reached if impact else 2450,
            "incident_reduction_percentage": impact.incident_reduction_percentage if impact else 78.0,
            "time_saved_hours_per_month": impact.time_saved_hours_per_month if impact else 160.0,
            "cost_saved_inr": impact.cost_saved_inr if impact else 450000.0,
            "environmental_score": impact.environmental_score if impact else "REDUCED_FLOODING_90% [DEMO DATA]"
        } if impact else None
    }


@router.put("/{project_id}/milestones/{milestone_id}", summary="Update Milestone Progress")
async def update_milestone(
    project_id: str,
    milestone_id: str,
    req: MilestoneUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Updates milestone status, evidence URL, and calculates project progress percentage."""
    m_res = await db.execute(select(Milestone).where(Milestone.id == milestone_id, Milestone.project_id == project_id))
    m = m_res.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")

    m.status = req.status
    m.completion_percentage = req.completion_percentage
    if req.evidence_url:
        m.evidence_url = req.evidence_url
    if req.status in ["COMPLETED", "APPROVED"]:
        m.completed_at = datetime.datetime.utcnow()

    # Recalculate project overall percentage
    all_m = await db.execute(select(Milestone).where(Milestone.project_id == project_id))
    ms = all_m.scalars().all()
    if ms:
        total_pct = sum(item.completion_percentage for item in ms)
        avg_pct = int(total_pct / len(ms))
        
        p_res = await db.execute(select(Project).where(Project.id == project_id))
        proj = p_res.scalar_one_or_none()
        if proj:
            proj.progress_percentage = avg_pct
            if avg_pct == 100:
                proj.stage = "DEPLOYED"
                proj.deployed_at = datetime.datetime.utcnow()

    await db.commit()
    return {"message": "Milestone updated successfully.", "milestone_status": m.status, "completion_percentage": m.completion_percentage}
