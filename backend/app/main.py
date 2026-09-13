import os
import sys

# Ensure current working backend directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api import (
    auth, challenges, universities, industry, projects, impact, 
    feedback, notifications, audit, ai_eval, events
)
from app.seed.seed_data import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Include API Routers for both /api and /api/v1
for prefix in ["/api", "/api/v1"]:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(challenges.router, prefix=prefix)
    app.include_router(universities.router, prefix=prefix)
    app.include_router(industry.router, prefix=prefix)
    app.include_router(projects.router, prefix=prefix)
    app.include_router(impact.router, prefix=prefix)
    app.include_router(feedback.router, prefix=prefix)
    app.include_router(notifications.router, prefix=prefix)
    app.include_router(audit.router, prefix=prefix)
    app.include_router(ai_eval.router, prefix=prefix)
    app.include_router(events.router, prefix=prefix)

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/")
@app.get("/api/health/ready")
@app.get("/api/v1/health/ready")
def health_check():
    return {
        "status": "healthy",
        "message": "Welcome to SolveSphere API - Smart India Hackathon Prototype (Problem Statement 26043)",
        "tagline": "From societal problems to measurable solutions.",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/api/gov/dashboard")
@app.get("/api/v1/gov/dashboard")
def get_gov_dashboard(db=Depends(get_db)):
    from app.models.schemas import Challenge
    total = db.query(Challenge).count()
    verified = db.query(Challenge).filter(Challenge.status == "VERIFIED").count()
    submitted = db.query(Challenge).filter(Challenge.status.in_(["SUBMITTED", "AI_ANALYZED", "AWAITING_VERIFICATION"])).count()
    
    queue = db.query(Challenge).filter(Challenge.status.in_(["AI_ANALYZED", "AWAITING_VERIFICATION", "SUBMITTED"])).limit(10).all()
    q_data = []
    for c in queue:
        q_data.append({
            "id": c.id,
            "public_code": c.id,
            "title": c.title,
            "description": c.description,
            "domain": c.category,
            "district": c.location_name,
            "severity_level": c.severity,
            "ai_priority_score": c.priority_score,
            "official_priority": c.priority_level,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })

    return {
        "kpis": {
            "total_submitted": total,
            "pending_verification": submitted,
            "verified_active": verified,
            "deployed_solutions": 14
        },
        "verification_queue": q_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
