# routers/users.py
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from dependencies import get_current_user
from models import User

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.post("/auth", status_code=status.HTTP_200_OK)
async def guest_login(
    client_uuid: str | None = None, 
    db: AsyncSession = Depends(get_db)
):
    """
    프론트엔드 LocalStorage에 UUID가 있으면 해당 유저 반환, 없으면 신규 생성 후 반환.
    """
    user_uuid = None
    if client_uuid:
        try:
            user_uuid = uuid.UUID(client_uuid)
            result = await db.execute(select(User).where(User.id == user_uuid))
            user = result.scalars().first()
            if user:
                return {"message": "Existing user logged in", "user_id": user.id}
        except ValueError:
            pass # 잘못된 UUID면 무시하고 새로 생성

    # 신규 유저 생성
    new_user = User(
        id=uuid.uuid4(),
        llm_tokens=1,
        last_token_refill_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "New guest user created", "user_id": new_user.id}

@router.get("/me")
async def get_user_state(
    current_user: User = Depends(get_current_user)
):
    """
    유저의 현재 상태(토큰, 이동 위치 등)를 반환.
    get_current_user 의존성을 통과하며 자동으로 토큰 지연 평가(리필)가 수행됨.
    """
    # 이동 완료 여부 (ARRIVED) 계산 로직
    is_arrived = False
    now = datetime.now(timezone.utc)
    
    if current_user.target_spot_id and current_user.arrival_time:
        arrival_time = current_user.arrival_time
        if arrival_time.tzinfo is None:
            arrival_time = arrival_time.replace(tzinfo=timezone.utc)
            
        if now >= arrival_time:
            is_arrived = True

    return {
        "user_id": current_user.id,
        "llm_tokens": current_user.llm_tokens,
        "last_token_refill_at": current_user.last_token_refill_at,
        "current_spot_id": current_user.current_spot_id,
        "target_spot_id": current_user.target_spot_id,
        "is_arrived": is_arrived,
        "arrival_time": current_user.arrival_time
    }
