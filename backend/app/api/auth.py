from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import User, UserRegister, UserLogin, Token
from app.auth.jwt import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEMO_ACCOUNTS = {
    "CITIZEN": {"email": "citizen@solvesphere.gov.in", "full_name": "Ramesh Kumar (Citizen)", "org": "Public Community Member"},
    "GOVERNMENT": {"email": "gov@solvesphere.gov.in", "full_name": "Anita Verma (Municipal Commissioner)", "org": "Urban Development Dept"},
    "UNIVERSITY": {"email": "university@solvesphere.gov.in", "full_name": "Dr. Rajesh Sharma (Faculty Advisor)", "org": "ABC Institute of Technology"},
    "INDUSTRY": {"email": "industry@solvesphere.gov.in", "full_name": "Vikram Mehta (CSR Lead)", "org": "SmartCity Innovations Pvt Ltd"}
}

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.upper(),
        organization_name=user_in.organization_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_name": user.organization_name
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_name": user.organization_name
        }
    }

@router.post("/demo-login", response_model=Token)
def demo_login(role: str = "CITIZEN", db: Session = Depends(get_db)):
    role_key = role.upper()
    if role_key not in DEMO_ACCOUNTS:
        raise HTTPException(status_code=400, detail="Invalid demo role. Allowed: CITIZEN, GOVERNMENT, UNIVERSITY, INDUSTRY")

    demo_info = DEMO_ACCOUNTS[role_key]
    user = db.query(User).filter(User.email == demo_info["email"]).first()
    
    if not user:
        user = User(
            email=demo_info["email"],
            password_hash=get_password_hash("demo1234"),
            full_name=demo_info["full_name"],
            role=role_key,
            organization_name=demo_info["org"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_name": user.organization_name
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "organization_name": current_user.organization_name
    }
