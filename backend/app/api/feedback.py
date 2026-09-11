from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import CitizenFeedback, FeedbackCreate, User, AuditLog
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/feedback", tags=["Citizen Feedback"])

@router.post("", response_model=dict)
def submit_feedback(
    fb_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    feedback = CitizenFeedback(
        challenge_id=fb_in.challenge_id,
        project_id=fb_in.project_id,
        citizen_id=current_user.id,
        rating=fb_in.rating,
        comment=fb_in.comment,
        problem_status=fb_in.problem_status
    )
    db.add(feedback)

    audit = AuditLog(
        action="CITIZEN_FEEDBACK_SUBMITTED",
        actor_id=current_user.id,
        actor_role=current_user.role,
        target_type="CHALLENGE",
        target_id=fb_in.challenge_id,
        details={"rating": fb_in.rating, "status": fb_in.problem_status}
    )
    db.add(audit)
    db.commit()

    return {"message": "Thank you! Your feedback has been recorded.", "id": feedback.id}

@router.get("", response_model=List[dict])
def get_feedback_list(challenge_id: str = None, db: Session = Depends(get_db)):
    query = db.query(CitizenFeedback)
    if challenge_id:
        query = query.filter(CitizenFeedback.challenge_id == challenge_id)
    feedbacks = query.order_by(CitizenFeedback.created_at.desc()).all()
    
    res = []
    for f in feedbacks:
        citizen = db.query(User).filter(User.id == f.citizen_id).first()
        res.append({
            "id": f.id,
            "challenge_id": f.challenge_id,
            "project_id": f.project_id,
            "citizen_name": citizen.full_name if citizen else "Anonymous Citizen",
            "rating": f.rating,
            "comment": f.comment,
            "problem_status": f.problem_status,
            "created_at": f.created_at.isoformat() if f.created_at else None
        })
    return res
