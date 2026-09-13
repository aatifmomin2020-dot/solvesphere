import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.user import User, IndustryOrganization
from app.models.project import Project, Partnership
from app.models.system import AuditLog

router = APIRouter(prefix="/industry", tags=["Industry Portal & CSR Partnerships"])


class PartnershipCreateRequest(BaseModel):
    project_id: str
    contribution_types: List[str] # ["MENTORSHIP", "FUNDING", "PROTOTYPING", "PILOT"]
    funding_amount_inr: float = 150000.0
    description: str


class PartnershipEvaluateRequest(BaseModel):
    decision: str # ACCEPTED, REJECTED, CANCELLED
    reason: Optional[str] = None


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
    """Submits an industry contribution offer with status PENDING for project workspace evaluation."""
    ind = None
    if current_user.organization_id:
        ind_res = await db.execute(
            select(IndustryOrganization).where(
                or_(IndustryOrganization.id == current_user.organization_id, IndustryOrganization.organization_id == current_user.organization_id)
            )
        )
        ind = ind_res.scalar_one_or_none()

    if not ind and current_user.primary_role in ["INDUSTRY", "PLATFORM_ADMIN"]:
        ind_res = await db.execute(select(IndustryOrganization).where(IndustryOrganization.is_demo == True))
        ind = ind_res.scalars().first()

    if not ind:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Your account is not associated with an authorized industry organization."
        )

    part = Partnership(
        id=str(uuid.uuid4()),
        project_id=req.project_id,
        industry_id=ind.id,
        contribution_types=req.contribution_types,
        funding_amount_inr=req.funding_amount_inr,
        description=req.description,
        status="PENDING",
        is_demo=True
    )
    db.add(part)

    db.add(AuditLog(
        id=str(uuid.uuid4()),
        actor_id=current_user.id,
        actor_role=current_user.primary_role,
        action="PARTNERSHIP_REQUESTED",
        entity_type="PARTNERSHIP",
        entity_id=part.id,
        reason=f"Partnership offer submitted for project {req.project_id}"
    ))

    await db.commit()
    await db.refresh(part)

    return {"message": "Partnership offer registered as PENDING and submitted for workspace review.", "partnership_id": part.id, "status": part.status}


@router.post("/partnerships/{partnership_id}/evaluate", summary="Evaluate Industry Partnership Request")
async def evaluate_partnership(
    partnership_id: str,
    req: PartnershipEvaluateRequest,
    current_user: User = Depends(RoleChecker(["GOVERNMENT", "GOVERNMENT_REVIEWER", "GOVERNMENT_OFFICER", "PLATFORM_ADMIN", "UNIVERSITY"])),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates (ACCEPTED/REJECTED/CANCELLED) an industry partnership offer with audit logging."""
    res = await db.execute(select(Partnership).where(Partnership.id == partnership_id))
    part = res.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Partnership offer not found")

    decision_upper = req.decision.upper()
    if decision_upper not in ["ACCEPTED", "REJECTED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be ACCEPTED, REJECTED, or CANCELLED.")

    part.status = decision_upper

    db.add(AuditLog(
        id=str(uuid.uuid4()),
        actor_id=current_user.id,
        actor_role=current_user.primary_role,
        action=f"PARTNERSHIP_{decision_upper}",
        entity_type="PARTNERSHIP",
        entity_id=part.id,
        reason=req.reason or "Partnership evaluation decision"
    ))

    await db.commit()
    return {"message": f"Partnership status updated to {part.status}.", "partnership_id": part.id, "status": part.status}

