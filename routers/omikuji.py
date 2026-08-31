import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from dependencies import get_current_user
from models import User, OmikujiMaster, OmikujiHistory

router = APIRouter(prefix="/api/v1/omikuji", tags=["Omikuji"])

@router.post("/draw", status_code=status.HTTP_200_OK)
async def draw_omikuji(
    spot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    도착한 스팟에서 오미쿠지(점괘)를 뽑습니다. (LLM 미사용, 캐싱된 마스터 데이터 랜덤 추출)
    """
    # 1. 유저가 해당 스팟에 도착해 있는지 검증
    if current_user.current_spot_id != spot_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="해당 스팟에 도착하지 않았거나 이동 중입니다."
        )
        
    # 2. 해당 스팟의 오미쿠지 마스터 데이터 조회
    result = await db.execute(select(OmikujiMaster).where(OmikujiMaster.spot_id == spot_id))
    omikuji_list = result.scalars().all()
    
    if not omikuji_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="이 스팟에는 아직 점괘 데이터가 없습니다."
        )
        
    # 3. 랜덤으로 점괘 하나 뽑기
    drawn_omikuji = random.choice(omikuji_list)
    
    # 4. 뽑기 기록(History) 저장 (이후 Phase 4에서 LLM 해석의 기반이 됨)
    history = OmikujiHistory(
        user_id=current_user.id,
        omikuji_id=drawn_omikuji.id
    )
    db.add(history)
    await db.commit()
    await db.refresh(history)
    
    return {
        "history_id": history.id,
        "spot_id": drawn_omikuji.spot_id,
        "luck_level": drawn_omikuji.luck_level,
        "original_text": drawn_omikuji.original_text,
        "meta_info": drawn_omikuji.meta_info
    }

@router.get("/history", status_code=status.HTTP_200_OK)
async def get_omikuji_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    유저가 과거에 뽑았던 모든 점괘와 AI 심층 해석 이력을 최신순으로 조회합니다.
    """
    result = await db.execute(
        select(OmikujiHistory)
        .where(OmikujiHistory.user_id == current_user.id)
        .order_by(OmikujiHistory.created_at.desc())
    )
    histories = result.scalars().all()
    
    response = []
    for h in histories:
        # 연관된 OmikujiMaster 데이터 조회
        master_res = await db.execute(select(OmikujiMaster).where(OmikujiMaster.id == h.omikuji_id))
        master = master_res.scalars().first()
        
        # 날짜 포맷
        created_str = h.created_at.strftime("%Y.%m.%d %H:%M") if h.created_at else "과거의 어느 날"
        
        response.append({
            "history_id": h.id,
            "drawn_at": created_str,
            "spot_id": master.spot_id if master else None,
            "luck_level": master.luck_level if master else "운명",
            "original_text": master.original_text if master else "",
            "meta_info": master.meta_info if master else {},
            "user_context": h.user_context,
            "llm_interpretation": h.llm_interpretation
        })
        
    return {"count": len(response), "histories": response}