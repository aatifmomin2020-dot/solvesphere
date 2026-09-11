import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import (
    Challenge, ChallengeCreate, ChallengeVerifyRequest, ChallengeDuplicate, 
    User, University, IndustryOrganization, AuditLog, Notification
)
from app.auth.jwt import get_current_user
from app.auth.rbac import require_role
from app.ai.classifier import classify_challenge
from app.ai.priority import calculate_priority_score
from app.ai.embedding import get_embedding, calculate_cosine_similarity
from app.ai.matching import match_universities_for_challenge, match_industry_for_challenge

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("", response_model=dict)
def create_challenge(
    ch_in: ChallengeCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role("CITIZEN", "GOVERNMENT", "ADMIN"))
):
    # 1. Generate unique Challenge ID
    ch_num = random.randint(1050, 9999)
    ch_id = f"SS-{ch_num}"
    
    # 2. AI Classification
    domain, sub_domain, confidence = classify_challenge(ch_in.title, ch_in.description, ch_in.category)
    
    # 3. AI Priority Scoring
    priority_res = calculate_priority_score(
        people_affected=ch_in.people_affected or 100,
        severity=ch_in.severity or "MEDIUM",
        frequency=ch_in.frequency or "Daily",
        evidence_url=ch_in.evidence_url,
        description=ch_in.description
    )
    
    # 4. Generate Embedding
    embedding = get_embedding(ch_in.title + " " + ch_in.description)
    
    # 5. Create Challenge record
    challenge = Challenge(
        id=ch_id,
        title=ch_in.title,
        description=ch_in.description,
        category=domain,
        sub_category=sub_domain,
        location_name=ch_in.location_name,
        latitude=ch_in.latitude or 0.0,
        longitude=ch_in.longitude or 0.0,
        severity=ch_in.severity or "MEDIUM",
        people_affected=ch_in.people_affected or 100,
        frequency=ch_in.frequency or "Daily",
        evidence_url=ch_in.evidence_url,
        contact_info=ch_in.contact_info,
        priority_score=priority_res["priority_score"],
        impact_score=priority_res["impact_score"],
        urgency_score=priority_res["urgency_score"],
        evidence_score=priority_res["evidence_score"],
        priority_level=priority_res["priority_level"],
        ai_confidence=confidence,
        embedding_json=embedding,
        status="AI_ANALYZED",
        citizen_id=current_user.id
    )
    
    db.add(challenge)
    db.commit()

    # 6. Semantic Duplicate Detection against existing challenges
    all_existing = db.query(Challenge).filter(Challenge.id != ch_id).all()
    duplicates_found = []
    
    for prev in all_existing:
        if prev.embedding_json:
            sim = calculate_cosine_similarity(embedding, prev.embedding_json)
            if sim >= 80.0:
                dup = ChallengeDuplicate(
                    challenge_id=ch_id,
                    duplicate_challenge_id=prev.id,
                    similarity_score=sim,
                    status="POTENTIAL_DUPLICATE"
                )
                db.add(dup)
                duplicates_found.append({"id": prev.id, "title": prev.title, "similarity": sim})

    # 7. Audit Log
    audit = AuditLog(
        action="CHALLENGE_CREATED",
        actor_id=current_user.id,
        actor_role=current_user.role,
        target_type="CHALLENGE",
        target_id=ch_id,
        details={"title": ch_in.title, "priority": priority_res["priority_level"], "domain": domain}
    )
    db.add(audit)
    db.commit()
    db.refresh(challenge)

    return {
        "id": challenge.id,
        "title": challenge.title,
        "category": challenge.category,
        "sub_category": challenge.sub_category,
        "status": challenge.status,
        "priority_score": challenge.priority_score,
        "priority_level": challenge.priority_level,
        "ai_confidence": challenge.ai_confidence,
        "duplicates_count": len(duplicates_found),
        "potential_duplicates": duplicates_found[:3]
    }


@router.get("", response_model=List[dict])
def list_challenges(
    domain: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Challenge)
    if domain:
        query = query.filter(Challenge.category == domain)
    if priority:
        query = query.filter(Challenge.priority_level == priority)
    if status:
        query = query.filter(Challenge.status == status)
    if q:
        query = query.filter(Challenge.title.ilike(f"%{q}%") | Challenge.description.ilike(f"%{q}%"))

    challenges = query.order_by(Challenge.priority_score.desc()).all()
    
    result = []
    for c in challenges:
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "sub_category": c.sub_category,
            "location_name": c.location_name,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "severity": c.severity,
            "people_affected": c.people_affected,
            "priority_score": c.priority_score,
            "priority_level": c.priority_level,
            "status": c.status,
            "upvotes_count": c.upvotes_count,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return result


