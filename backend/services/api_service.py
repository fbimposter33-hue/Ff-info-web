import httpx
import logging
from utils.helpers import format_timestamp, safe_get

logger = logging.getLogger(__name__)

BASE_URL = "https://star-info-api.lovable.app/functions/v1/info-api/accinfo"
TIMEOUT = 15.0


async def fetch_player_info(uid: str) -> dict | None:
    url = f"{BASE_URL}?uid={uid}"

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            raw = response.json()
        except httpx.HTTPStatusError as e:
            logger.warning(f"API returned {e.response.status_code} for UID {uid}")
            return None
        except httpx.RequestError as e:
            logger.error(f"Request failed for UID {uid}: {e}")
            return None

    return format_player_data(raw)


def format_player_data(raw: dict) -> dict:
    basic        = safe_get(raw, "basic_info", {})
    profile      = safe_get(raw, "profile_info", {})
    clan         = safe_get(raw, "clan_basic_info", {})
    pet          = safe_get(raw, "pet_info", {})
    social       = safe_get(raw, "social_info", {})
    diamond      = safe_get(raw, "diamond_cost_res", {})
    credit       = safe_get(raw, "credit_score_info", {})
    captain      = safe_get(raw, "captain_basic_info", {})

    # external_icon is nested inside basic_info
    external_icon = safe_get(basic, "external_icon_info", {})
    prime         = safe_get(basic, "prime_info", {})

    return {
        "basic_info": {
            "nickname":       safe_get(basic, "nickname"),
            "uid":            safe_get(basic, "account_id"),
            "region":         safe_get(basic, "region"),
            "account_type":   safe_get(basic, "account_type"),
            "level":          safe_get(basic, "level"),
            "exp":            safe_get(basic, "exp"),
            "likes":          safe_get(basic, "liked"),
            "rank":           safe_get(basic, "rank"),
            "ranking_points": safe_get(basic, "ranking_points"),
            "cs_rank":        safe_get(basic, "cs_rank"),
            "cs_ranking_points": safe_get(basic, "cs_ranking_points"),
            "max_rank":       safe_get(basic, "max_rank"),
            "max_cs_rank":    safe_get(basic, "cs_max_rank"),
            "season_id":      safe_get(basic, "season_id"),
            "badge_id":       safe_get(basic, "badge_id"),
            "badge_count":    safe_get(basic, "badge_cnt"),
            "banner_id":      safe_get(basic, "banner_id"),
            "head_picture_id": safe_get(basic, "head_pic"),
            "release_version": safe_get(basic, "release_version"),
            "last_login":     format_timestamp(safe_get(basic, "last_login_at")),
            "hide_info":      safe_get(safe_get(basic, "account_prefers", {}), "hide_personal_info"),
        },
        "profile_info": {
            "avatar_id":        safe_get(profile, "avatar_id"),
            "skin_color":       safe_get(profile, "skin_color"),
            "equipped_clothes": safe_get(profile, "clothes", []),
            "equipped_skills":  safe_get(profile, "equiped_skills", []),
            "is_selected":      safe_get(profile, "is_selected"),
            "is_awaken":        safe_get(profile, "is_selected_awaken"),
        },
        "clan_info": {
            "name":    safe_get(clan, "clan_name"),
            "id":      safe_get(clan, "clan_id"),
            "level":   safe_get(clan, "clan_level"),
            "members": safe_get(clan, "member_num"),
            "capacity": safe_get(clan, "capacity"),
        },
        "captain_info": {
            "nickname":       safe_get(captain, "nickname"),
            "uid":            safe_get(captain, "account_id"),
            "level":          safe_get(captain, "level"),
            "rank":           safe_get(captain, "rank"),
            "ranking_points": safe_get(captain, "ranking_points"),
            "likes":          safe_get(captain, "liked"),
        },
        "pet_info": {
            "id":       safe_get(pet, "id"),
            "level":    safe_get(pet, "level"),
            "exp":      safe_get(pet, "exp"),
            "selected": safe_get(pet, "is_selected"),
            "skin_id":  safe_get(pet, "skin_id"),
            "skill_id": safe_get(pet, "selected_skill_id"),
        },
        "social_info": {
            "language":       safe_get(social, "language"),
            "signature":      safe_get(social, "signature"),
            "gender":         safe_get(social, "gender"),
            "rank_show_mode": safe_get(social, "rank_show"),
        },
        "diamond_info": {
            "diamond_cost": safe_get(diamond, "diamond_cost"),
        },
        "credit_info": {
            "credit_score":  safe_get(credit, "credit_score"),
            "reward_state":  safe_get(credit, "reward_state"),
        },
        "prime_info": {
            "prime_level": safe_get(prime, "prime_level"),
        },
        "external_icon": {
            "status":    safe_get(external_icon, "status"),
            "show_type": safe_get(external_icon, "show_type"),
        },
    }