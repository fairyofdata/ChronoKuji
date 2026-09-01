import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from openai import AsyncOpenAI
from dotenv import load_dotenv

from database import get_db
from dependencies import get_current_user
from models import User, OmikujiHistory, Spot, OmikujiMaster

# .env 파일 로드
load_dotenv()

router = APIRouter(prefix="/api/v1/interpret", tags=["Interpretation"])

# OpenAI 비동기 클라이언트 생성
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------------------------------------
# Pydantic Schema: LLM의 출력을 정통 오미쿠지 세부 구조로 강제합니다.
# ---------------------------------------------------------
class CategoryFortune(BaseModel):
    wish: str = Field(description="소원(願事)에 대한 세계관풍 한 줄 풀이 (예: 서두르지 않으면 순조롭게 성취)")
    love: str = Field(description="연애/인연(戀愛)에 대한 한 줄 풀이")
    wealth: str = Field(description="재물/금전(金運)에 대한 한 줄 풀이")
    work: str = Field(description="학업/사업(事業)에 대한 한 줄 풀이")
    travel: str = Field(description="차원 이동/여행(旅行)에 대한 한 줄 풀이")
    waiting: str = Field(description="기다리는 소식/사람(待人)에 대한 한 줄 풀이")

class LLMInterpretationOutput(BaseModel):
    spot_id: str = Field(description="해당 스팟의 식별자 (예: spot_01)")
    fortune_grade: str = Field(description="점괘 등급 (대길/중길/소길/길/말길/흉/대흉 중 하나)")
    world_concept_title: str = Field(description="해당 세계관 스타일로 변형된 점괘 제목 (예: 아캄 수용소 정신감정서)")
    poem: Optional[str] = Field(None, description="2~4구의 시적 차원 전승 격언 또는 운세 시(詩)")
    interpretation: str = Field(description="유저의 고민을 깊이 있게 다독이는 3~4문장 심층 해석 원문")
    categories: CategoryFortune = Field(description="5대 분야별 세부운")
    lucky_direction: str = Field(description="행운의 방위 (예: 남동쪽 차원의 지평선)")
    lucky_number: int = Field(description="행운의 숫자 (1~99)")
    lucky_item: str = Field(description="해당 세계관에 존재하는 고유 오브젝트")
    world_bgm_action: str = Field(description="프론트엔드 연출용 텍스트 (예: 나르비크의 밤바다 파도 소리가 잔잔히 들려옵니다)")

class InterpretRequest(BaseModel):
    user_context: str = Field(..., max_length=500, description="유저의 현재 고민이나 상황")

@router.post("/{history_id}", status_code=status.HTTP_200_OK)
async def interpret_omikuji(
    history_id: str,
    req: InterpretRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_admin_bypass: Optional[str] = Header(None)
):
    """유저의 고민을 입력받아 LLM 심층 해석을 진행하고, 토큰을 1개 소모합니다."""
    
    # 1. 유저 인증 상태 검증 (게스트는 AI 해석 불가)
    if current_user.is_guest and x_admin_bypass != "486":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI 심층 풀이는 구글 로그인 후 이용하실 수 있습니다. (20시간마다 1회 무료)"
        )

    # 2. 유저 토큰 검증 (관리자는 토큰 제한 무시)
    if current_user.llm_tokens < 1 and x_admin_bypass != "486":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="오늘의 AI 심층 풀이 토큰을 모두 소모하였습니다. (20시간마다 1개 자동 충전)"
        )

    try:
        history_uuid = uuid.UUID(history_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="잘못된 History ID 형식입니다.")

    # 2. History 및 연관된 점괘/스팟 데이터 조회
    result = await db.execute(select(OmikujiHistory).where(OmikujiHistory.id == history_uuid, OmikujiHistory.user_id == current_user.id))
    history = result.scalars().first()
    
    if not history:
        raise HTTPException(status_code=404, detail="해당 점괘 기록을 찾을 수 없습니다.")
        
    master = await db.get(OmikujiMaster, history.omikuji_id)
    spot = await db.get(Spot, master.spot_id)

    # 3. LLM 프롬프트 조립 (오미쿠지 정통 세부 항목과 유저 고민을 유기적으로 융합)
    system_prompt = spot.theme_metadata.get("system_prompt", "너는 유저의 운세를 재미있게 풀이해주는 점술가야.")
    system_prompt += "\n추가 지침: 너는 정통 오미쿠지의 5대 세부 항목(소원, 연애, 재물, 사업/학업, 차원이동, 기다리는 소식)과 행운의 방위/숫자도 너의 고유 세계관 어조에 완벽히 동화시켜 작성해야 한다. 유저의 고민이 있다면 해당 세부 항목 풀이에도 고민의 맥락을 섬세하게 녹여내라."

    categories_ctx = master.meta_info.get("categories", {}) if master.meta_info else {}
    user_prompt = f"""[원문 점괘 등급]: {master.luck_level}
[차원 원문]: {master.original_text}
[기본 세부운]: {categories_ctx}
[유저의 현재 고민/상황]: {req.user_context}

위 점괘와 유저의 고민을 바탕으로, 너의 세계관 페르소나로 심층 해석과 5대 세부운(wish, love, wealth, work, travel, waiting), 행운의 방위/숫자를 종합 풀이해줘."""

    # 4. OpenAI API 호출 (구조화된 출력 강제)
    try:
        completion = await client.beta.chat.completions.parse(
            model="gpt-4o-mini", # 비용 최적화를 위해 빠르고 저렴한 4o-mini 사용
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=LLMInterpretationOutput,
        )
        parsed_response = completion.choices[0].message.parsed
        
        # 5. 해석 결과 저장 및 토큰 차감 (관리자는 차감 안 함) 후 DB 커밋
        history.user_context = req.user_context
        history.llm_interpretation = parsed_response.model_dump()
        
        if x_admin_bypass != "486":
            current_user.llm_tokens -= 1
        
        db.add_all([history, current_user])
        await db.commit()
        
        return parsed_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM 처리 중 오류 발생: {str(e)}")