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
    basic = safe_get(raw, "basic_info", {})
    profile = safe_get(raw, "profile_info", {})
    clan = safe_get(raw, "clan_basic_info", {})
    pet = safe_get(raw, "pet_info", {})
    social = safe_get(raw, "social_info", {})
    diamond = safe_get(raw, "diamond_cost_res", {})
    prime = safe_get(raw, "prime_info", {})
    external_icon = safe_get(raw, "external_icon_info", {})

    return {
        "basic_info": {
            "nickname": safe_get(basic, "nickname"),
            "uid": safe_get(basic, "uid"),
            "region": safe_get(basic, "region"),
            "account_type": safe_get(basic, "accountType"),
            "level": safe_get(basic, "level"),
            "exp": safe_get(basic, "exp"),
            "likes": safe_get(basic, "liked"),
            "rank": safe_get(basic, "rank"),
            "ranking_points": safe_get(basic, "rankingPoints"),
            "cs_rank": safe_get(basic, "csRank"),
            "max_rank": safe_get(basic, "maxRank"),
            "max_cs_rank": safe_get(basic, "maxCsRank"),
            "season_id": safe_get(basic, "seasonId"),
            "badge_id": safe_get(basic, "badgeId"),
            "banner_id": safe_get(basic, "bannerId"),
            "head_picture_id": safe_get(basic, "headPictureId"),
            "created_at": format_timestamp(safe_get(basic, "createAt")),
            "last_login": format_timestamp(safe_get(basic, "lastLoginAt")),
            "hide_info": safe_get(basic, "socialHighlightInfo"),
        },
        "profile_info": {
            "avatar_id": safe_get(profile, "avatarId"),
            "skin_color": safe_get(profile, "skinColor"),
            "equipped_clothes": safe_get(profile, "equippedClothes", []),
            "equipped_skills": safe_get(profile, "equippedSkills", []),
            "character_selected": safe_get(profile, "characterSelected"),
            "awakening_status": safe_get(profile, "awakeningStatus"),
        },
        "clan_info": {
            "name": safe_get(clan, "clanName"),
            "id": safe_get(clan, "clanId"),
            "level": safe_get(clan, "clanLevel"),
            "members": safe_get(clan, "memberNum"),
        },
        "pet_info": {
            "id": safe_get(pet, "id"),
            "level": safe_get(pet, "level"),
            "exp": safe_get(pet, "exp"),
            "selected": safe_get(pet, "isSelected"),
            "skin_id": safe_get(pet, "skinId"),
            "skill_id": safe_get(pet, "selectedSkillId"),
        },
        "social_info": {
            "language": safe_get(social, "language"),
            "signature": safe_get(social, "signature"),
            "rank_show_mode": safe_get(social, "rankShowMode"),
        },
        "diamond_info": {
            "diamond_cost": safe_get(diamond, "diamondCost"),
        },
        "prime_info": {
            "status": safe_get(prime, "status"),
        },
        "external_icon": {
            "status": safe_get(external_icon, "status"),
            "show_type": safe_get(external_icon, "showType"),
        },
    }
