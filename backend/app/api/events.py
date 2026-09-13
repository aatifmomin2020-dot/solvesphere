import asyncio
import json
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/events", tags=["Real-time Event Streaming"])

async def event_generator():
    """
    Generates Server-Sent Events (SSE) stream for live dashboard counters & outbox updates.
    """
    counter = 0
    while True:
        await asyncio.sleep(5)
        counter += 1
        data = {
            "event_id": f"evt-{counter}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "type": "HEARTBEAT",
            "message": "Real-time outbox sync active"
        }
        yield f"data: {json.dumps(data)}\n\n"

@router.get("/stream")
def stream_events():
    """
    Server-Sent Events (SSE) live event stream endpoint for real-time dashboard updates.
    """
    return StreamingResponse(event_generator(), media_type="text/event-stream")
