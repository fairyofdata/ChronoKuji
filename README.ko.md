# 🔮 ChronoKuji (크로노쿠지) — 멀티버스 시공간 확장형 AI 오미쿠지 & 도감 PWA

<div align="center">

**[ 🇺🇸 English ](README.md) • [ 🇰🇷 한국어 ](README.ko.md) • [ 🇯🇵 日本語 ](README.ja.md)**

---

![ChronoKuji Banner](frontend/public/assets/worlds/spot_11_harrypotter.jpg)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat-square&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat-square&logo=React&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat-square&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Gemini 2.5](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4.svg?style=flat-square&logo=Google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**"12개 세계관을 넘나드는 시공간 워프, 7대 정통 점괘, 그리고 LLM 심층 운명 해석"**

[주요 기능](#-주요-기능) • [12대 세계관](#-12대-멀티버스-세계관) • [시스템 아키텍처](#-시스템-아키텍처) • [로컬 실행 가이드](#-로컬-실행-가이드) • [면책 조항](#-면책-조항-disclaimer)

</div>

---

## 📖 프로젝트 소개 (Overview)

**ChronoKuji (크로노쿠지)**는 일본의 전통 신사 점괘(오미쿠지) 문화에 **12가지 서브컬처 멀티버스 세계관**과 **Google Gemini LLM 심층 상담 AI**, 그리고 **크로노 트리거풍의 아련한 시공간 여행 사운드스케이프**를 결합한 차세대 웹 애플리케이션(PWA)입니다.

사용자는 테일즈위버, 센과 치히로, 사이버펑크, 해리포터, 인터스텔라 등 시공간을 초월한 12개 세계관으로 직접 워프(Warp)하여 고유한 산통을 흔들고, 7대 정통 점괘와 5대 세부운(소원·연애·재물·사업·이동·기다림)을 점치며 차원 럭키 아이템을 수집합니다.

---

## ✨ 주요 기능 (Key Features)

### 1. 🥠 정통 오미쿠지 7대 등급 & 5대 세부운 (84건 마스터 DB)
- **7대 정통 등급**: `[ 大吉(대길) | 中吉(중길) | 小吉(소길) | 吉(길) | 末吉(말길) | 凶(흉) | 大凶(대흉) ]`
- **미니멀 5대 세부운**: 소원(願事), 인연(戀愛), 재물(金運), 사업(事業), 이동(旅行), 기다리는 사람(待人)
- **전통 디테일**: 점괘 상단 운세 시(詩), 행운의 방위 및 숫자, 점괘 묶기(結び) & 지갑 보관 인터랙션

### 2. 🌌 PC 대개방형 2-컬럼 시네마틱 인터페이스 & 🖼️ 감상 모드
- **선명한 캔버스**: 브라우저 전체 화면에 현재 세계관의 고화질 원본 풍경이 생생하게 펼쳐집니다.
- **초투명 플로팅 글래스**: 30% 투명도의 다크 글래스모피즘(`backdrop-blur-2xl`)으로 배경이 유기적으로 투과됩니다.
- **🖼️ 감상 모드 (Zen Mode)**: 원클릭으로 모든 UI를 숨기고 8K 일러스트와 BGM만 감상하는 시네마틱 힐링 뷰 제공.

### 3. 🌀 흉(凶) 반전 차원 왜곡 시네마틱 연출
- '흉'이 나왔을 때 태연하게 경고를 보여주다가, 하단 스크롤 시 **화면 전체에 보랏빛 차원 왜곡 글리치**가 폭발하며 *"어쩌면 다른 세계에서는 이 점괘가 대길일지도 모릅니다"*라는 메시지와 함께 **이세계의 구원 아이템이 소환**됩니다.

### 4. 🎼 하이브리드 동적 사운드스케이프 (`AudioEngine`)
- **3단계 사운드 라우팅**: 
  - 최초 로비: `Chrono Trigger — Wind Scene (600 A.D.)`
  - 차원 워프 중: `Chrono Trigger — Corridors of Time (12000 B.C.)`
  - 기록보관소: `메이플스토리 — 차원의 균열`
  - 스팟 도착: 각 세계관 고유 명곡 (`Hedwig's Theme`, `Second Run`, `Interstellar Theme` 등)
- **YouTube 백그라운드 스트리밍**: 로컬 MP3가 없어도 0px 투명 IFrame 플레이어가 실시간 스트리밍!
- **0바이트 Web Audio Synth 백업**: MP3 파일과 오프라인 상태에서도 핑크 노이즈 환경음을 합성하여 무음 방지.

### 5. 📜 차원 점괘 기록보관소 (Fate Archive)
- 상단 헤더의 **`📜 기록`** 버튼을 통해 과거에 뽑았던 모든 점괘와 유저의 고민, AI 심층 해석을 타임라인 카드로 언제든지 열람할 수 있습니다.

### 6. 📱 PWA 모바일 최적화 & 리텐션
- 전용 황금 쿠키 앱 아이콘 및 홈 화면 설치 배너 (설치 완료 시 **+1 보너스 토큰 충전**)
- 실시간 20시간 토큰 쿨다운 타이머 & 🔥 연속 출석 스트릭 뱃지
- 신규 방문자 5초 튜토리얼 초고속 워프 혜택

---

## 🗺️ 12대 멀티버스 세계관 (Multiverse Lineup)

| # | 세계관 (Spot) | 컨셉 & 풍경 | 산통 (Gacha Box) | 럭키 아이템 (Item) | BGM 트랙 |
|---|---|---|---|---|---|
| 🌿 **1** | **테일즈위버 (크라이덴 평원)** | 산들바람 초원 | 룬 문양 원목 산통 | 바람의 깃털 | `TalesWeaver - Second Run` |
| ⚡ **2** | **포켓몬스터 (물풍경시티)** | 네온 도개교 / 전기 | 하이테크 캡슐 실린더 | 몬스터볼 | `Pokémon B&W - Driftveil City` |
| 🏮 **3** | **센과 치히로 (아부라야)** | 붉은 온천장 / 신비 | 붉은 옻칠 약탕통 | 약탕패 | `Spirited Away - The Sixth Station` |
| 💾 **4** | **사이버펑크 (나이트 시티)** | 글리치 빌딩 / 네온 | 데이터 코어 실린더 | 신경 가속기 | `Edgerunners - Stay at Your House` |
| 🍺 **5** | **심슨 가족 (모의 선술집)** | 단골 펍 / 애니메이션 | 오크 더프 맥주통 | 더프 맥주 | `The Simpsons - Main Theme` |
| ⭐ **6** | **크레용 신짱 (떡잎마을)** | 저녁 놀이터 / 추억 | 육각 핑크 초코비 상자 | 초코비 | `Crayon Shin-chan - Nostalgia Piano` |
| ✨ **7** | **장송의 프리렌 (오이서스트)** | 마법 시험장 / 룬 | 은빛 마도 점성 실린더 | 고대 마도서 | `Frieren - Time Flows Ever Onward` |
| 🍁 **8** | **메이플스토리 (리스항구)** | 첫 모험 항구 | 나침반 모험가 상자 | 빨간 포션 | `MapleStory - Lith Harbor` |
| 👑 **9** | **라푼젤 (코로나 왕국)** | 황금 등불 축제 | 황금 태양 등불 산통 | 마법의 프라이팬 | `Tangled - I See the Light` *(대길: Kingdom Dance)* |
| ❄️ **10** | **칼바람 나락 (프렐요드)** | 혹한의 전장 / 얼음 | 영구동토 얼음 항아리 | 포로 간식 | `League of Legends - Freljord` |
| 🕯️ **11** | **해리 포터 (호그와트)** | 공중 촛불 그레이트 홀 | 기숙사 분류 모자 산통 | 골든 스니치 | `Harry Potter - Hedwig's Theme` |
| ⏳ **12** | **⭐ [히든] 인터스텔라 테서렉트** | 5차원 시공간 / 책장 뒤 | 5차원 큐브 중력 산통 | 양자 중력 시계 | `Hans Zimmer - Interstellar Theme` *(11종 완수 해금)* |

---

## 🏗️ 시스템 아키텍처 (System Architecture)

```
[ Frontend (React 19 + Vite 8 + Tailwind) ]
   │
   ├── MapSelector & Hero Panorama Stage (선명한 배경 + 2-컬럼 와이드 UI)
   ├── FortuneShakeModal (4회 햅틱/흔들기 산통 모달)
   ├── OmikujiView (7대 등급 + 5대 세부운 + 흉 반전 시네마틱)
   ├── HistoryModal (과거 점괘 & AI 해석 타임라인)
   ├── CodexModal (11종 차원 럭키 아이템 수집기)
   └── AudioEngine (싱글톤 BGM 라우팅 + Web Audio Synth)
   │
   ▼ HTTP / JSON
[ Backend (FastAPI + SQLAlchemy + SQLite) ]
   │
   ├── /api/v1/movement (60초 타임록 및 지연 평가 도착 검증)
   ├── /api/v1/omikuji (77+7건 정통 마스터 DB 및 이력 저장)
   ├── /api/v1/interpret (Google Gemini 2.5 Flash 기반 5대 세부운 융합 해석)
   └── /api/v1/users (UUID 게스트 인증 + 20시간 토큰 쿨다운 리필)
```

---

## 🚀 로컬 실행 가이드 (Quick Start)

### 1. 사전 요구사항
- **Python 3.10+**
- **Node.js 18+** & `npm`

### 2. 프로젝트 클론 및 환경 설정
```bash
git clone https://github.com/fairyofdata/ChronoKuji.git
cd ChronoKuji

# .env 파일 생성 및 Gemini API 키 등록
echo GEMINI_API_KEY=your_gemini_api_key_here > .env
```

### 3. 원클릭 실행 (`start.bat`)
Windows 환경에서는 루트의 **`start.bat`**을 더블클릭하시면 백엔드 가동, 프론트엔드 빌드, 브라우저 오픈이 자동으로 진행됩니다.

```bash
# 수동 실행 시:
# 백엔드
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python seed_data.py
uvicorn main:app --reload --port 8000

# 프론트엔드
cd frontend
npm install
npm run dev
```

---

## 🎵 배경음악(BGM) 추가 가이드 (Optional)

저작권 보호를 위해 상용 음원 파일(`.mp3`)은 저장소에 포함되어 있지 않으며, 기본 상태에서는 **Web Audio API 신디사이저 앰비언스**가 자동 재생됩니다.

원작 명곡을 듣고 싶으시다면, 개인 소장 MP3 파일을 아래 경로에 이름에 맞게 넣어주시면 즉시 고음질로 재생됩니다:

- `frontend/public/assets/audio/bgm/lobby_rift.mp3` (메이플스토리 차원의 균열)
- `frontend/public/assets/audio/bgm/traveling_time_path.mp3` (메이플스토리 시간의 길)
- `frontend/public/assets/audio/bgm/spot_1_kraiden.mp3` ~ `spot_12_tesseract.mp3`
- `frontend/public/assets/audio/bgm/extra/tangled_kingdom_dance.mp3`

---

## ⚖️ 면책 조항 (Disclaimer)

- 본 프로젝트는 **비영리 팬 메이드(Fan-made) 오픈소스 토이 프로젝트**입니다.
- 프로젝트 내에 등장하는 각 세계관(IP), 캐릭터 및 작품명의 모든 지적재산권과 상표권은 각 원저작권자에게 귀속됩니다.
- 본 저장소의 배경 및 아이템 일러스트는 Google AI를 통해 독자적으로 생성된 비영리 팬아트 에셋입니다.