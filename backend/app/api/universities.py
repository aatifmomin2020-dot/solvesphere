from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import University, Faculty, StudentTeam, Challenge, User
from app.auth.jwt import get_current_user
from app.auth.rbac import require_role
from app.ai.matching import match_universities_for_challenge

router = APIRouter(prefix="/universities", tags=["Universities"])

@router.get("", response_model=List[dict])
def list_universities(db: Session = Depends(get_db)):
    unis = db.query(University).all()
    res = []
    for u in unis:
        res.append({
            "id": u.id,
            "name": u.name,
            "state": u.state,
            "city": u.city,
            "departments": u.departments or [],
            "domains": u.domains or [],
            "research_areas": u.research_areas or []
        })
    return res

@router.get("/recommendations", response_model=List[dict])
def get_university_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("UNIVERSITY", "ADMIN"))
):
    # Find university profile
    uni = db.query(University).first()
    if not uni:
        return []

    verified_challenges = db.query(Challenge).filter(Challenge.status.in_(["VERIFIED", "AI_ANALYZED"])).all()
    
    uni_dict = {
        "id": uni.id,
        "name": uni.name,
        "state": uni.state,
        "city": uni.city,
        "departments": uni.departments or [],
        "domains": uni.domains or [],
        "research_areas": uni.research_areas or [],
        "faculty": [],
        "student_teams": []
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
        matches = match_universities_for_challenge(ch_dict, [uni_dict])
        if matches:
            m = matches[0]
            recommendations.append({
                "challenge_id": ch.id,
                "title": ch.title,
                "category": ch.category,
                "sub_category": ch.sub_category,
                "location_name": ch.location_name,
                "priority_level": ch.priority_level,
                "people_affected": ch.people_affected,
                "status": ch.status,
                "match_score": m["match_score"],
                "matched_reasons": m["matched_reasons"]
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations

@router.get("/teams", response_model=List[dict])
def get_student_teams(db: Session = Depends(get_db)):
    teams = db.query(StudentTeam).all()
    return [{
        "id": t.id,
        "team_name": t.team_name,
        "department": t.department,
        "skills": t.skills or [],
        "leader_name": t.leader_name,
        "member_count": t.member_count
    } for t in teams]

@router.get("/faculty", response_model=List[dict])
def get_faculty(db: Session = Depends(get_db)):
    faculty = db.query(Faculty).all()
    return [{
        "id": f.id,
        "name": f.name,
        "email": f.email,
        "department": f.department,
        "expertise": f.expertise or [],
        "research_areas": f.research_areas or []
    } for f in faculty]
