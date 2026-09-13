from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/demo-login", response_model=TokenResponse, summary="One-Click Demo Login Switcher")
async def demo_login(role: str = "CITIZEN", db: AsyncSession = Depends(get_db)):
    """Logs in as a seeded demo account for immediate SIH demonstration."""
    role_upper = role.upper()
    role_email_map = {
        "CITIZEN": "citizen@solvesphere.gov.in",
        "GOVERNMENT": "gov@solvesphere.gov.in",
        "UNIVERSITY": "university@solvesphere.gov.in",
        "INDUSTRY": "industry@solvesphere.gov.in",
        "FACULTY": "faculty@solvesphere.gov.in",
        "STUDENT": "student@solvesphere.gov.in"
    }

    target_email = role_email_map.get(role_upper, "citizen@solvesphere.gov.in")
    result = await db.execute(select(User).where(User.email == target_email))
    user = result.scalar_one_or_none()

    if not user:
        # Fallback create demo user if DB not seeded
        user = User(
            email=target_email,
            hashed_password=get_password_hash("demo1234"),
            full_name=f"Demo {role_upper.capitalize()} User",
            primary_role=role_upper,
            is_demo=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(data={"sub": user.id, "role": user.primary_role})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.primary_role,
            "is_demo": user.is_demo
        }
    }


@router.post("/login", response_model=TokenResponse, summary="Standard Account Login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user.id, "role": user.primary_role})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.primary_role,
            "is_demo": user.is_demo
        }
    }


@router.get("/me", summary="Get Current Authenticated User Profile")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.primary_role,
        "is_anonymous": user.is_anonymous,
        "is_demo": user.is_demo
    }