@router.get("/{ch_id}", response_model=dict)
def get_challenge_detail(ch_id: str, db: Session = Depends(get_db)):
    c = db.query(Challenge).filter(Challenge.id == ch_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Fetch duplicate records
    dups = db.query(ChallengeDuplicate).filter(ChallengeDuplicate.challenge_id == ch_id).all()
    dup_list = []
    for d in dups:
        target = db.query(Challenge).filter(Challenge.id == d.duplicate_challenge_id).first()
        if target:
            dup_list.append({
                "id": target.id,
                "title": target.title,
                "similarity_score": d.similarity_score,
                "status": d.status
            })

    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "category": c.category,
        "sub_category": c.sub_category,
        "location_name": c.location_name,
        "latitude": c.latitude,
        "longitude": c.longitude,
        "severity": c.severity,
        "people_affected": c.people_affected,
        "frequency": c.frequency,
        "evidence_url": c.evidence_url,
        "priority_score": c.priority_score,
        "impact_score": c.impact_score,
        "urgency_score": c.urgency_score,
        "evidence_score": c.evidence_score,
        "priority_level": c.priority_level,
        "ai_confidence": c.ai_confidence,
        "status": c.status,
        "upvotes_count": c.upvotes_count,
        "potential_duplicates": dup_list,
        "created_at": c.created_at.isoformat() if c.created_at else None
    }


@router.post("/{ch_id}/verify", response_model=dict)
def verify_challenge(
    ch_id: str,
    req: ChallengeVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("GOVERNMENT", "ADMIN"))
):
    c = db.query(Challenge).filter(Challenge.id == ch_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if req.action == "VERIFY":
        c.status = "VERIFIED"
    elif req.action == "REJECT":
        c.status = "REJECTED"
    elif req.action == "REQUEST_INFO":
        c.status = "MORE_INFO_REQUESTED"
    elif req.action == "MERGE":
        c.status = "MERGED"

    c.updated_at = datetime.datetime.utcnow()

    # Create Audit Log
    audit = AuditLog(
        action=f"CHALLENGE_{req.action}",
        actor_id=current_user.id,
        actor_role=current_user.role,
        target_type="CHALLENGE",
        target_id=ch_id,
        details={"notes": req.notes, "status": c.status}
    )
    db.add(audit)

    # Notify Citizen
    if c.citizen_id:
        notif = Notification(
            user_id=c.citizen_id,
            title=f"Challenge {c.id} Verified",
            message=f"Your reported challenge '{c.title}' has been verified by the Government.",
            link=f"/citizen/challenges/{c.id}"
        )
        db.add(notif)

    db.commit()
    return {"message": f"Challenge status updated to {c.status}", "challenge_id": c.id, "status": c.status}


@router.get("/{ch_id}/matches", response_model=dict)
def get_challenge_matches(ch_id: str, db: Session = Depends(get_db)):
    c = db.query(Challenge).filter(Challenge.id == ch_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    unis = db.query(University).all()
    uni_dicts = []
    for u in unis:
        uni_dicts.append({
            "id": u.id,
            "name": u.name,
            "state": u.state,
            "city": u.city,
            "departments": u.departments or [],
            "domains": u.domains or [],
            "research_areas": u.research_areas or [],
            "faculty": [],
            "student_teams": []
        })

    ind_orgs = db.query(IndustryOrganization).all()
    ind_dicts = []
    for io in ind_orgs:
        ind_dicts.append({
            "id": io.id,
            "org_name": io.org_name,
            "industry_domain": io.industry_domain,
            "expertise": io.expertise or [],
            "support_types": io.support_types or [],
            "funding_available_inr": io.funding_available_inr
        })

    ch_dict = {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "category": c.category,
        "sub_category": c.sub_category,
        "location_name": c.location_name
    }

    university_matches = match_universities_for_challenge(ch_dict, uni_dicts)
    industry_matches = match_industry_for_challenge(ch_dict, ind_dicts)

    return {
        "challenge_id": c.id,
        "university_matches": university_matches,
        "industry_matches": industry_matches
    }


@router.post("/{ch_id}/upvote", response_model=dict)
def upvote_challenge(ch_id: str, db: Session = Depends(get_db)):
    c = db.query(Challenge).filter(Challenge.id == ch_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    c.upvotes_count += 1
    db.commit()
    return {"upvotes_count": c.upvotes_count}
