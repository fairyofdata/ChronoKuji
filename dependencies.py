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
    x_user_id: str = Header(..., description="LocalStorage에 저장된 유저 UUID"),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    헤더에서 UUID를 받아 유저를 식별하고, 토큰 리필(지연 평가)을 수행하는 의존성 함수
    """
    try:
        user_uuid = uuid.UUID(x_user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid UUID format")

    # DB에서 유저 조회
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # [Lazy Evaluation] 20시간 쿨타임 토큰 리필 로직
    now = datetime.now(timezone.utc)
    
    # DB에 저장된 시간이 timezone-aware인지 확인하여 계산
    last_refill = user.last_token_refill_at
    if last_refill.tzinfo is None:
        last_refill = last_refill.replace(tzinfo=timezone.utc)

    time_since_last_refill = now - last_refill

    if time_since_last_refill >= timedelta(hours=TOKEN_COOLDOWN_HOURS):
        # 토큰 리필 및 시간 갱신
        user.llm_tokens = 1
        user.last_token_refill_at = now
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
