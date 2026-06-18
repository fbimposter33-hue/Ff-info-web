from pydantic import BaseModel
from typing import Optional, List, Any


class BasicInfo(BaseModel):
    nickname: Optional[str] = None
    uid: Optional[str] = None
    region: Optional[str] = None
    account_type: Optional[int] = None
    level: Optional[int] = None
    exp: Optional[int] = None
    likes: Optional[int] = None
    rank: Optional[int] = None
    ranking_points: Optional[int] = None
    cs_rank: Optional[int] = None
    max_rank: Optional[int] = None
    max_cs_rank: Optional[int] = None
    season_id: Optional[int] = None
    badge_id: Optional[int] = None
    banner_id: Optional[int] = None
    head_picture_id: Optional[int] = None
    created_at: Optional[str] = None
    last_login: Optional[str] = None
    hide_info: Optional[Any] = None


class ProfileInfo(BaseModel):
    avatar_id: Optional[int] = None
    skin_color: Optional[int] = None
    equipped_clothes: Optional[List[Any]] = []
    equipped_skills: Optional[List[Any]] = []
    character_selected: Optional[int] = None
    awakening_status: Optional[int] = None


class ClanInfo(BaseModel):
    name: Optional[str] = None
    id: Optional[str] = None
    level: Optional[int] = None
    members: Optional[int] = None


class PetInfo(BaseModel):
    id: Optional[int] = None
    level: Optional[int] = None
    exp: Optional[int] = None
    selected: Optional[bool] = None
    skin_id: Optional[int] = None
    skill_id: Optional[int] = None


class SocialInfo(BaseModel):
    language: Optional[int] = None
    signature: Optional[str] = None
    rank_show_mode: Optional[int] = None


class DiamondInfo(BaseModel):
    diamond_cost: Optional[int] = None


class PrimeInfo(BaseModel):
    status: Optional[int] = None


class ExternalIconInfo(BaseModel):
    status: Optional[int] = None
    show_type: Optional[int] = None


class PlayerResponse(BaseModel):
    basic_info: Optional[BasicInfo] = None
    profile_info: Optional[ProfileInfo] = None
    clan_info: Optional[ClanInfo] = None
    pet_info: Optional[PetInfo] = None
    social_info: Optional[SocialInfo] = None
    diamond_info: Optional[DiamondInfo] = None
    prime_info: Optional[PrimeInfo] = None
    external_icon: Optional[ExternalIconInfo] = None
