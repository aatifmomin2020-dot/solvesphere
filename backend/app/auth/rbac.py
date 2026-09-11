from typing import List
from fastapi import Depends, HTTPException, status
from app.auth.jwt import get_current_user
from app.models.schemas import User

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user.role}' is not authorized to perform this operation. Allowed roles: {self.allowed_roles}"
            )
        return user

def require_role(*roles: str):
    return RoleChecker(list(roles))
