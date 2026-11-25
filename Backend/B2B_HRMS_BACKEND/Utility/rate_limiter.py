from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],  # Default limit for all routes
    strategy="fixed-window"
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded errors"""
    logger.warning(f"Rate limit exceeded for {request.client.host} on {request.url.path}")
    origin = request.headers.get("origin")
    headers = {"Retry-After": "60"}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Headers"] = "*"
        headers["Access-Control-Allow-Methods"] = "*"

    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate Limit Exceeded",
            "detail": "Too many attempts (maximum 100 per hour). Please wait a while before trying again.",
            "retry_after": "See Retry-After header"
        },
        headers=headers
    )
