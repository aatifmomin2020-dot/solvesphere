import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.system import Notification
from app.services.notification_service import notification_subscribers

router = APIRouter(prefix="/notifications", tags=["Notifications & Real-Time Monitoring"])


@router.get("", summary="List In-App User Notifications")
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(20)
    res = await db.execute(stmt)
    notifs = res.scalars().all()

    return [{
        "id": n.id,
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "read_at": n.read_at,
        "created_at": n.created_at
    } for n in notifs]


@router.get("/stream", summary="Server-Sent Events (SSE) Live Update Stream")
async def sse_notification_stream(current_user: User = Depends(get_current_user)):
    """Provides real-time SSE event stream for live dashboard counters & alerts (Section 36)."""
    async def event_generator():
        q = asyncio.Queue()
        notification_subscribers.append(q)
        try:
            while True:
                data = await q.get()
                if data.get("user_id") == current_user.id or data.get("user_id") == "*":
                    yield f"event: notification\ndata: {json.dumps(data)}\n\n"
        except asyncio.CancelledError:
            notification_subscribers.remove(q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
