import asyncio
import json
import uuid
import datetime
from typing import AsyncGenerator, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.system import Notification, OutboxEvent
from app.models.project import Milestone
from app.core.logging import logger

# In-memory SSE event subscribers queue
notification_subscribers = []


class NotificationService:

    @staticmethod
    async def create_notification(
        user_id: str,
        notif_type: str,
        title: str,
        message: str,
        db: AsyncSession
    ) -> Notification:
        notif = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=notif_type,
            title=title,
            message=message
        )
        db.add(notif)
        
        # Broadcast to SSE subscribers
        payload = {"id": notif.id, "user_id": user_id, "type": notif_type, "title": title, "message": message}
        for sub in notification_subscribers:
            try:
                await sub.put(payload)
            except Exception:
                pass
                
        return notif

    @staticmethod
    async def emit_outbox_event(
        event_type: str,
        payload: Dict[str, Any],
        db: AsyncSession
    ):
        event = OutboxEvent(
            id=str(uuid.uuid4()),
            event_type=event_type,
            payload_json=payload,
            status="PROCESSED",
            processed_at=datetime.datetime.utcnow()
        )
        db.add(event)

    @staticmethod
    async def check_overdue_milestones(db: AsyncSession):
        """Scans for overdue milestones and marks status OVERDUE + emits notification."""
        now = datetime.datetime.utcnow()
        stmt = select(Milestone).where(Milestone.due_date < now, Milestone.status.in_(["NOT_STARTED", "IN_PROGRESS"]))
        res = await db.execute(stmt)
        overdue_items = res.scalars().all()

        for m in overdue_items:
            m.status = "OVERDUE"
            logger.info(f"Milestone {m.id} marked as OVERDUE.")

        if overdue_items:
            await db.commit()
