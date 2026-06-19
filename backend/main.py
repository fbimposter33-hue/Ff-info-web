from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import time
import os

from routes.player import router as player_router
from database.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="FF Info API",
    description="Free Fire Account Information API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({duration}ms)")
    return response

@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("FF Info API started successfully")

app.include_router(player_router, prefix="/api/player", tags=["Player"])

@app.get("/")
async def root():
    return {"status": "online", "app": "FF Info API", "version": "1.0.0"}

@app.get("/api/status")
async def api_status():
    return {
        "status": "online",
        "version": "1.0.0",
        "uptime": "active"
    }
