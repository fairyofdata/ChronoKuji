import { Language, Translations } from './types';

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    header: {
      codex: 'Codex',
      history: 'History',
      stats: 'Stats',
      soundOn: 'Sound ON',
      soundOff: 'Sound OFF',
      streak: 'Streak',
      login: 'Google Sign In',
      loggingIn: 'Signing in...',
      logout: 'Sign Out',
      tokens: 'AI Tokens',
      zenMode: 'Zen Mode',
      adminMode: 'Admin',
      restrictedTitle: 'Access Restricted',
      restrictedMsg: 'This feature is only accessible from the Spacetime Sanctuary (Dimensional Rift).',
      returnSanctuary: 'Return to Sanctuary'
    },
    map: {
      selectWorld: 'Select Spacetime World',
      subTitle: 'Warp through 12 multiverse destinations and draw your destiny',
      warpButton: 'Warp to World (60s)',
      lockedHidden: 'Locked (Collect all 11 Codex items to unlock)',
      luckyItemLabel: 'Lucky Item',
      bgmLabel: 'Theme BGM',
      sanctuaryHub: 'Dimensional Rift Sanctuary',
      sanctuaryDesc: 'The central nexus of spacetime. Access past fortune logs and the Codex here.',
      sanctuaryButton: 'Return to Rift Sanctuary'
    },
    movement: {
      travelingTitle: 'Spacetime Warp in Progress',
      destination: 'Destination',
      statusPhases: {
        phase1: 'Phase 1: Traversing dimensional event horizon',
        phase2: 'Phase 2: Synching temporal frequency resonance',
        phase3: 'Phase 3: Materializing world coordinates',
        phase4: 'Phase 4: Final atmospheric entry & landing'
      },
      brakeButton: '⚡ Regenerative Brake (-3s)',
      brakeDesc: 'Tap canvas or button to absorb dimensional friction waves into counter-phase coils',
      tapPrompt: 'Tap canvas anywhere to accelerate arrival!',
      earlyArrival: 'Arrival confirmed! Entering dimension...',
      adminSkip: '⚡ Admin Instant Arrival',
      calibrationLog: [
        'Calibrating tachyon magnetic coils...',
        'Compensating relativistic time dilation...',
        'Synchronizing multiverse quantum phase...',
        'Stabilizing spacetime rift coordinates...',
        'Absorbing kinetic friction into capacitor...'
      ]
    },
    omikuji: {
      shrineTitle: 'Spacetime Shrine Omikuji',
      drawFortune: 'Draw Sacred Fortune',
      shakePrompt: 'Shake the sacred cylinder to reveal your destiny',
      tapToShake: 'Tap to Shake (4 times)',
      luckyItem: 'Lucky Item',
      poeticVerse: '✦ Spacetime Poetic Verse ✦',
      overallFortune: '📜 Universal Fortune',
      categories: {
        wish: '願事 (Wish)',
        love: '戀愛 (Love)',
        wealth: '金運 (Wealth)',
        work: '事業 (Work / Study)',
        travel: '旅行 (Travel)',
        waiting: '待人 (Awaited News)'
      },
      luckyDirection: 'Lucky Direction',
      luckyNumber: 'Lucky Number',
      downloadCard: 'Save Amulet Card',
      generatingCard: 'Creating Card...',
      copyText: 'Copy Fortune',
      copiedToast: 'Fortune text copied to clipboard!',
      tieFortune: 'Tie to Shrine Ward (結び)',
      tyingFortune: 'Tying to dimensional barrier...',
      tiedComplete: 'Tied to Dimensional Ward',
      tiedToast: 'Misfortune bound! May a new auspicious timeline open for you.',
      aiTitle: 'AI Deep Spacetime Counsel',
      samplePrompt: 'View Sample Questions',
      sampleClose: 'Close Sample',
      guestWelcomeBonus: '🎁 Welcome Traveler Pass: Enjoy 1 free AI counsel without sign-in!',
      guestTokensExhausted: 'Guest (Tokens Exhausted)',
      remainingTokens: 'Tokens Remaining',
      placeholderInput: 'Share your current worry or life question (e.g. Preparing for a new career exam, how will things unfold?)',
      askAiButton: 'Ask World Persona (Consumes 1 Token)',
      interpretingButton: 'Consulting World Persona...',
      feedbackQuestion: 'Was this counsel helpful to your journey?',
      feedbackHelpful: 'Helpful',
      feedbackNeedsWork: 'Needs Work',
      feedbackHelpfulToast: 'Thank you! Logged for AI quality improvement and prompt tuning.',
      feedbackNeedsWorkToast: 'Thank you for your feedback. We will refine the causal persona prompts.'
    },
    codex: {
      title: 'Multiverse Lucky Item Codex',
      subtitle: 'Collect legendary artifacts across 11 multiverse worlds to unlock the 12th hidden realm',
      progress: 'Artifacts Collected',
      completedBadge: '⭐ All 11 Artifacts Gathered!',
      hiddenUnlocked: 'Hidden World 12: Interstellar Tesseract Unlocked!',
      acquiredOn: 'Discovered on',
      undiscovered: 'Undiscovered realm. Warp to this world and draw an omikuji to collect.',
      close: 'Close Codex'
    },
    history: {
      title: 'Spacetime Destiny Archive',
      subtitle: 'Review past fortunes, life questions, and AI deep counsel records',
      empty: 'No destiny records yet. Warp to any world and draw your first omikuji!',
      drawnAt: 'Drawn on',
      viewAiInterpretation: 'AI Persona Interpretation',
      close: 'Close Archive'
    },
    stats: {
      title: 'Multiverse Spacetime Observatory',
      badge: 'REAL-TIME ETL',
      subtitle: 'Real-time observation metrics of multiverse destiny distributions and LLM inference',
      activeTravelers: 'Active Travelers',
      fortunesDrawn: 'Fortunes Drawn',
      aiInference: 'AI Inferences',
      aiSatisfaction: 'AI Satisfaction Rate',
      distributionTitle: '7 Sacred Fortune Grade Distribution',
      distributionSubtitle: 'Probability weight verification',
      topWorldsTitle: 'Top Explored Worlds',
      topWorldsSubtitle: 'Traveler migration volume',
      timesVisited: 'visits',
      architectureTitle: 'Data & LLM Architecture Highlight',
      architectureDesc: 'This service combines an 84-record Master DB cache with Google Gemini 2.5 Flash on-demand structured inference, reducing API costs by 90% while eliminating hallucinations.',
      close: 'Close Observatory'
    },
    spots: {
      1: {
        name: 'Kreiden Plains (TalesWeaver)',
        locationName: 'Kreiden Plains',
        worldName: 'TalesWeaver',
        shortName: 'Kreiden Plains',
        luckyItem: 'Breeze Feather',
        itemDesc: 'A mystical feather imbued with the gentle breeze and freedom of the Kreiden Plains.',
        desc: 'A serene grassland where gentle breezes whisper of ancient runes.'
      },
      2: {
        name: 'Driftveil Drawbridge (Pokémon)',
        locationName: 'Driftveil Drawbridge',
        worldName: 'Pokémon',
        shortName: 'Driftveil Drawbridge',
        luckyItem: 'Poké Ball',
        itemDesc: 'A wondrous capsule holding the promise of fateful encounters and boundless adventure.',
        desc: 'A neon-lit industrial bridge humming with electric ambition.'
      },
      3: {
        name: 'Aburaya Bathhouse (Spirited Away)',
        locationName: 'Aburaya Bathhouse',
        worldName: 'Spirited Away',
        shortName: 'Aburaya',
        luckyItem: 'Herbal Token',
        itemDesc: 'A wooden talisman imbued with purifying vapors and restorative herbal springs.',
        desc: 'A scarlet bathhouse bathed in spirit steam and lantern glow.'
      },
      4: {
        name: 'Night City (Cyberpunk)',
        locationName: 'Night City',
        worldName: 'Cyberpunk',
        shortName: 'Night City',
        luckyItem: 'Neural Accelerator',
        itemDesc: 'A high-grade cyberware chip pushing neural reflexes past human limitations.',
        desc: 'A towering megalopolis drenched in neon, chrome, and high-octane grit.'
      },
      5: {
        name: "Moe's Tavern (The Simpsons)",
        locationName: "Moe's Tavern",
        worldName: 'The Simpsons',
        shortName: "Moe's Tavern",
        luckyItem: 'Duff Beer',
        itemDesc: 'A cold, jovial pint of Duff to wash away the burdens of another hectic day.',
        desc: 'A warm, comedic neighborhood pub filled with laughter and cold mugs.'
      },
      6: {
        name: 'Kasukabe Playground (Crayon Shin-chan)',
        locationName: 'Kasukabe Playground',
        worldName: 'Crayon Shin-chan',
        shortName: 'Kasukabe',
        luckyItem: 'Chocobi',
        itemDesc: 'A pink snack box packed with pure childhood wonder and sweet nostalgic delight.',
        desc: 'A cozy sunset playground filled with nostalgic childhood memories.'
      },
      7: {
        name: 'Äußerst Exam Grounds (Frieren)',
        locationName: 'Äußerst Exam Grounds',
        worldName: 'Frieren: Beyond Journey',
        shortName: 'Äußerst',
        luckyItem: 'Ancient Grimoire',
        itemDesc: 'An ancient parchment grimoire inscribed with timeless magical wisdom.',
        desc: 'A quiet magical academy where ancient spells echo through the ages.'
      },
      8: {
        name: 'Lith Harbor (MapleStory)',
        locationName: 'Lith Harbor',
        worldName: 'MapleStory',
        shortName: 'Lith Harbor',
        luckyItem: 'Red Potion',
        itemDesc: "A vital draught that restores stamina and kindles the spark of a beginner's journey.",
        desc: 'The historic starting port of boundless adventure and ocean winds.'
      },
      9: {
        name: 'Corona Kingdom (Tangled)',
        locationName: 'Corona Kingdom',
        worldName: 'Tangled',
        shortName: 'Corona Kingdom',
        luckyItem: 'Magic Frying Pan',
        itemDesc: 'An unexpected yet trusty implement that stirs courage and resolute determination.',
        desc: 'A starlit night sky illuminated by thousands of golden floating lanterns.'
      },
      10: {
        name: 'Howling Abyss (Freljord)',
        locationName: 'Howling Abyss',
        worldName: 'League of Legends',
        shortName: 'Howling Abyss',
        luckyItem: 'Poro Snax',
        itemDesc: 'A warm, fluffy morsel that melts the bitter frost of the Howling Abyss.',
        desc: 'An ancient frost bridge spanning over glacial rifts and howling blizzards.'
      },
      11: {
        name: 'Hogwarts Great Hall (Harry Potter)',
        locationName: 'Hogwarts Great Hall',
        worldName: 'Harry Potter',
        shortName: 'Hogwarts',
        luckyItem: 'Golden Snitch',
        itemDesc: 'A dazzling winged sphere whose capture bestows instant glory and triumph.',
        desc: 'A magnificent vaulted hall illuminated by floating candles and magic.'
      },
      12: {
        name: 'Tesseract 5D (Interstellar)',
        locationName: 'Tesseract (5th Dimension)',
        worldName: 'Interstellar',
        shortName: 'Tesseract',
        luckyItem: 'Quantum Gravity Watch',
        itemDesc: 'A ticking artifact proving that gravity and boundless love can bridge any spacetime gulf.',
        desc: 'A five-dimensional spacetime construct where gravity transcends time and distance.'
      }
    }
  },
  ko: {
    header: {
      codex: '도감',
      history: '기록',
      stats: '통계',
      soundOn: '배경음 켜짐',
      soundOff: '배경음 음소거',
      streak: '일 연속 접속',
      login: 'Google 로그인',
      loggingIn: '로그인 중...',
      logout: '로그아웃',
      tokens: 'AI 풀이',
      zenMode: '감상 모드',
      adminMode: '관리자',
      restrictedTitle: '열람 제한',
      restrictedMsg: '시공간의 성소인 \'차원의 균열\'에서만 열람할 수 있습니다.',
      returnSanctuary: '성소로 귀환하기'
    },
    map: {
      selectWorld: '시공간 세계관 선택',
      subTitle: '12개 멀티버스 세계선으로 워프하여 운명을 점치세요',
      warpButton: '차원 도약 시작 (60초 소요)',
      lockedHidden: '잠김 (도감 11종 수집 시 해금)',
      luckyItemLabel: '행운의 아이템',
      bgmLabel: '테마 BGM',
      sanctuaryHub: '차원의 균열 성소',
      sanctuaryDesc: '시공간의 중심 허브. 과거의 점괘 기록과 럭키 아이템 도감을 열람할 수 있습니다.',
      sanctuaryButton: '차원의 균열로 귀환'
    },
    movement: {
      travelingTitle: '차원 도약 시공간 항해 중',
      destination: '도착지',
      statusPhases: {
        phase1: '1단계: 차원의 사건의 지평선 진입 중',
        phase2: '2단계: 시공간 위상 공명 주파수 동기화',
        phase3: '3단계: 목표 세계관 좌표 실체화',
        phase4: '4단계: 최종 대기권 진입 및 안착 유도'
      },
      brakeButton: '⚡ 회생제동 가속 (-3초)',
      brakeDesc: '캔버스를 탭하거나 버튼을 연타하여 차원 막의 마찰 파동을 역위상 코일로 흡수하세요',
      tapPrompt: '화면(캔버스) 어디든 탭하여 조기 감속 안착을 유도하세요!',
      earlyArrival: '감속 완료! 차원에 도착했습니다...',
      adminSkip: '⚡ 관리자 즉시 도착',
      calibrationLog: [
        '타키온 자기 코일 미세 조정 중...',
        '상대론적 시간 지연 오차 보정 중...',
        '멀티버스 양자 위상각 동기화...',
        '시공간 균열 좌표 안정화 단계...',
        '운동 마찰 에너지를 축전기로 흡수 중...'
      ]
    },
    omikuji: {
      shrineTitle: '시공간 신사 오미쿠지',
      drawFortune: '정통 점괘 뽑기',
      shakePrompt: '산통을 정성껏 흔들어 운명의 산대를 뽑으세요',
      tapToShake: '산통 흔들기 (4회 연타)',
      luckyItem: '행운의 아이템',
      itemDesc: '중력과 사랑이 시공간을 초월함을 증명하는 초침의 시계',
      poeticVerse: '✦ 차원 운세 시(詩) ✦',
      overallFortune: '📜 차원의 총운',
      categories: {
        wish: '願事 (소원)',
        love: '戀愛 (인연)',
        wealth: '金運 (재물)',
        work: '事業 (학업·일)',
        travel: '旅行 (이동)',
        waiting: '待人 (기다림)'
      },
      luckyDirection: '행운의 방위',
      luckyNumber: '행운의 숫자',
      downloadCard: '부적 카드 저장',
      generatingCard: '카드 생성 중...',
      copyText: '점괘 복사',
      copiedToast: '점괘 텍스트가 클립보드에 복사되었습니다!',
      tieFortune: '차원의 결계에 액막이 묶기(結び)',
      tyingFortune: '액막이 결계에 묶는 중...',
      tiedComplete: '차원의 결계에 액막이 묶음 완료',
      tiedToast: '액운이 정화되었습니다. 새로운 길한 세계선이 열릴 것입니다.',
      aiTitle: 'AI 심층 차원 해석',
      samplePrompt: '다른 여행자 풀이 예시',
      sampleClose: '예시 닫기',
      guestWelcomeBonus: '🎁 신규 방랑자 웰컴 혜택: 회원가입 없이도 1회 무료 AI 풀이를 이용하실 수 있습니다!',
      guestTokensExhausted: '게스트 (토큰 소진)',
      remainingTokens: '남은 토큰',
      placeholderInput: '현재 고민이나 상황을 적어주세요 (예: 새로운 시험을 준비 중인데 앞으로의 운이 어떨까요?)',
      askAiButton: '세계관 페르소나에게 묻기 (토큰 1개 소모)',
      interpretingButton: '차원의 인과율 해석 중...',
      feedbackQuestion: '이 차원의 해석이 마음에 드셨나요?',
      feedbackHelpful: '도움돼요',
      feedbackNeedsWork: '아쉬워요',
      feedbackHelpfulToast: '소중한 피드백 감사합니다! AI 품질 개선 및 RLHF에 반영되었습니다.',
      feedbackNeedsWorkToast: '피드백이 접수되었습니다. 향후 프롬프트 및 인과율 튜닝에 참고하겠습니다.'
    },
    codex: {
      title: '차원 럭키 아이템 도감',
      subtitle: '11대 세계관의 전설적 아이템을 모두 모으면 12번째 히든 스팟이 개방됩니다',
      progress: '수집한 아이템',
      completedBadge: '⭐ 11종 전설 아이템 수집 완료!',
      hiddenUnlocked: '히든 세계관 12: 인터스텔라 테서렉트 해금 완료!',
      acquiredOn: '획득 일시',
      undiscovered: '미지의 차원 아이템입니다. 해당 세계관으로 워프하여 점괘를 뽑아보세요.',
      close: '도감 닫기'
    },
    history: {
      title: '차원 운명 기록보관소',
      subtitle: '과거에 뽑은 점괘와 유저의 고민, AI 심층 해석 기록을 열람합니다',
      empty: '아직 기록된 운명이 없습니다. 새로운 세계관으로 이동하여 첫 점괘를 뽑아보세요!',
      drawnAt: '추첨 일시',
      viewAiInterpretation: 'AI 심층 차원 해석',
      close: '기록보관소 닫기'
    },
    stats: {
      title: '시공간 관측소 데이터 분석',
      badge: 'REAL-TIME ETL',
      subtitle: '12개 멀티버스 차원의 운명 인과율 및 LLM 서빙 실시간 관측 지표',
      activeTravelers: '총 시공간 방랑자',
      fortunesDrawn: '누적 점괘 추첨',
      aiInference: 'AI 심층 인과율 해석',
      aiSatisfaction: 'AI 해석 만족도 (RLHF)',
      distributionTitle: '7대 정통 운세 등급별 관측 분포',
      distributionSubtitle: '확률 가중치 정규분포 검증',
      topWorldsTitle: '12대 세계관 탐험 선호도 (Top Visited Spots)',
      topWorldsSubtitle: '유저 이동 데이터 집계',
      timesVisited: '회 방문',
      architectureTitle: 'Data & LLM Architecture Highlight',
      architectureDesc: '본 서비스는 84건의 정통 오미쿠지 Master DB 캐싱과 Google Gemini 2.5 Flash 온디맨드 구조화 서빙을 결합하여, API 비용을 90% 절감하고 환각 현상을 억제합니다.',
      close: '관측 창 닫기'
    },
    spots: {
      1: {
        name: '크라이덴 평원 (테일즈위버)',
        locationName: '크라이덴 평원',
        worldName: '테일즈위버',
        shortName: '크라이덴 평원',
        luckyItem: '바람의 깃털',
        itemDesc: '크라이덴 평원의 산들바람과 자유가 깃든 신비로운 깃털',
        desc: '산들바람이 불어오는 평화로운 초원.'
      },
      2: {
        name: '물풍경 도개교 (포켓몬스터)',
        locationName: '물풍경 도개교',
        worldName: '포켓몬스터',
        shortName: '물풍경 도개교',
        luckyItem: '몬스터볼',
        itemDesc: '새로운 만남과 모험의 가능성이 담긴 캡슐',
        desc: '전기 에너지와 네온사인이 반짝이는 활기찬 도개교.'
      },
      3: {
        name: '아부라야 온천장 (센과 치히로)',
        locationName: '아부라야 온천장',
        worldName: '센과 치히로의 행방불명',
        shortName: '아부라야',
        luckyItem: '약탕패',
        itemDesc: '온천장의 신비로운 효능과 정화의 기운이 깃든 나무 팻말',
        desc: '신비로운 붉은 등불과 증기가 감도는 전통 온천장.'
      },
      4: {
        name: '나이트 시티 (사이버펑크)',
        locationName: '나이트 시티',
        worldName: '사이버펑크',
        shortName: '나이트 시티',
        luckyItem: '신경 가속기',
        itemDesc: '한계를 뛰어넘는 반사신경과 사이버웨어 칩',
        desc: '글리치와 네온 불빛이 번쩍이는 하이테크 미래 도시.'
      },
      5: {
        name: '모의 선술집 (심슨 가족)',
        locationName: '모의 선술집',
        worldName: '심슨 가족',
        shortName: '모의 선술집',
        luckyItem: '더프 맥주',
        itemDesc: '하루의 피로를 털어내는 유쾌하고 시원한 맥주 한 잔',
        desc: '유쾌한 웃음소리와 시원한 맥주잔이 부딪히는 단골 펍.'
      },
      6: {
        name: '떡잎마을 놀이터 (크레용 신짱)',
        locationName: '떡잎마을 놀이터',
        worldName: '크레용 신짱',
        shortName: '떡잎마을',
        luckyItem: '초코비',
        itemDesc: '순수한 동심과 달콤한 즐거움이 가득한 핑크빛 과자 상자',
        desc: '노을 지는 저녁의 아련하고 따뜻한 유년의 놀이터.'
      },
      7: {
        name: '오이서스트 마법시험장 (장송의 프리렌)',
        locationName: '오이서스트 마법시험장',
        worldName: '장송의 프리렌',
        shortName: '오이서스트',
        luckyItem: '고대 마도서',
        itemDesc: '유구한 시간과 마법의 지혜가 기록된 양피지 마도서',
        desc: '고대 마법의 룬 문자와 시공간의 침묵이 흐르는 성역.'
      },
      8: {
        name: '리스항구 (메이플스토리)',
        locationName: '리스항구',
        worldName: '메이플스토리',
        shortName: '리스항구',
        luckyItem: '빨간 포션',
        itemDesc: '모험의 첫 발걸음과 원기를 회복시켜주는 물약',
        desc: '끝없는 첫 모험의 설렘이 깃든 푸른 바다의 항구.'
      },
      9: {
        name: '코로나 왕국 (라푼젤)',
        locationName: '코로나 왕국',
        worldName: '라푼젤',
        shortName: '코로나 왕국',
        luckyItem: '마법의 프라이팬',
        itemDesc: '단단한 결단력과 용기를 북돋워 주는 만능 무기',
        desc: '황금빛 풍등이 밤하늘을 수놓는 환상적인 왕국.'
      },
      10: {
        name: '칼바람 나락 (프렐요드)',
        locationName: '칼바람 나락',
        worldName: '리그 오브 레전드',
        shortName: '칼바람 나락',
        luckyItem: '포로 간식',
        itemDesc: '혹한의 칼바람 속에서도 마음을 따스하게 녹이는 푹신한 간식',
        desc: '영구동토와 혹한의 바람이 휘몰아치는 전설의 얼음 다리.'
      },
      11: {
        name: '호그와트 연회장 (해리 포터)',
        locationName: '호그와트 연회장',
        worldName: '해리 포터',
        shortName: '호그와트',
        luckyItem: '골든 스니치',
        itemDesc: '잡는 순간 승리를 가져다주는 황금빛 마법 날개의 스니치',
        desc: '공중에 떠 있는 촛불과 마법의 온기가 가득한 대강당.'
      },
      12: {
        name: '5차원 테서렉트 (인터스텔라)',
        locationName: '5차원 테서렉트',
        worldName: '인터스텔라',
        shortName: '테서렉트',
        luckyItem: '양자 중력 시계',
        itemDesc: '중력과 사랑이 시공간을 초월함을 증명하는 초침의 시계',
        desc: '중력과 사랑이 시공간을 초월하는 무한한 5차원 격자 공간.'
      }
    }
  },
  ja: {
    header: {
      codex: '図鑑',
      history: '履歴',
      stats: '統計',
      soundOn: 'BGM ON',
      soundOff: 'BGM OFF',
      streak: '日連続接続',
      login: 'Google ログイン',
      loggingIn: 'ログイン中...',
      logout: 'ログアウト',
      tokens: 'AI 相談券',
      zenMode: '鑑賞モード',
      adminMode: '管理者',
      restrictedTitle: '閲覧制限',
      restrictedMsg: '時空の聖所である「次元の裂け目」でのみ閲覧可能です。',
      returnSanctuary: '聖所に帰還する'
    },
    map: {
      selectWorld: '時空世界観を選択',
      subTitle: '12のマルチバース世界へワープし、運命を占いましょう',
      warpButton: '時空ワープ開始 (60秒)',
      lockedHidden: '封印中 (図鑑11種コンプリートで解禁)',
      luckyItemLabel: 'ラッキーアイテム',
      bgmLabel: 'テーマ BGM',
      sanctuaryHub: '次元の裂け目 (聖所)',
      sanctuaryDesc: '時空の中心ハブ。過去のおみくじ履歴やラッキーアイテム図鑑を閲覧できます。',
      sanctuaryButton: '次元の裂け目へ帰還'
    },
    movement: {
      travelingTitle: '時空ワープ航行中',
      destination: '目的地',
      statusPhases: {
        phase1: 'フェーズ 1: 事象の地平面へ突入中',
        phase2: 'フェーズ 2: 時空位相共鳴周波数を同期中',
        phase3: 'フェーズ 3: 目的世界座標の実体化',
        phase4: 'フェーズ 4: 最終大気圏突入・軟着陸誘導'
      },
      brakeButton: '⚡ 回生ブレーキ (-3秒)',
      brakeDesc: '画面タップまたはボタン連打で次元膜の摩擦波動を逆位相コイルで吸収してください',
      tapPrompt: '画面（キャンバス）をタップして早期着陸を誘導してください！',
      earlyArrival: '減速完了！次元に到着しました...',
      adminSkip: '⚡ 管理者即時到着',
      calibrationLog: [
        'タキオン磁気コイルの微調整中...',
        '相対論的時間遅延誤差を補正中...',
        'マルチバース量子位相を同期中...',
        '時空亀裂座標の安定化プロセス...',
        '運動摩擦エネルギーをキャパシタに吸収中...'
      ]
    },
    omikuji: {
      shrineTitle: '時空神社 御神籤',
      drawFortune: 'おみくじを引く',
      shakePrompt: '神籤筒を振って運命の御神籤を引き出してください',
      tapToShake: '神籤筒を振る (4回連打)',
      luckyItem: 'ラッキーアイテム',
      itemDesc: '重力と愛が時空を超えることを証明する針を刻む腕時計。',
      poeticVerse: '✦ 時空の運勢詩 ✦',
      overallFortune: '📜 次元の総運',
      categories: {
        wish: '願事 (ねがいごと)',
        love: '戀愛 (れんあい)',
        wealth: '金運 (きんうん)',
        work: '事業 (しごと・がくもん)',
        travel: '旅行 (たびだち)',
        waiting: '待人 (まちびと)'
      },
      luckyDirection: '吉方位',
      luckyNumber: '幸運の数字',
      downloadCard: '御守りカード保存',
      generatingCard: 'カード生成中...',
      copyText: 'おみくじをコピー',
      copiedToast: 'おみくじがクリップボードにコピーされました！',
      tieFortune: '次元の結界に結ぶ (結び)',
      tyingFortune: '厄払いの結界に結び中...',
      tiedComplete: '次元の結界に結び完了',
      tiedToast: '厄運が浄化されました。新たな吉兆の世界線が開かれます。',
      aiTitle: 'AI 深層次元占い (相談)',
      samplePrompt: '他の旅人の質問例',
      sampleClose: '質問例を閉じる',
      guestWelcomeBonus: '🎁 初訪問ウェルカム特典: ログインなしで1回無料AI深層相談をご利用いただけます！',
      guestTokensExhausted: 'ゲスト (相談券消費済)',
      remainingTokens: '残りの相談券',
      placeholderInput: '現在のお悩みや状況をご記入ください (例: 新しい試験に挑んでいますが、今後の運勢はどうですか？)',
      askAiButton: '世界観ペルソナに相談 (券1枚消費)',
      interpretingButton: '次元の因果律を解析中...',
      feedbackQuestion: 'この次元の鑑定はお役に立ちましたか？',
      feedbackHelpful: '役立った',
      feedbackNeedsWork: 'いまいち',
      feedbackHelpfulToast: '貴重なフィードバックをありがとうございます！AI品質向上に反映します。',
      feedbackNeedsWorkToast: 'ご意見を承りました。今後のプロンプト最適化の参考にいたします。'
    },
    codex: {
      title: '次元ラッキーアイテム図鑑',
      subtitle: '11のマルチバースの伝説アイテムを全て集めると第12の隠しスポットが解禁されます',
      progress: '収集したアイテム',
      completedBadge: '⭐ 11種の伝説アイテムコンプリート！',
      hiddenUnlocked: '隠し世界 12: インターステラー テセラック解禁！',
      acquiredOn: '獲得日時',
      undiscovered: '未知の次元アイテムです。該当世界へワープしておみくじを引いてみましょう。',
      close: '図鑑を閉じる'
    },
    history: {
      title: '時空運命記録保管所',
      subtitle: '過去に引いたおみくじ、お悩み、AI深層鑑定の履歴を閲覧します',
      empty: '記録された運命がまだありません。新たな世界へ旅立っておみくじを引いてみましょう！',
      drawnAt: '抽選日時',
      viewAiInterpretation: 'AI深層鑑定結果',
      close: '記録所を閉じる'
    },
    stats: {
      title: '時空観測所 データ分析',
      badge: 'REAL-TIME ETL',
      subtitle: '12のマルチバース次元の因果律およびLLMサービングのリアルタイム観測指標',
      activeTravelers: '総時空旅人',
      fortunesDrawn: '累積おみくじ数',
      aiInference: 'AI深層推論数',
      aiSatisfaction: 'AI鑑定満足度 (RLHF)',
      distributionTitle: '7大吉凶ランク別観測分布',
      distributionSubtitle: '確率重み付け正規分布の検証',
      topWorldsTitle: '12大世界探訪人気ランキング',
      topWorldsSubtitle: '旅人の移動データ集計',
      timesVisited: '回訪問',
      architectureTitle: 'Data & LLM Architecture Highlight',
      architectureDesc: '本サービスは84件の正統おみくじMaster DBキャッシュとGoogle Gemini 2.5 Flashオンデマンド構造化サービングを結合し、APIコストを90%削減しハルシネーションを抑制します。',
      close: '観測画面を閉じる'
    },
    spots: {
      1: {
        name: 'クライデン平原 (テイルズウィーバー)',
        locationName: 'クライデン平原',
        worldName: 'テイルズウィーバー',
        shortName: 'クライデン平原',
        luckyItem: '風の羽',
        itemDesc: 'クライデン平原のそよ風と自由が宿る神秘の羽。',
        desc: 'そよ風が吹き抜ける平穏な草原。'
      },
      2: {
        name: 'ホドモエの跳ね橋 (ポケットモンスター)',
        locationName: 'ホドモエの跳ね橋',
        worldName: 'ポケットモンスター',
        shortName: 'ホドモエの跳ね橋',
        luckyItem: 'モンスターボール',
        itemDesc: '新たな出会いと冒険の可能性を秘めたカプセル。',
        desc: '電気エネルギーとネオンサインが煌めく活気ある跳ね橋。'
      },
      3: {
        name: '油屋の湯屋 (千と千尋の神隠し)',
        locationName: '油屋の湯屋',
        worldName: '千と千尋の神隠し',
        shortName: '油屋',
        luckyItem: '薬湯の札',
        itemDesc: '湯屋の神秘的な霊効と浄化の気が宿る木札。',
        desc: '神秘的な赤い提灯と湯気が立ち込める伝統的な湯屋。'
      },
      4: {
        name: 'ナイトシティ (サイバーパンク)',
        locationName: 'ナイトシティ',
        worldName: 'サイバーパンク',
        shortName: 'ナイトシティ',
        luckyItem: '神経加速器',
        itemDesc: '限界を超える反射神経を授けるサイバーウェアチップ。',
        desc: 'グリッチとネオンが瞬くハイテク未来都市。'
      },
      5: {
        name: 'モエの酒場 (ザ・シンプソンズ)',
        locationName: 'モエの酒場',
        worldName: 'ザ・シンプソンズ',
        shortName: 'モエの酒場',
        luckyItem: 'ダフビール',
        itemDesc: '一日の疲れを吹き飛ばす、陽気で爽快なビールジョッキ。',
        desc: '陽気な笑い声と冷たいジョッキがぶつかり合う馴染みのパブ。'
      },
      6: {
        name: '春日部公園 (クレヨンしんちゃん)',
        locationName: '春日部公園',
        worldName: 'クレヨンしんちゃん',
        shortName: '春日部',
        luckyItem: 'チョコビ',
        itemDesc: '純真な童心と甘い喜びに満ちたピンク色のお菓子箱。',
        desc: '夕焼けに染まる懐かしく温かな幼少期の遊び場。'
      },
      7: {
        name: 'オイサースト魔法試験場 (葬送のフリーレン)',
        locationName: 'オイサースト魔法試験場',
        worldName: '葬送のフリーレン',
        shortName: 'オイサースト',
        luckyItem: '古代の魔導書',
        itemDesc: '悠久の時と魔法の知恵が記された羊皮紙の魔導書。',
        desc: '古代魔法のルーン文字と時空の静寂が漂う聖域。'
      },
      8: {
        name: 'リス港口 (メイプルストーリー)',
        locationName: 'リス港口',
        worldName: 'メイプルストーリー',
        shortName: 'リス港口',
        luckyItem: '赤いポーション',
        itemDesc: '冒険の第一歩と元気を回復させる初心者の秘薬。',
        desc: '果てしない最初の冒険への胸の高鳴りが宿る青い港。'
      },
      9: {
        name: 'コロナ王国 (塔の上のラプンツェル)',
        locationName: 'コロナ王国',
        worldName: '塔の上のラプンツェル',
        shortName: 'コロナ王国',
        luckyItem: '魔法のフライパン',
        itemDesc: '揺るぎない決意と勇気を奮い立たせる万能のフライパン。',
        desc: '無数の黄金のランタンが夜空を彩る幻想的な王国。'
      },
      10: {
        name: 'ハウリングアビス (フレヨルド)',
        locationName: 'ハウリングアビス',
        worldName: 'リーグ・オブ・レジェンド',
        shortName: 'ハウリングアビス',
        luckyItem: 'ポロスナック',
        itemDesc: '極寒の吹雪の中でも心を温かく解きほぐすふわふわのスナック。',
        desc: '永久凍土と極寒の吹雪が吹き荒れる伝説の氷の橋。'
      },
      11: {
        name: 'ホグワーツ大広間 (ハリー・ポッター)',
        locationName: 'ホグワーツ大広間',
        worldName: 'ハリー・ポッター',
        shortName: 'ホグワーツ',
        luckyItem: '金のスニッチ',
        itemDesc: '手にした瞬間に栄光をもたらす黄金の翼を持つスニッチ。',
        desc: '宙に浮かぶ無数の蝋燭と魔法の温もりに満ちた大広間。'
      },
      12: {
        name: '5次元テセラック (インターステラー)',
        locationName: '5次元テセラック',
        worldName: 'インターステラー',
        shortName: 'テセラック',
        luckyItem: '量子重力時計',
        itemDesc: '重力と愛が時空を超えることを証明する針を刻む腕時計。',
        desc: '重力と愛が時空を超越する無限の5次元グリッド空間。'
      }
    }
  }
};
