from fastapi import APIRouter
from app.api.v1 import health, auth, challenges, gov, universities, industry, projects, analytics, ai, media, notifications

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Observability"])
api_router.include_router(auth.router)
api_router.include_router(challenges.router)
api_router.include_router(gov.router)
api_router.include_router(universities.router)
api_router.include_router(industry.router)
api_router.include_router(projects.router)
api_router.include_router(analytics.router)
api_router.include_router(ai.router)
api_router.include_router(media.router)
api_router.include_router(notifications.router)
