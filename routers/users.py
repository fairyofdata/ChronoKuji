# routers/users.py
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from dependencies import get_current_user
from models import User

from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

class FirebaseAuthRequest(BaseModel):
    firebase_uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    guest_uuid: Optional[str] = None # 로그인 전 게스트 UUID가 있으면 기록 연동

@router.post("/auth", status_code=status.HTTP_200_OK)
async def guest_login(
    client_uuid: str | None = None, 
    db: AsyncSession = Depends(get_db)
):
    """
    프론트엔드 LocalStorage에 게스트 UUID가 있으면 해당 유저 반환, 없으면 신규 게스트 생성 후 반환.
    (게스트는 기본적으로 llm_tokens=0)
    """
    if client_uuid:
        try:
            user_uuid = uuid.UUID(client_uuid)
            result = await db.execute(select(User).where(User.id == user_uuid))
            user = result.scalars().first()
            if user:
                return {"message": "Existing guest logged in", "user_id": str(user.id), "is_guest": user.is_guest}
        except ValueError:
            pass

    # 신규 게스트 유저 생성
    new_user = User(
        id=uuid.uuid4(),
        is_guest=True,
        llm_tokens=0,
        last_token_refill_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "New guest user created", "user_id": str(new_user.id), "is_guest": True}

@router.post("/firebase-auth", status_code=status.HTTP_200_OK)
async def firebase_google_login(
    req: FirebaseAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Firebase Google 로그인 완료 후 유저 동기화.
    구글 계정 1개당 1개의 User 레코드 및 20시간 1회 무료 AI 풀이 토큰(llm_tokens=1) 보장.
    """
    # 1. 이미 존재하는 Firebase UID인지 확인
    result = await db.execute(select(User).where(User.firebase_uid == req.firebase_uid))
    user = result.scalars().first()

    if user:
        # 정보 갱신
        user.email = req.email or user.email
        user.display_name = req.display_name or user.display_name
        user.photo_url = req.photo_url or user.photo_url
        user.is_guest = False
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return {
            "message": "Existing Google user logged in",
            "user_id": str(user.id),
            "firebase_uid": user.firebase_uid,
            "is_guest": False
        }

    # 2. 만약 게스트 UUID가 전달되었고, 해당 게스트가 아직 Firebase UID가 없는 경우 업그레이드
    if req.guest_uuid:
        try:
            g_uuid = uuid.UUID(req.guest_uuid)
            res = await db.execute(select(User).where(User.id == g_uuid, User.firebase_uid == None))
            guest_user = res.scalars().first()
            if guest_user:
                guest_user.firebase_uid = req.firebase_uid
                guest_user.email = req.email
                guest_user.display_name = req.display_name
                guest_user.photo_url = req.photo_url
                guest_user.is_guest = False
                guest_user.llm_tokens = 1 # 회원가입 첫 보너스 토큰 지급
                guest_user.last_token_refill_at = datetime.now(timezone.utc)
                db.add(guest_user)
                await db.commit()
                await db.refresh(guest_user)
                return {
                    "message": "Guest account linked with Google",
                    "user_id": str(guest_user.id),
                    "firebase_uid": guest_user.firebase_uid,
                    "is_guest": False
                }
        except ValueError:
            pass

    # 3. 신규 Google 로그인 유저 생성
    new_user = User(
        id=uuid.uuid4(),
        firebase_uid=req.firebase_uid,
        email=req.email,
        display_name=req.display_name,
        photo_url=req.photo_url,
        is_guest=False,
        llm_tokens=1, # 최초 1회 무료 지급
        last_token_refill_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "New Google user registered",
        "user_id": str(new_user.id),
        "firebase_uid": new_user.firebase_uid,
        "is_guest": False
    }

@router.get("/me")
@router.get("/state")
async def get_user_state(
    current_user: User = Depends(get_current_user)
):
    """
    유저의 현재 상태(토큰, 이동 위치 등)를 반환.
    get_current_user 의존성을 통과하며 자동으로 토큰 지연 평가(리필)가 수행됨.
    """
    is_arrived = False
    now = datetime.now(timezone.utc)
    
    arrival_time_iso = None
    if current_user.target_spot_id is not None and current_user.arrival_time:
        arrival_time = current_user.arrival_time
        if arrival_time.tzinfo is None:
            arrival_time = arrival_time.replace(tzinfo=timezone.utc)
            
        if now >= arrival_time:
            is_arrived = True
        arrival_time_iso = arrival_time.isoformat()

    last_token_refill_iso = None
    if current_user.last_token_refill_at:
        refill_dt = current_user.last_token_refill_at
        if refill_dt.tzinfo is None:
            refill_dt = refill_dt.replace(tzinfo=timezone.utc)
        last_token_refill_iso = refill_dt.isoformat()

    return {
        "user_id": str(current_user.id),
        "firebase_uid": current_user.firebase_uid,
        "email": current_user.email,
        "display_name": current_user.display_name,
        "photo_url": current_user.photo_url,
        "is_guest": current_user.is_guest,
        "llm_tokens": current_user.llm_tokens,
        "last_token_refill_at": last_token_refill_iso,
        "current_spot_id": current_user.current_spot_id,
        "target_spot_id": current_user.target_spot_id,
        "is_arrived": is_arrived,
        "arrival_time": arrival_time_iso
    }
