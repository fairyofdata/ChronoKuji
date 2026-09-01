# dependencies.py
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import User # (앞서 정의한 SQLAlchemy User 모델)

# 기획 원안대로 20시간 쿨타임을 적용합니다.
TOKEN_COOLDOWN_HOURS = 20

async def get_current_user(
    x_user_id: str = Header(..., description="유저 UUID 또는 Firebase UID"),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    헤더에서 UUID나 Firebase UID를 받아 유저를 식별하고, 
    Google 로그인 회원의 경우 20시간 쿨타임 토큰 리필(지연 평가)을 수행하는 의존성 함수
    """
    user = None
    # 1. UUID 포맷인지 먼저 확인
    try:
        user_uuid = uuid.UUID(x_user_id)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalars().first()
    except ValueError:
        # UUID가 아니라면 Firebase UID로 조회
        result = await db.execute(select(User).where(User.firebase_uid == x_user_id))
        user = result.scalars().first()

    if not user:
        # Firebase UID로도 없을 경우 조회
        result = await db.execute(select(User).where(User.firebase_uid == x_user_id))
        user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 게스트는 토큰 자동 리필 대상이 아님 (토큰 0 유지)
    if user.is_guest:
        return user

    # [Lazy Evaluation] Google 로그인 회원 전용 20시간 쿨타임 토큰 리필 로직
    now = datetime.now(timezone.utc)
    last_refill = user.last_token_refill_at
    if last_refill.tzinfo is None:
        last_refill = last_refill.replace(tzinfo=timezone.utc)

    time_since_last_refill = now - last_refill

    if time_since_last_refill >= timedelta(hours=TOKEN_COOLDOWN_HOURS):
        user.llm_tokens = 1
        user.last_token_refill_at = now
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
