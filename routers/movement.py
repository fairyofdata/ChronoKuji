from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from dependencies import get_current_user
from models import User, Spot

router = APIRouter(prefix="/api/v1/movement", tags=["Movement"])

# 기획 원안대로 이동 소요 시간을 60초(1분)로 원복합니다.
TRAVEL_TIME_SECONDS = 60

@router.post("/start", status_code=status.HTTP_200_OK)
async def start_movement(
    target_spot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    특정 스팟(세계관)으로 이동을 시작합니다.
    출발 시 current_spot_id는 None이 되고, target_spot_id와 arrival_time이 설정됩니다.
    """
    # 이미 이동 중인지 확인
    if current_user.target_spot_id and current_user.arrival_time:
        now = datetime.now(timezone.utc)
        arrival = current_user.arrival_time
        if arrival.tzinfo is None:
            arrival = arrival.replace(tzinfo=timezone.utc)
        if now < arrival:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Already moving to another spot."
            )

    # target_spot_id == 0: 차원의 균열(로비 성소)로 귀환
    if target_spot_id == 0:
        if current_user.current_spot_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 차원의 균열에 머물고 있습니다."
            )
        target_spot_name = "차원의 균열"
    else:
        # 목적지 스팟 존재 여부 확인
        result = await db.execute(select(Spot).where(Spot.id == target_spot_id))
        target_spot = result.scalars().first()
        if not target_spot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Target spot not found."
            )

        # 목적지가 현재 위치와 같은지 확인
        if current_user.current_spot_id == target_spot_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already at this spot."
            )
        target_spot_name = target_spot.name

    # 신규 게스트(첫 이동)는 5초 튜토리얼 초고속 워프, 2회차 이후 이동은 60초 적용
    is_first_warp = current_user.current_spot_id is None and current_user.target_spot_id is None
    travel_seconds = 5 if is_first_warp else TRAVEL_TIME_SECONDS

    # 이동 상태 업데이트
    now = datetime.now(timezone.utc)
    arrival_time = now + timedelta(seconds=travel_seconds)
    
    current_user.current_spot_id = None
    current_user.target_spot_id = target_spot_id if target_spot_id > 0 else 0
    current_user.arrival_time = arrival_time
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {
        "message": f"{target_spot_name}을(를) 향해 시공간 워프를 시작합니다.",
        "target_spot_id": target_spot_id,
        "arrival_time": arrival_time
    }

@router.post("/arrive", status_code=status.HTTP_200_OK)
async def confirm_arrival(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_admin_bypass: Optional[str] = Header(None)
):
    """
    도착 예정 시간이 지났다면, 이동을 완료 처리(current_spot_id 갱신)합니다.
    (users.py의 /me API에서 is_arrived를 확인한 프론트엔드가 이 API를 호출하여 도착을 확정 짓습니다)
    """
    if not current_user.target_spot_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not currently moving."
        )

    # 관리자(486)가 아닌 일반 유저일 경우에만 60초 타임록 검증
    if x_admin_bypass != "486":
        now = datetime.now(timezone.utc)
        arrival_time = current_user.arrival_time
        if arrival_time:
            if arrival_time.tzinfo is None:
                arrival_time = arrival_time.replace(tzinfo=timezone.utc)
            if now < arrival_time - timedelta(seconds=5):
                time_left = (arrival_time - now).total_seconds()
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"서버 시간 기준, 아직 {int(time_left)}초 더 기다려야 합니다.")

    # 도착 완료 처리 (target_spot_id가 0이면 차원의 균열 로비로 복귀하여 None 설정)
    arrived_spot_id = current_user.target_spot_id if current_user.target_spot_id > 0 else None
    current_user.current_spot_id = arrived_spot_id
    current_user.target_spot_id = None
    current_user.arrival_time = None

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "Successfully arrived.",
        "current_spot_id": arrived_spot_id
    }