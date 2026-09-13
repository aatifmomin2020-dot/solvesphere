import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, IndustryOrganization
from app.models.project import Project, Partnership

router = APIRouter(prefix="/industry", tags=["Industry Portal & CSR Partnerships"])


class PartnershipCreateRequest(BaseModel):
    project_id: str
    contribution_types: List[str] # ["MENTORSHIP", "FUNDING", "PROTOTYPING", "PILOT"]
    funding_amount_inr: float = 150000.0
    description: str


@router.get("/opportunities", summary="Available Industry Partnership Opportunities")
async def list_industry_opportunities(db: AsyncSession = Depends(get_db)):
    """Exposes challenges & active projects looking for industry/CSR support (Section 29)."""
    stmt = select(Project).where(Project.stage.in_(["ACTIVE", "PROTOTYPE", "PILOT"]))
    res = await db.execute(stmt)
    projects = res.scalars().all()

    return [{
        "project_id": p.id,
        "title": p.title,
        "stage": p.stage,
        "progress_percentage": p.progress_percentage,
        "is_demo": p.is_demo
    } for p in projects]


@router.post("/partnerships", summary="Create Industry Partnership Offer")
async def create_partnership_offer(
    req: PartnershipCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submits an industry contribution offer (mentorship, funding, prototyping) (Section 33)."""
    ind_res = await db.execute(select(IndustryOrganization).limit(1))
    ind = ind_res.scalar_one_or_none()

    if not ind:
        raise HTTPException(status_code=400, detail="Industry Organization demo record not found.")

    part = Partnership(
        id=str(uuid.uuid4()),
        project_id=req.project_id,
        industry_id=ind.id,
        contribution_types=req.contribution_types,
        funding_amount_inr=req.funding_amount_inr,
        description=req.description,
        status="ACCEPTED",
        is_demo=True
    )
    db.add(part)
    await db.commit()
    await db.refresh(part)

    return {"message": "Partnership offer registered and added to Project Workspace.", "partnership_id": part.id}
