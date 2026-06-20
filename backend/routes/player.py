from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.api_service import fetch_player_info
from database.database import log_search, get_stats
import logging

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


def validate_uid(uid: str) -> bool:
    return uid.isdigit() and 8 <= len(uid) <= 12


@router.get("/{uid}")
@limiter.limit("30/minute")
async def get_player(uid: str, request: Request):
    uid = uid.strip()

    if not validate_uid(uid):
        raise HTTPException(
            status_code=400,
            detail="Invalid UID. Must be 8-12 digits."
        )

    try:
        data = await fetch_player_info(uid)

        if not data:
            await log_search(uid, success=False)
            raise HTTPException(status_code=404, detail="Player not found.")

        await log_search(uid, success=True)
        return {
            "success": True,
            "data": data,
            "developer": {
                "name": "Shuvo Ahmed",
                "telegram": "@shuvo_9882",
                "app": "FF Info",
                "version": "v1.0.0"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching player {uid}: {e}")
        await log_search(uid, success=False)
        raise HTTPException(status_code=500, detail="Failed to fetch player information.")


@router.get("/stats/overview")
async def get_overview_stats(request: Request):
    try:
        stats = await get_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Stats fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats.")