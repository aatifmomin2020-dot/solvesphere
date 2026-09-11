from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import IndustryOrganization, IndustryOpportunity, Challenge, User
from app.auth.jwt import get_current_user
from app.auth.rbac import require_role
from app.ai.matching import match_industry_for_challenge

router = APIRouter(prefix="/industry", tags=["Industry & CSR"])

@router.get("/organizations", response_model=List[dict])
def list_industry_orgs(db: Session = Depends(get_db)):
    orgs = db.query(IndustryOrganization).all()
    return [{
        "id": o.id,
        "org_name": o.org_name,
        "industry_domain": o.industry_domain,
        "expertise": o.expertise or [],
        "support_types": o.support_types or [],
        "funding_available_inr": o.funding_available_inr
    } for o in orgs]

@router.get("/opportunities", response_model=List[dict])
def list_opportunities(db: Session = Depends(get_db)):
    opps = db.query(IndustryOpportunity).all()
    return [{
        "id": o.id,
        "industry_id": o.industry_id,
        "title": o.title,
        "description": o.description,
        "support_type": o.support_type,
        "budget_inr": o.budget_inr,
        "domains": o.domains or [],
        "location": o.location,
        "status": o.status
    } for o in opps]

@router.get("/recommendations", response_model=List[dict])
def get_industry_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("INDUSTRY", "ADMIN"))
):
    org = db.query(IndustryOrganization).first()
    if not org:
        return []

    verified_challenges = db.query(Challenge).filter(Challenge.status.in_(["VERIFIED", "IN_PROJECT"])).all()
    
    org_dict = {
        "id": org.id,
        "org_name": org.org_name,
        "industry_domain": org.industry_domain,
        "expertise": org.expertise or [],
        "support_types": org.support_types or [],
        "funding_available_inr": org.funding_available_inr
    }

    recommendations = []
    for ch in verified_challenges:
        ch_dict = {
            "id": ch.id,
            "title": ch.title,
            "description": ch.description,
            "category": ch.category,
            "sub_category": ch.sub_category,
            "location_name": ch.location_name
        }
        matches = match_industry_for_challenge(ch_dict, [org_dict])
        if matches:
            m = matches[0]
            recommendations.append({
                "challenge_id": ch.id,
                "title": ch.title,
                "category": ch.category,
                "location_name": ch.location_name,
                "priority_level": ch.priority_level,
                "people_affected": ch.people_affected,
                "status": ch.status,
                "match_score": m["match_score"],
                "matched_reasons": m["matched_reasons"],
                "recommended_support": org.support_types or ["MENTORSHIP", "TECHNOLOGY"]
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations
