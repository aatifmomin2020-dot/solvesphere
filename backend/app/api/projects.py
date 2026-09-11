import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import (
    Project, ProjectMilestone, Challenge, University, Faculty, StudentTeam, 
    IndustryOrganization, User, ImpactMetric, AuditLog, MilestoneUpdate, Notification
)
from app.auth.jwt import get_current_user
from app.auth.rbac import require_role

router = APIRouter(prefix="/projects", tags=["Projects"])

DEFAULT_MILESTONES = [
    {"stage": "PROBLEM_VERIFIED", "title": "Problem Verification & Requirement Scoping", "desc": "Government verification completed and technical parameters specified.", "status": "COMPLETED"},
    {"stage": "TEAM_FORMED", "title": "Multi-Stakeholder Team Formation", "desc": "Faculty mentor, student engineering team, and industry mentors onboarding.", "status": "COMPLETED"},
    {"stage": "PROTOTYPE", "title": "Hardware & Software Prototype Development", "desc": "Building functional MVP prototype and GIS sensor simulation.", "status": "IN_PROGRESS"},
    {"stage": "PILOT", "title": "Field Pilot Testing & Validation", "desc": "Deploying pilot hardware near target location for real-world validation.", "status": "PENDING"},
    {"stage": "DEPLOYMENT", "title": "Full Scale Municipal Deployment", "desc": "Government sanctioning full-scale city deployment and operational handoff.", "status": "PENDING"}
]

@router.post("", response_model=dict)
def create_or_accept_project(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("UNIVERSITY", "GOVERNMENT", "ADMIN"))
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Check if project already exists for this challenge
    existing_proj = db.query(Project).filter(Project.challenge_id == challenge_id).first()
    if existing_proj:
        return {"project_id": existing_proj.id, "message": "Project already exists for this challenge", "status": existing_proj.status}

    # Fetch default partners from seed DB
    uni = db.query(University).first()
    fac = db.query(Faculty).first()
    team = db.query(StudentTeam).first()
    ind = db.query(IndustryOrganization).first()
    gov_user = db.query(User).filter(User.role == "GOVERNMENT").first()

    proj_id = f"SS-P-{challenge.id.replace('SS-', '')}"
    
    project = Project(
        id=proj_id,
        challenge_id=challenge.id,
        title=f"Solution for {challenge.title}",
        description=f"Collaborative innovation project addressing: {challenge.description[:150]}...",
        status="TEAM_FORMED",
        university_id=uni.id if uni else None,
        faculty_id=fac.id if fac else None,
        student_team_id=team.id if team else None,
        industry_id=ind.id if ind else None,
        gov_officer_id=gov_user.id if gov_user else current_user.id
    )
    db.add(project)
    
    # Update Challenge status
    challenge.status = "IN_PROJECT"

    # Create Initial Milestones
    for idx, m in enumerate(DEFAULT_MILESTONES):
        m_record = ProjectMilestone(
            project_id=proj_id,
            title=m["title"],
            description=m["desc"],
            stage=m["stage"],
            status=m["status"],
            due_date=(datetime.datetime.utcnow() + datetime.timedelta(days=15 * (idx + 1))).strftime("%Y-%m-%d")
        )
        if m["status"] == "COMPLETED":
            m_record.completed_at = datetime.datetime.utcnow()
        db.add(m_record)

    # Create Impact Metric record
    impact = ImpactMetric(
        project_id=proj_id,
        citizens_affected=challenge.people_affected or 2450,
        incidents_before_monthly=500,
        incidents_after_monthly=120,
        response_time_before_hours=72.0,
        response_time_after_hours=12.0,
        cost_before_inr=500000.0,
        cost_after_inr=120000.0,
        user_satisfaction_percent=92.0,
        deployment_status="PROTOTYPE_TESTING",
        is_demo_data=True
    )
    db.add(impact)

    # Audit Log
    audit = AuditLog(
        action="PROJECT_CREATED",
        actor_id=current_user.id,
        actor_role=current_user.role,
        target_type="PROJECT",
        target_id=proj_id,
        details={"challenge_id": challenge.id, "university": uni.name if uni else None}
    )
    db.add(audit)
    db.commit()

    return {"project_id": proj_id, "status": project.status, "message": "Project successfully created and team formed!"}


