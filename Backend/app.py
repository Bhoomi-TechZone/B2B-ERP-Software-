from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from Database import init_db, close_db
from Routes import api_router
from Utility.rate_limiter import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="B2B Backend API",
    description="Pricing Plans & Registration Management API with MongoDB",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate limiter setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS Configuration
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5679,http://localhost:5173,http://localhost:3000").split(",")
allowed_origins = [o.strip() for o in raw_origins if o.strip() and o.strip() != "*"]
if not allowed_origins:
    allowed_origins = ["http://localhost:5679", "http://localhost:5173", "http://localhost:3000"]

from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.btplsoft\.com)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
async def startup_event():
    """Initialize database and platform settings on startup"""
    await init_db()
    print("MongoDB initialized successfully!")
    try:
        from Services.platform_settings_service import PlatformSettingsService
        settings = await PlatformSettingsService.get_settings()
        print(f"Platform settings initialized successfully (host={settings.smtp_host})")
    except Exception as e:
        print(f"Failed to initialize platform settings on startup: {e}")


# Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    await close_db()
    print("MongoDB connections closed!")


# Include Routers
app.include_router(api_router)

from fastapi.staticfiles import StaticFiles
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Headers"] = "*"
        headers["Access-Control-Allow-Methods"] = "*"

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc)
        },
        headers=headers
    )


# Root Endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - Health check"""
    return {
        "message": "B2B Backend API is running!",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "B2B Backend API"
    }