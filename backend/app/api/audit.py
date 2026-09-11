from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import AuditLog

router = APIRouter(prefix="/audit-logs", tags=["Audit Log"])

@router.get("", response_model=List[dict])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [{
        "id": l.id,
        "action": l.action,
        "actor_id": l.actor_id,
        "actor_role": l.actor_role,
        "target_type": l.target_type,
        "target_id": l.target_id,
        "details": l.details,
        "timestamp": l.timestamp.isoformat() if l.timestamp else None
    } for l in logs]
