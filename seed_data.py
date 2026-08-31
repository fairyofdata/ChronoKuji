import sys
import asyncio
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from database import AsyncSessionLocal
from models import Spot, OmikujiMaster, OmikujiHistory

async def seed_dummy_data():
    async with AsyncSessionLocal() as db:
        print("🧹 기존 데이터를 초기화합니다...")
        # 기존 데이터 삭제 (외래키 종속성을 고려해 History -> Master -> Spot 순으로 삭제)
        await db.execute(delete(OmikujiHistory))
        await db.execute(delete(OmikujiMaster))
        await db.execute(delete(Spot))
        await db.commit()

        print("🌱 확정된 10대 스팟(세계관) 및 점괘 더미 데이터 삽입을 시작합니다...")

        # 1. 10대 정예 스팟 메타데이터 정의
        spot_definitions = [
            {
                "name": "[Spot 01] 테일즈위버 — 크라이덴 평원",
                "lucky": "바람의 깃털",
                "bg_image": "/assets/worlds/spot_1_talesweaver.jpg",
                "item_image": "/assets/items/item_1_windfeather.jpg",
                "prompt": "끝없이 펼쳐진 초원을 걷는 여행자의 시선으로, 바람에 실린 자유와 기대감을 느끼며 유저의 고민에 답변해. 쉬어가도 괜찮다는 따뜻한 위로와 함께 다시 걸어갈 용기를 건네줘. 키워드: 초원의 바람, 끝없는 지평선, 여행자의 쉼터, 들꽃."
            },
            {
                "name": "[Spot 02] 포켓몬스터 — 물풍경시티 도개교 위",
                "lucky": "몬스터볼",
                "bg_image": "/assets/worlds/spot_2_pokemon.jpg",
                "item_image": "/assets/items/item_2_monsterball.jpg",
                "prompt": "활기찬 항구 시장의 에너지와 포켓몬들의 특성/행동을 빗대어 유저의 운세를 유쾌하게 분석해. 키워드: 도개교, 야생 포켓몬, 트레이너의 배틀."
            },
            {
                "name": "[Spot 03] 센과 치히로의 행방불명 — 아부라야 카운터",
                "lucky": "약탕패",
                "bg_image": "/assets/worlds/spot_3_bathhouse.jpg",
                "item_image": "/assets/items/item_3_bathtag.jpg",
                "prompt": "인간 세계를 벗어난 기묘한 온천장의 규칙과 영적인 분위기를 풍기며 답변해. 키워드: 신들과 요괴, 온천수, 붉은 제등, 가오나시."
            },
            {
                "name": "[Spot 04] 사이버펑크 2077 — 나이트 시티 골목",
                "lucky": "신경 가속기",
                "bg_image": "/assets/worlds/spot_4_cyberpunk.jpg",
                "item_image": "/assets/items/item_4_neuralchip.jpg",
                "prompt": "거칠고 세상만사 달관한 용병/넷러너의 어투로 현실적인 조언 제공. 디지털 연출 적극 사용. 키워드: 에디, 기업의 지배, 사이버웨어."
            },
            {
                "name": "[Spot 05] 심슨 가족 — 스프링필드 '모의 선술집'",
                "lucky": "더프 맥주",
                "bg_image": "/assets/worlds/spot_5_simpsons.jpg",
                "item_image": "/assets/items/item_5_beer.jpg",
                "prompt": "유저의 고민을 살짝 비꼬거나 어이없는 유머로 승화시키며, 맥주 한 잔 들이켜며 툭 던지는 듯한 황당한 톤으로 답변해. 키워드: 포춘 쿠키, 원자력 발전소."
            },
            {
                "name": "[Spot 06] 크레용 신짱 — 떡잎마을 놀이터",
                "lucky": "초코비",
                "bg_image": "/assets/worlds/spot_6_shinchan.jpg",
                "item_image": "/assets/items/item_6_chocobi.jpg",
                "prompt": "아이들의 때 묻지 않은 엉뚱한 시선이나 짱구 특유의 느긋함으로 유저의 고민을 무장해제 시켜줘. 키워드: 액션가면, 흰둥이 산책."
            },
            {
                "name": "[Spot 07] 장송의 프리렌 — 오이서스트 시험장",
                "lucky": "고대 마도서",
                "bg_image": "/assets/worlds/spot_7_frieren.jpg",
                "item_image": "/assets/items/item_7_grimoire.jpg",
                "prompt": "천 년을 살아온 엘프 마법사의 담담하고 사색적인 어조로 삶의 유한함과 소중함을 일깨워주며, 느긋하지만 깊이 있는 통찰을 전해줘. 키워드: 마법의 탐구, 인간이라는 종족의 아름다움, 꽃밭 마법."
            },
            {
                "name": "[Spot 08] 메이플스토리 — 리스항구",
                "lucky": "빨간 포션",
                "bg_image": "/assets/worlds/spot_8_maplestory.jpg",
                "item_image": "/assets/items/item_8_potion.jpg",
                "prompt": "풍차가 돌아가는 평화로운 항구 마을에서 처음 모험을 떠나는 초보 모험가에게 따스하고 설레는 격려를 건네는 톤으로 답변해. 키워드: 첫 번째 모험, 슬라임 사냥, 풍선 타고 빅토리아 아일랜드."
            },
            {
                "name": "[Spot 09] 라푼젤 — 코로나 왕국",
                "lucky": "마법의 프라이팬",
                "bg_image": "/assets/worlds/spot_9_rapunzel.jpg",
                "item_image": "/assets/items/item_9_fryingpan.jpg",
                "prompt": "밤하늘에 떠오르는 수천 개의 황금빛 풍등처럼 새로운 꿈과 용기를 북돋아 주는 따뜻하고 희망찬 디즈니풍 톤으로 답변해. 키워드: 풍등 축제, 탑 밖의 세상, 꿈을 향한 첫 발걸음."
            },
            {
                "name": "[Spot 10] 리그 오브 레전드 — 칼바람 나락",
                "lucky": "포로 간식",
                "bg_image": "/assets/worlds/spot_10_howlingabyss.jpg",
                "item_image": "/assets/items/item_10_porosnax.jpg",
                "prompt": "영원히 불어오는 눈보라와 얼어붙은 다리 위, 한 판 승부에 모든 걸 거는 전사의 호탕하고 통쾌한 어투로 답변해. 결과가 어떻든 '한 판 더!'를 외치는 긍정적 전투광 기질과, 추위 속에서도 포로에게 간식을 건네는 따뜻한 면을 보여줘. 키워드: 프렐요드의 얼음, 칼바람, 포로, 올인."
            },
            {
                "name": "[Spot 11] 해리 포터 — 호그와트 마법학교 그레이트 홀",
                "lucky": "골든 스니치",
                "bg_image": "/assets/worlds/spot_11_harrypotter.jpg",
                "item_image": "/assets/items/item_11_goldensnitch.jpg",
                "prompt": "공중에 떠 있는 수천 개의 촛불 아래, 덤블도어 교수님처럼 인자하고 깊은 통찰을 지닌 호그와트 마법사의 어조로 답변해. '행복은 가장 어두운 순간에도 찾을 수 있단다'라는 따스한 격려와 마법의 지혜를 전해줘. 키워드: 호그와트의 촛불, 골든 스니치, 마법의 지혜, 루모스(Lumos)."
            },
            {
                "name": "[Spot 12] (히든) 인터스텔라 — 5차원 테서렉트 (책장 뒤 시공간)",
                "lucky": "양자 중력 시계",
                "bg_image": "/assets/worlds/spot_12_tesseract.jpg",
                "item_image": "/assets/items/item_12_quantumwatch.jpg",
                "prompt": "시공간을 초월해 무한한 차원의 격자를 내려다보는 관조자이자 아버지만의 애절하고 숭고한 사랑의 어조로 답변해. '사랑은 시공간을 초월하는 유일한 것'이라는 거대한 우주적 진리와 함께, 중력파와 모스부호처럼 보이지 않는 곳에서 당신을 응원하는 필연적 행운의 메시지를 전해줘. 키워드: 5차원 테서렉트, 중력의 끈, 모스부호, 시공간을 초월한 사랑, STAY."
            }
        ]

        # DB에 스팟 객체 생성 및 저장
        created_spots = []
        for data in spot_definitions:
            spot = Spot(
                name=data["name"],
                theme_metadata={
                    "system_prompt": data["prompt"],
                    "bg_image": data["bg_image"],
                    "item_image": data["item_image"]
                }
            )
            db.add(spot)
            created_spots.append((spot, data["lucky"], data["item_image"]))

        await db.commit()

        # 2. 각 스팟별 정통 오미쿠지 마스터 데이터 일괄 생성 (7대 등급 & 5대 세부운)
        omikujis = []
        directions = ["동쪽", "서쪽", "남쪽", "북쪽", "남동쪽", "북동쪽", "남서쪽", "북서쪽"]

        for spot, lucky_item, item_image in created_spots:
            await db.refresh(spot)

            # 정통 오미쿠지 등급별 템플릿
            tier_templates = [
                {
                    "grade": "대길",
                    "poem": "바람이 구름을 걷어내고 밝은 달이 비추니, 만사가 순조롭고 뜻하는 바를 크게 이룬다.",
                    "text": f"{spot.name}의 가장 성스러운 축복이 깃들어 있습니다. 망설이지 말고 뜻한 바를 추진하십시오.",
                    "categories": {
                        "wish": "소원: 큰 뜻을 품고 나아가면 반드시 성취된다.",
                        "love": "인연: 마음이 통하는 귀인을 만나 기쁨이 넘친다.",
                        "wealth": "재물: 뜻밖의 결실과 금전적 여유가 찾아온다.",
                        "work": "사업/학업: 노력한 것 이상의 높은 평가를 받는다.",
                        "travel": "차원 이동: 어느 곳으로 워프해도 대길하다.",
                        "waiting": "기다림: 기다리던 기쁜 소식이 곧 도착한다."
                    }
                },
                {
                    "grade": "중길",
                    "poem": "흐르는 시냇물이 바다에 닿듯, 차분히 노력한 결실이 서서히 결실을 맺는다.",
                    "text": f"{spot.name}의 순조로운 기운이 감돕니다. 평소의 페이스를 유지하며 꾸준히 나아가세요.",
                    "categories": {
                        "wish": "소원: 서두르지 않으면 순조롭게 풀린다.",
                        "love": "인연: 서로 배려하면 좋은 결실을 맺는다.",
                        "wealth": "재물: 들어오는 만큼 알뜰히 관리하면 번창한다.",
                        "work": "사업/학업: 성실함이 최고의 무기가 된다.",
                        "travel": "차원 이동: 가까운 차원으로의 이동이 길하다.",
                        "waiting": "기다림: 조금 늦더라도 반드시 연락이 온다."
                    }
                },
                {
                    "grade": "소길",
                    "poem": "작은 불씨가 어둠을 밝히듯, 소소한 일상 속에 뜻밖의 행운이 숨어 있다.",
                    "text": f"{spot.name}에서 작은 위로와 기쁨이 찾아옵니다. 일상의 사소한 행복을 놓치지 마세요.",
                    "categories": {
                        "wish": "소원: 작은 바람부터 차근차근 이루어진다.",
                        "love": "인연: 담백한 대화 속에서 신뢰가 싹튼다.",
                        "wealth": "재물: 작은 횡재수가 있으니 기대를 걸어보라.",
                        "work": "사업/학업: 디테일을 챙기면 실수가 없다.",
                        "travel": "차원 이동: 휴식을 위한 워프에 좋은 날.",
                        "waiting": "기다림: 소식은 오나 다소 시간이 걸린다."
                    }
                },
                {
                    "grade": "길",
                    "poem": "잔잔한 호수에 이는 잔물결처럼, 큰 탈 없이 평온하고 안정된 하루가 이어진다.",
                    "text": f"{spot.name}의 평온한 안식이 당신을 지켜줍니다. 무리한 확장보다는 안정을 택하세요.",
                    "categories": {
                        "wish": "소원: 분수에 맞게 바라면 이루어진다.",
                        "love": "인연: 조용하고 진솔한 만남이 이어진다.",
                        "wealth": "재물: 지출을 줄이고 안정을 꾀할 때.",
                        "work": "사업/학업: 하던 일을 우직하게 밀고 나가라.",
                        "travel": "차원 이동: 무난하고 편안한 이동이 예상된다.",
                        "waiting": "기다림: 머지않아 안부 소식이 전해진다."
                    }
                },
                {
                    "grade": "말길",
                    "poem": "추운 겨울 끝에 매화가 피어나듯, 초반의 고난을 견디면 끝에 커다란 길운이 기다린다.",
                    "text": f"{spot.name}의 대기만성 기운입니다. 지금의 인내는 머지않아 커다란 보답으로 돌아옵니다.",
                    "categories": {
                        "wish": "소원: 늦게 이루어지니 조급해하지 말 것.",
                        "love": "인연: 오해가 풀리고 뒤늦게 진심이 닿는다.",
                        "wealth": "재물: 처음엔 빡빡하나 끝에 흑자로 돌아선다.",
                        "work": "사업/학업: 후반부 집중력이 성패를 가른다.",
                        "travel": "차원 이동: 일정 후반부에 귀인을 만난다.",
                        "waiting": "기다림: 잊고 지낼 무렵 반가운 소식이 온다."
                    }
                },
                {
                    "grade": "흉",
                    "poem": "안개 낀 밤길을 걷는 형국이니, 매사에 등불을 밝히듯 신중과 경계를 늦추지 말라.",
                    "text": f"{spot.name}의 그림자가 짙어집니다. 충동적인 결정이나 언행을 삼가고 자중하십시오.",
                    "categories": {
                        "wish": "소원: 지금은 때가 아니니 시기를 기다려라.",
                        "love": "인연: 감정적인 대립을 피하고 말을 아낄 것.",
                        "wealth": "재물: 뜻밖의 손실을 경계하고 지갑을 닫으라.",
                        "work": "사업/학업: 계약과 서류를 두 번 이상 검토하라.",
                        "travel": "차원 이동: 불필요한 이동을 자제하고 휴식하라.",
                        "waiting": "기다림: 당분간 소식이 닿지 않을 수 있다."
                    }
                },
                {
                    "grade": "대흉",
                    "poem": "칠흑 같은 어둠이 극에 달했으니, 이제 곧 새벽의 첫 빛이 터져 나올 준비를 한다.",
                    "text": f"{spot.name}의 혹독한 시련이 찾아왔으나, 바닥을 친 운은 이제 오직 위로 올라갈 일만 남았습니다.",
                    "categories": {
                        "wish": "소원: 판을 갈아엎고 새로운 전략을 세울 때.",
                        "love": "인연: 낡은 집착을 버려야 새 인연이 열린다.",
                        "wealth": "재물: 투자나 확장은 엄금, 방어에 집중하라.",
                        "work": "사업/학업: 위기를 정면 돌파하면 전화위복이 된다.",
                        "travel": "차원 이동: 조심스러운 발걸음으로 신중히 행동하라.",
                        "waiting": "기다림: 다른 차원으로부터 뜻밖의 반전 소식이 온다."
                    }
                }
            ]

            for idx, t in enumerate(tier_templates):
                omikujis.append(
                    OmikujiMaster(
                        spot_id=spot.id,
                        luck_level=t["grade"],
                        original_text=t["text"],
                        meta_info={
                            "poem": t["poem"],
                            "lucky_item": lucky_item if "길" in t["grade"] else "주의와 경계",
                            "item_image": item_image,
                            "lucky_direction": f"{directions[idx % len(directions)]} 차원의 바람",
                            "lucky_number": (idx * 13 + spot.id * 7) % 99 + 1,
                            "categories": t["categories"]
                        }
                    )
                )

        db.add_all(omikujis)
        await db.commit()
        
        print(f"🎉 11개 스팟 × 7대 정통 등급 = 총 {len(omikujis)}건의 정통 오미쿠지 마스터 데이터 생성 완료!")

if __name__ == "__main__":
    asyncio.run(seed_dummy_data())