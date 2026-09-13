import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user, RoleChecker
from app.models.user import User
from app.models.challenge import Challenge, ChallengeStatusHistory, ChallengeFeedback
from app.models.system import AuditLog
from app.services.ai_service import AIService

router = APIRouter(prefix="/challenges", tags=["Challenges & Citizen Portal"])


class ChallengeCreateRequest(BaseModel):
    title: str
    description: str
    district: str
    locality: Optional[str] = None
    approx_latitude: Optional[float] = None
    approx_longitude: Optional[float] = None
    affected_population: int = 100
    severity_level: str = "MODERATE"
    is_anonymous: bool = False


class ChallengeVerifyRequest(BaseModel):
    decision: str
    official_priority: Optional[str] = "HIGH"
    priority_reason: Optional[str] = None
    assigned_department: Optional[str] = "Department of Environment"
    rejection_reason: Optional[str] = None


class FeedbackCreateRequest(BaseModel):
    rating: int
    is_resolved: str = "YES"
    comment: Optional[str] = None


@router.get("", summary="Public Challenge Catalog")
async def list_challenges(
    domain: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Challenge)

    if domain:
        stmt = stmt.where(Challenge.domain == domain)
    if district:
        stmt = stmt.where(Challenge.district == district)
    if status_filter:
        stmt = stmt.where(Challenge.status == status_filter)
    if search:
        stmt = stmt.where(
            or_(
                Challenge.title.ilike(f"%{search}%"),
                Challenge.description.ilike(f"%{search}%"),
                Challenge.public_code.ilike(f"%{search}%")
            )
        )

    stmt = stmt.order_by(Challenge.created_at.desc()).offset(skip).limit(limit)
    res = await db.execute(stmt)
    challenges = res.scalars().all()

    sanitized = []
    for c in challenges:
        sanitized.append({
            "id": c.id,
            "public_code": c.public_code,
            "title": c.title,
            "summary": c.description[:180] + "..." if len(c.description) > 180 else c.description,
            "domain": c.domain,
            "sub_domain": c.sub_domain,
            "district": c.district,
            "locality": c.locality,
            "approx_latitude": c.approx_latitude,
            "approx_longitude": c.approx_longitude,
            "official_priority": c.official_priority,
            "status": c.status,
            "affected_population": c.affected_population,
            "created_at": c.created_at,
            "is_demo": c.is_demo
        })

    return {"total": len(sanitized), "items": sanitized}


@router.post("", summary="Submit a New Challenge (4-Step Wizard)")
async def create_challenge(
    req: ChallengeCreateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    count_res = await db.execute(select(func.count(Challenge.id)))
    cnt = count_res.scalar() or 1000
    public_code = f"SS-{1042 + cnt + 1}"

    c = Challenge(
        id=str(uuid.uuid4()),
        public_code=public_code,
        title=req.title,
        description=req.description,
        district=req.district,
        locality=req.locality,
        approx_latitude=req.approx_latitude,
        approx_longitude=req.approx_longitude,
        precise_latitude=req.approx_latitude,
        precise_longitude=req.approx_longitude,
        affected_population=req.affected_population,
        severity_level=req.severity_level,
        status="AI_ANALYZING",
        citizen_id=current_user.id if (current_user and not req.is_anonymous) else None,
        is_anonymous=req.is_anonymous
    )
    db.add(c)
    await db.flush()

    db.add(ChallengeStatusHistory(
        id=str(uuid.uuid4()),
        challenge_id=c.id,
        actor_id=current_user.id if current_user else None,
        previous_status="DRAFT",
        new_status="AI_ANALYZING",
        reason="Citizen submission initiated."
    ))

    try:
        analysis = await AIService.analyze_challenge(c, db)
        duplicates = await AIService.find_duplicates(c, db)
        c.status = "AWAITING_VERIFICATION"
    except Exception:
        c.status = "AWAITING_VERIFICATION"
        analysis = None
        duplicates = []

    await db.commit()
    await db.refresh(c)

    return {
        "id": c.id,
        "public_code": c.public_code,
        "status": c.status,
        "domain": c.domain,
        "ai_priority_recommended": c.official_priority,
        "duplicates_found": duplicates,
        "message": "Your report has been submitted and categorized successfully."
    }


@router.get("/{id_or_code}", summary="Get Challenge Detailed View")
async def get_challenge_detail(id_or_code: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Challenge).where(
        or_(Challenge.id == id_or_code, Challenge.public_code == id_or_code)
    )
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()

    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    return {
        "id": c.id,
        "public_code": c.public_code,
        "title": c.title,
        "description": c.description,
        "domain": c.domain,
        "sub_domain": c.sub_domain,
        "official_priority": c.official_priority,
        "ai_priority_score": c.ai_priority_score,
        "status": c.status,
        "district": c.district,
        "locality": c.locality,
        "approx_latitude": c.approx_latitude,
        "approx_longitude": c.approx_longitude,
        "affected_population": c.affected_population,
        "severity_level": c.severity_level,
        "created_at": c.created_at,
        "verified_at": c.verified_at,
        "is_demo": c.is_demo
    }


@router.post("/{challenge_id}/verify", summary="Government Challenge Verification")
async def verify_challenge(
    challenge_id: str,
    req: ChallengeVerifyRequest,
    current_user: User = Depends(RoleChecker(["GOVERNMENT", "GOVERNMENT_REVIEWER", "GOVERNMENT_OFFICER", "PLATFORM_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    prev_status = c.status
    if req.decision == "VERIFIED":
        c.status = "VERIFIED"
        c.official_priority = req.official_priority or c.official_priority
        c.priority_reason = req.priority_reason
        c.assigned_department = req.assigned_department
        c.verified_at = datetime.datetime.utcnow()
        c.verified_by_id = current_user.id
    elif req.decision == "REJECTED":
        c.status = "REJECTED"
        c.rejection_reason = req.rejection_reason
    else:
        c.status = "NEEDS_INFORMATION"

    db.add(ChallengeStatusHistory(
        id=str(uuid.uuid4()),
        challenge_id=c.id,
        actor_id=current_user.id,
        previous_status=prev_status,
        new_status=c.status,
        reason=req.priority_reason or req.rejection_reason or "Government review decision"
    ))

    db.add(AuditLog(
        id=str(uuid.uuid4()),
        actor_id=current_user.id,
        actor_role=current_user.primary_role,
        action=f"CHALLENGE_{req.decision}",
        entity_type="CHALLENGE",
        entity_id=c.id,
        reason=req.priority_reason or req.rejection_reason
    ))

    await db.commit()
    return {"message": f"Challenge {c.public_code} status updated to {c.status}.", "status": c.status}


@router.post("/{challenge_id}/feedback", summary="Submit Citizen Outcome Feedback")
async def submit_feedback(
    challenge_id: str,
    req: FeedbackCreateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    fb = ChallengeFeedback(
        id=str(uuid.uuid4()),
        challenge_id=challenge_id,
        citizen_id=current_user.id if current_user else None,
        rating=req.rating,
        is_resolved=req.is_resolved,
        comment=req.comment
    )
    db.add(fb)
    await db.commit()
    return {"message": "Thank you for your feedback! Your evaluation helps improve government & university response quality."}
