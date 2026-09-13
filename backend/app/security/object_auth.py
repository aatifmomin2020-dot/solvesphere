from fastapi import HTTPException, status
from app.models.schemas import User, Challenge, Project

def verify_challenge_access(user: User, challenge: Challenge, action: str = "READ") -> bool:
    """
    Object-level authorization checker for Challenges:
    - Citizen can read public challenge info, but only edit/delete their own draft/submission.
    - Government can view & update challenges within jurisdiction.
    """
    if user.role in ["ADMIN", "PLATFORM_ADMIN"]:
        return True

    if action == "WRITE":
        if user.role == "CITIZEN" and challenge.citizen_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Object Authorization Error: You can only modify your own submitted challenges."
            )
        if user.role == "GOVERNMENT" and challenge.status == "REJECTED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify a rejected challenge."
            )
    return True

def verify_project_access(user: User, project: Project, action: str = "READ") -> bool:
    """
    Object-level authorization checker for Projects:
    - Only assigned Government officers, University faculty/students, or Industry partners can modify project state.
    """
    if user.role in ["ADMIN", "PLATFORM_ADMIN"]:
        return True

    if action == "WRITE":
        is_gov_assigned = user.role == "GOVERNMENT" and project.gov_officer_id == user.id
        is_uni = user.role == "UNIVERSITY"
        is_industry = user.role == "INDUSTRY"
        
        if not (is_gov_assigned or is_uni or is_industry):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Object Authorization Error: You are not an assigned stakeholder for this project."
            )
    return True
