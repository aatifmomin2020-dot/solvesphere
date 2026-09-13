import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class SimpleRateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.history = defaultdict(list)

    def check(self, request: Request, key_prefix: str = "global"):
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = f"{key_prefix}:{client_ip}"
        now = time.time()
        
        # Keep timestamps within the last 60 seconds
        timestamps = [t for t in self.history[key] if now - t < 60]
        self.history[key] = timestamps

        if len(timestamps) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({self.requests_per_minute} requests/minute). Please try again in a moment."
            )
        self.history[key].append(now)

login_limiter = SimpleRateLimiter(requests_per_minute=10)
challenge_limiter = SimpleRateLimiter(requests_per_minute=20)
ai_limiter = SimpleRateLimiter(requests_per_minute=30)
