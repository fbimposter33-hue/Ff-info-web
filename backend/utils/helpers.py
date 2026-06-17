from datetime import datetime
from typing import Any


def format_timestamp(ts: Any) -> str | None:
    if not ts:
        return None
    try:
        dt = datetime.utcfromtimestamp(int(ts))
        return dt.strftime("%B %d, %Y %H:%M UTC")
    except Exception:
        return str(ts)


def safe_get(data: dict, key: str, default=None):
    if not isinstance(data, dict):
        return default
    return data.get(key, default)
