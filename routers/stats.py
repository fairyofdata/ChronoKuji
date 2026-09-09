# routers/stats.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from database import get_db
from models import OmikujiHistory, OmikujiMaster, Spot, User

router = APIRouter(prefix="/api/v1/stats", tags=["Multiverse Observatory Stats"])

@router.get("/summary", status_code=status.HTTP_200_OK)
async def get_observatory_stats(db: AsyncSession = Depends(get_db)):
    """
    차원 관측소 종합 통계 파이프라인:
    1. 총 점괘 추첨 수 및 총 시공간 여행자 수
    2. 7대 정통 운세 등급별 실제 관측 빈도 및 백분율(%)
    3. 12대 멀티버스 스팟별 탐험 인기도
    4. AI 심층 해석 요청 수 및 사용자 만족도(RLHF 긍정 피드백 비율)
    """
    # 1. 총 여행자 수
    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    # 2. 총 점괘 추첨 수
    total_history_res = await db.execute(select(func.count(OmikujiHistory.id)))
    total_fortunes = total_history_res.scalar() or 0

    # 3. 7대 운세 등급별 빈도 집계
    luck_query = (
        select(OmikujiMaster.luck_level, func.count(OmikujiHistory.id))
        .join(OmikujiHistory, OmikujiHistory.omikuji_id == OmikujiMaster.id)
        .group_by(OmikujiMaster.luck_level)
    )
    luck_res = await db.execute(luck_query)
    luck_counts = dict(luck_res.all())

    standard_levels = ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"]
    luck_distribution = []
    for level in standard_levels:
        count = luck_counts.get(level, 0)
        percentage = round((count / total_fortunes * 100), 1) if total_fortunes > 0 else 0.0
        luck_distribution.append({
            "level": level,
            "count": count,
            "percentage": percentage
        })

    # 4. 12대 스팟별 탐험 빈도 집계
    spot_query = (
        select(Spot.id, Spot.name, func.count(OmikujiHistory.id))
        .join(OmikujiMaster, OmikujiMaster.spot_id == Spot.id)
        .join(OmikujiHistory, OmikujiHistory.omikuji_id == OmikujiMaster.id)
        .group_by(Spot.id, Spot.name)
        .order_by(func.count(OmikujiHistory.id).desc())
    )
    spot_res = await db.execute(spot_query)
    spot_distribution = [
        {"spot_id": sid, "name": sname, "visits": cnt}
        for sid, sname, cnt in spot_res.all()
    ]

    # 5. AI 심층 풀이 및 피드백 지표 집계 (LLM Ops Metrics)
    ai_history_res = await db.execute(
        select(func.count(OmikujiHistory.id)).where(OmikujiHistory.llm_interpretation.isnot(None))
    )
    total_ai_interpretations = ai_history_res.scalar() or 0

    positive_feedback_res = await db.execute(
        select(func.count(OmikujiHistory.id)).where(OmikujiHistory.feedback_rating == 1)
    )
    positive_feedback = positive_feedback_res.scalar() or 0

    negative_feedback_res = await db.execute(
        select(func.count(OmikujiHistory.id)).where(OmikujiHistory.feedback_rating == -1)
    )
    negative_feedback = negative_feedback_res.scalar() or 0

    total_feedbacks = positive_feedback + negative_feedback
    satisfaction_rate = round((positive_feedback / total_feedbacks * 100), 1) if total_feedbacks > 0 else 100.0

    return {
        "status": "success",
        "observatory": {
            "total_travelers": total_users,
            "total_fortunes_drawn": total_fortunes,
            "total_ai_interpretations": total_ai_interpretations,
            "feedback": {
                "total_rated": total_feedbacks,
                "positive": positive_feedback,
                "negative": negative_feedback,
                "satisfaction_rate": satisfaction_rate
            },
            "luck_distribution": luck_distribution,
            "spot_distribution": spot_distribution
        }
    }
