import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, University, StudentTeam
from app.models.challenge import Challenge
from app.models.project import Proposal
from app.services.matching_service import UniversityMatchingEngine

router = APIRouter(prefix="/universities", tags=["University Portal & Matching"])


class ProposalCreateRequest(BaseModel):
    challenge_id: str
    title: str
    problem_interpretation: str
    proposed_solution: str
    technical_architecture: str
    estimated_timeline_weeks: int = 12
    budget_estimate_inr: float = 250000.0


@router.get("/matches/{challenge_id}", summary="Get University Recommendation Matches")
async def get_university_matches(challenge_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Challenge).where(or_(Challenge.id == challenge_id, Challenge.public_code == challenge_id)))
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    matches = await UniversityMatchingEngine.match_challenge(c, db)
    return {
        "challenge_id": c.id,
        "challenge_code": c.public_code,
        "domain": c.domain,
        "matches": matches
    }


@router.post("/proposals", summary="Submit University Team Technical Proposal")
async def create_proposal(
    req: ProposalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    univ_res = await db.execute(select(University).limit(1))
    univ = univ_res.scalar_one_or_none()
    team_res = await db.execute(select(StudentTeam).limit(1))
    team = team_res.scalar_one_or_none()

    if not univ or not team:
        raise HTTPException(status_code=400, detail="University or Team records not available in demo database.")

    ch_res = await db.execute(select(Challenge).where(or_(Challenge.id == req.challenge_id, Challenge.public_code == req.challenge_id)))
    ch = ch_res.scalar_one_or_none()
    target_ch_id = ch.id if ch else req.challenge_id

    prop = Proposal(
        id=str(uuid.uuid4()),
        challenge_id=target_ch_id,
        team_id=team.id,
        university_id=univ.id,
        faculty_mentor_id=team.faculty_mentor_id,
        title=req.title,
        problem_interpretation=req.problem_interpretation,
        proposed_solution=req.proposed_solution,
        technical_architecture=req.technical_architecture,
        estimated_timeline_weeks=req.estimated_timeline_weeks,
        budget_estimate_inr=req.budget_estimate_inr,
        status="SUBMITTED"
    )
    db.add(prop)

    if ch:
        ch.status = "PROPOSAL_SUBMITTED"

    await db.commit()
    await db.refresh(prop)

    return {"message": "Proposal submitted successfully for government evaluation.", "proposal_id": prop.id, "status": prop.status}
