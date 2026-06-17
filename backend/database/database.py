import aiosqlite
import logging
from datetime import datetime

DB_PATH = "ff_info.db"
logger = logging.getLogger(__name__)


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT NOT NULL,
                success INTEGER NOT NULL DEFAULT 1,
                searched_at TEXT NOT NULL
            )
        """)
        await db.commit()
    logger.info("Database initialized.")


async def log_search(uid: str, success: bool):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO searches (uid, success, searched_at) VALUES (?, ?, ?)",
                (uid, int(success), datetime.utcnow().isoformat())
            )
            await db.commit()
    except Exception as e:
        logger.error(f"DB log error: {e}")


async def get_stats() -> dict:
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute("SELECT COUNT(*) FROM searches") as cur:
                total = (await cur.fetchone())[0]

            async with db.execute("SELECT COUNT(*) FROM searches WHERE success=1") as cur:
                successful = (await cur.fetchone())[0]

            today = datetime.utcnow().date().isoformat()
            async with db.execute(
                "SELECT COUNT(*) FROM searches WHERE searched_at LIKE ?", (f"{today}%",)
            ) as cur:
                today_count = (await cur.fetchone())[0]

        return {
            "total_searches": total,
            "successful_searches": successful,
            "failed_searches": total - successful,
            "today_searches": today_count,
        }
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return {}