@router.post("/{proj_id}/join-industry", response_model=dict)
def join_project_industry(
    proj_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("INDUSTRY", "ADMIN"))
):
    project = db.query(Project).filter(Project.id == proj_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ind_org = db.query(IndustryOrganization).first()
    if ind_org:
        project.industry_id = ind_org.id

    audit = AuditLog(
        action="INDUSTRY_JOINED",
        actor_id=current_user.id,
        actor_role=current_user.role,
        target_type="PROJECT",
        target_id=proj_id,
        details={"org_name": ind_org.org_name if ind_org else "Industry Partner"}
    )
    db.add(audit)
    db.commit()

    return {"message": "Industry partner successfully joined project!", "project_id": proj_id}


@router.get("", response_model=List[dict])
def list_projects(db: Session = Depends(get_db)):
    projs = db.query(Project).all()
    res = []
    for p in projs:
        ch = db.query(Challenge).filter(Challenge.id == p.challenge_id).first()
        res.append({
            "id": p.id,
            "title": p.title,
            "status": p.status,
            "challenge_id": p.challenge_id,
            "challenge_title": ch.title if ch else "",
            "category": ch.category if ch else "Environment",
            "location": ch.location_name if ch else "Urban",
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return res


@router.get("/{proj_id}", response_model=dict)
def get_project_workspace(proj_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == proj_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    ch = db.query(Challenge).filter(Challenge.id == p.challenge_id).first()
    uni = db.query(University).filter(University.id == p.university_id).first() if p.university_id else None
    fac = db.query(Faculty).filter(Faculty.id == p.faculty_id).first() if p.faculty_id else None
    team = db.query(StudentTeam).filter(StudentTeam.id == p.student_team_id).first() if p.student_team_id else None
    ind = db.query(IndustryOrganization).filter(IndustryOrganization.id == p.industry_id).first() if p.industry_id else None
    gov_officer = db.query(User).filter(User.id == p.gov_officer_id).first() if p.gov_officer_id else None

    milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == proj_id).all()
    m_list = []
    for m in milestones:
        m_list.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "stage": m.stage,
            "status": m.status,
            "due_date": m.due_date,
            "completed_at": m.completed_at.isoformat() if m.completed_at else None,
            "proof_url": m.proof_url
        })

    impact = db.query(ImpactMetric).filter(ImpactMetric.project_id == proj_id).first()
    impact_data = None
    if impact:
        impact_data = {
            "citizens_affected": impact.citizens_affected,
            "incidents_before": impact.incidents_before_monthly,
            "incidents_after": impact.incidents_after_monthly,
            "reduction_percent": round(((impact.incidents_before_monthly - impact.incidents_after_monthly) / impact.incidents_before_monthly) * 100.0, 1),
            "response_time_before_hours": impact.response_time_before_hours,
            "response_time_after_hours": impact.response_time_after_hours,
            "cost_before_inr": impact.cost_before_inr,
            "cost_after_inr": impact.cost_after_inr,
            "user_satisfaction_percent": impact.user_satisfaction_percent,
            "is_demo_data": impact.is_demo_data
        }

    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "status": p.status,
        "challenge": {
            "id": ch.id,
            "title": ch.title,
            "category": ch.category,
            "location": ch.location_name,
            "priority": ch.priority_level
        } if ch else None,
        "team": {
            "government_officer": gov_officer.full_name if gov_officer else "Urban Development Dept",
            "university": uni.name if uni else "ABC Institute of Technology",
            "faculty_advisor": fac.name if fac else "Dr. Rajesh Sharma",
            "student_team": team.team_name if team else "HydroSensors Team",
            "industry_partner": ind.org_name if ind else "SmartCity Technologies"
        },
        "milestones": m_list,
        "impact_metrics": impact_data,
        "created_at": p.created_at.isoformat() if p.created_at else None
    }


@router.patch("/{proj_id}/milestones", response_model=dict)
def update_milestone(
    proj_id: str,
    upd: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("UNIVERSITY", "GOVERNMENT", "INDUSTRY", "ADMIN"))
):
    m = db.query(ProjectMilestone).filter(ProjectMilestone.id == upd.milestone_id, ProjectMilestone.project_id == proj_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")

    m.status = upd.status
    if upd.status == "COMPLETED":
        m.completed_at = datetime.datetime.utcnow()
    if upd.proof_url:
        m.proof_url = upd.proof_url

    # Check overall project status progression
    p = db.query(Project).filter(Project.id == proj_id).first()
    if p:
        if m.stage == "PROTOTYPE" and upd.status == "COMPLETED":
            p.status = "PROTOTYPE"
        elif m.stage == "PILOT" and upd.status == "COMPLETED":
            p.status = "PILOT"
        elif m.stage == "DEPLOYMENT" and upd.status == "COMPLETED":
            p.status = "DEPLOYED"

    # Audit Log
    audit = AuditLog(
        action="MILESTONE_UPDATED",
        actor_id=current_user.id,
        actor_role=current_user.role,
        target_type="PROJECT",
        target_id=proj_id,
        details={"milestone": m.title, "new_status": upd.status}
    )
    db.add(audit)
    db.commit()

    return {"message": "Milestone status updated successfully", "milestone_id": m.id, "status": m.status, "project_status": p.status if p else "UNKNOWN"}
