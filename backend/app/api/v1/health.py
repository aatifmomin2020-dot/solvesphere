import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()

START_TIME = time.time()


@router.get("/health/live", summary="Liveness Probe")
async def liveness():
    """Returns 200 OK if the backend service is running."""
    return {
        "status": "live",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": round(time.time() - START_TIME, 2)
    }


@router.get("/health/ready", summary="Readiness Probe")
async def readiness(db: AsyncSession = Depends(get_db)):
    """Returns 200 OK if the database and essential services are ready."""
    db_healthy = False
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_healthy = True
    except Exception as e:
        db_healthy = False

    if not db_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "database": "unhealthy"}
        )

    return {
        "status": "ready",
        "service": settings.PROJECT_NAME,
        "database": "connected",
        "db_engine": settings.DB_ENGINE
    }


@router.get("/metrics", summary="Application Operational Metrics")
async def metrics(db: AsyncSession = Depends(get_db)):
    """Exposes basic operational metrics for SLA and system monitoring."""
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    return {
        "app_name": settings.PROJECT_NAME,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "db_status": db_status,
        "db_engine": settings.DB_ENGINE,
        "rate_limiting": "enabled",
        "security_headers": "enabled"
    }
