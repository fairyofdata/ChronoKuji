import { UserState, OmikujiResult, FateHistoryItem, LlmInterpretationResult, CollectedCodexItem, ObservatoryStats } from '../types';
import { SPOTS, CODEX_ITEMS } from '../constants';
import { getSpacetimeFortune, WORLD_OMIKUJI_LORE } from '../omikujiLore';
import { API_BASE_URL } from '../config';

const USER_STATE_KEY = 'chronokuji_user_state';
const HISTORY_KEY = 'chronokuji_fate_history';
const CODEX_KEY = 'chronokuji_collected_codex';
const TRAVEL_TIME_SECONDS = 60; // 60초 이동 시간

const LUCK_LEVELS = ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"];
const LUCK_WEIGHTS = [0.15, 0.20, 0.25, 0.20, 0.10, 0.07, 0.03]; // 대길~대흉 확률 분포

function getRandomLuckLevel(): string {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < LUCK_LEVELS.length; i++) {
    cumulative += LUCK_WEIGHTS[i];
    if (rand <= cumulative) return LUCK_LEVELS[i];
  }
  return "吉";
}

export class LocalGameService {
  /**
   * 로컬 유저 상태 조회 또는 초기화
   */
  static getUserState(userId?: string | null): UserState {
    const raw = localStorage.getItem(USER_STATE_KEY);
    const now = new Date();
    
    if (raw) {
      try {
        const state: UserState = JSON.parse(raw);
        // 이동 중인 경우 도착 시간 검증 및 즉각 정규화
        if (state.target_spot_id !== null && state.arrival_time) {
          const arrival = new Date(state.arrival_time);
          if (now >= arrival) {
            state.current_spot_id = state.target_spot_id === 0 ? null : state.target_spot_id;
            state.target_spot_id = null;
            state.arrival_time = null;
            state.is_arrived = true;
            this.saveUserState(state);
          }
        }
        return state;
      } catch (e) {
        console.warn("Failed to parse stored user state, resetting.", e);
      }
    }

    const defaultState: UserState = {
      user_id: userId || 'guest_' + Math.random().toString(36).substring(2, 10),
      firebase_uid: null,
      email: null,
      display_name: '방랑자 (게스트)',
      is_guest: true,
      llm_tokens: 5,
      last_token_refill_at: now.toISOString(),
      current_spot_id: 2, // 기본 시작: 물풍경 도개교
      target_spot_id: null,
      arrival_time: null,
      is_arrived: true,
      streak_days: 1
    };

    localStorage.setItem(USER_STATE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  /**
   * 상태 저장
   */
  static saveUserState(state: UserState): void {
    localStorage.setItem(USER_STATE_KEY, JSON.stringify(state));
  }

  /**
   * 차원 이동 시작 (60초 소요)
   */
  static startMovement(targetSpotId: number): UserState {
    const state = this.getUserState();
    const now = new Date();
    const arrival = new Date(now.getTime() + TRAVEL_TIME_SECONDS * 1000);

    state.current_spot_id = null;
    state.target_spot_id = targetSpotId;
    state.arrival_time = arrival.toISOString();
    state.is_arrived = false;

    this.saveUserState(state);
    return state;
  }

  /**
   * 차원 이동 완료/도착
   */
  static arriveMovement(): UserState {
    const state = this.getUserState();
    if (state.target_spot_id !== null) {
      state.current_spot_id = state.target_spot_id === 0 ? null : state.target_spot_id;
      state.target_spot_id = null;
      state.arrival_time = null;
      state.is_arrived = true;
      this.saveUserState(state);
    }
    return state;
  }

  /**
   * 차원 도약 회생제동 (Regenerative Warp Braking)
   * 시공간 파동 에너지를 회생 코일로 흡수하여 목적지 도착 예상 시간을 조기 감속 안착시킴
   */
  static brakeMovement(seconds: number): UserState {
    const state = this.getUserState();
    if (state.target_spot_id !== null && state.arrival_time && !state.is_arrived) {
      const currentArrival = new Date(state.arrival_time).getTime();
      const newArrival = Math.max(Date.now(), currentArrival - (seconds * 1000));
      state.arrival_time = new Date(newArrival).toISOString();
      if (newArrival <= Date.now()) {
        state.is_arrived = true;
      }
      this.saveUserState(state);
    }
    return state;
  }

  /**
   * 오미쿠지 뽑기 (다국어 지원)
   */
  static drawOmikuji(spotId: number, lang?: 'ko' | 'en' | 'ja'): OmikujiResult {
    const luckLevel = getRandomLuckLevel();
    const currentLang = (lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('chronokuji_lang') : 'en') || 'en') as 'ko' | 'en' | 'ja';
    
    const fortune = getSpacetimeFortune(spotId, luckLevel, currentLang) || 
      getSpacetimeFortune(2, luckLevel, currentLang) || {
        poem: "The dimensional winds guide your steps through spacetime.",
        text: "Fortune smiles upon this realm.",
        categories: {
          wish: "Follow your intuition.",
          love: "Harmony approaches.",
          wealth: "Steady growth.",
          work: "Focus brings victory.",
          travel: "Auspicious journeys.",
          waiting: "News arrives soon."
        }
      };

    const directions = currentLang === 'en'
      ? ['East', 'West', 'South', 'North', 'South-East', 'North-East', 'South-West', 'North-West']
      : currentLang === 'ja'
      ? ['東', '西', '南', '北', '南東', '北東', '南西', '北西']
      : ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'];
    const dirSuffix = currentLang === 'en' ? ' Dimensional Wind' : currentLang === 'ja' ? 'の次元風' : ' 차원의 바람';
    const randomDir = directions[Math.floor(Math.random() * directions.length)] + dirSuffix;
    const randomNum = Math.floor(Math.random() * 99) + 1;

    const historyId = Date.now();
    const result: OmikujiResult = {
      history_id: historyId,
      spot_id: spotId,
      luck_level: luckLevel,
      original_text: fortune.text,
      meta_info: {
        poem: fortune.poem,
        categories: fortune.categories,
        lucky_direction: randomDir,
        lucky_number: randomNum
      }
    };

    // 히스토리 추가
    const history = this.getHistory();
    const historyItem: FateHistoryItem = {
      history_id: historyId,
      drawn_at: new Date().toISOString(),
      spot_id: spotId,
      luck_level: luckLevel,
      original_text: fortune.text,
      meta_info: result.meta_info
    };
    history.unshift(historyItem);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));

    // 도감 아이템 자동 획득
    this.unlockCodexItem(spotId);

    return result;
  }

  /**
   * 운세 히스토리 조회
   */
  static getHistory(): FateHistoryItem[] {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * 수집한 도감 목록 조회
   */
  static getCollectedCodex(): CollectedCodexItem[] {
    const raw = localStorage.getItem(CODEX_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * 도감 아이템 해금
   */
  static unlockCodexItem(spotId: number): void {
    const targetItem = CODEX_ITEMS.find(c => c.spotId === spotId);
    if (!targetItem) return;

    const collected = this.getCollectedCodex();
    if (!collected.some(c => c.id === targetItem.id)) {
      collected.push({
        id: targetItem.id,
        name: targetItem.name,
        worldName: targetItem.worldName,
        image: targetItem.image,
        acquiredAt: new Date().toISOString()
      });
      localStorage.setItem(CODEX_KEY, JSON.stringify(collected));
    }
  }

  /**
   * AI 운세 해석 (오프라인 룰베이스 감성 해석 - EN 기본값, KO, JA 다국어 지원)
   */
  static async interpretOmikuji(historyId: number, userContext?: string, lang: string = 'en'): Promise<LlmInterpretationResult> {
    const history = this.getHistory();
    const item = history.find(h => h.history_id === historyId);
    const spot = SPOTS.find(s => s.id === item?.spot_id);
    const worldName = spot?.worldName || 'Spacetime';

    let interpretation = '';
    let worldTitle = '';

    if (lang === 'ja') {
      interpretation = `[${worldName}の運命鑑定]
あなたの引いた御神籤は「${item?.luck_level || '吉'}」です。
${item?.meta_info?.poem ? `"${item.meta_info.poem}"\n\n` : ''}
${userContext ? `あなたのお悩み（"${userContext}"）を見つめると、` : ''}${worldName}の世界線では、焦らずに大いなる時の流れに身を委ねることで、最も強靭な運命の波動が目覚めると告げています。
迷わず一歩を踏み出してください。時空の因果律があなたの道を照らしています。`;
      worldTitle = `${worldName} 時空因果律鑑定`;
    } else if (lang === 'ko') {
      interpretation = `[${worldName}의 운명 해석]
당신이 뽑은 점괘는 "${item?.luck_level || '吉'}"입니다.
${item?.meta_info?.poem ? `"${item.meta_info.poem}"\n\n` : ''}
${userContext ? `당신의 질문("${userContext}")에 비추어 볼 때, ` : ''}${worldName}의 세계선에서는 지금 조급해하지 않고 흐름에 몸을 맡길 때 가장 강력한 운의 파동이 솟아난다고 전합니다.
주저하지 말고 첫 발을 내딛으세요. 시공의 인과율이 당신의 앞길을 밝히고 있습니다.`;
      worldTitle = `${worldName} 시공간 인과율 해석`;
    } else {
      // Default: English
      interpretation = `[${worldName} Spacetime Counsel]
Your drawn fortune grade is "${item?.luck_level || '吉'}".
${item?.meta_info?.poem ? `"${item.meta_info.poem}"\n\n` : ''}
${userContext ? `Reflecting upon your question ("${userContext}"), ` : ''}the timeline of ${worldName} whispers that trusting the rhythm of time rather than rushing will unlock your most potent resonance.
Do not hesitate to take that first courageous step. The causal fabric of the multiverse is aligning in your favor.`;
      worldTitle = `${worldName} Causal Interpretation`;
    }

    // 히스토리에 해석 저장
    if (item) {
      item.user_context = userContext;
      item.llm_interpretation = interpretation;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    return {
      interpretation,
      world_concept_title: worldTitle,
      world_bgm_action: spot?.bgm
    };
  }

  /**
   * LLM 응답 피드백 저장 (로컬 저장 + 백엔드 비동기 동기화)
   */
  static async saveFeedback(historyId: number, rating: number, comment?: string): Promise<void> {
    const history = this.getHistory();
    const item = history.find(h => h.history_id === historyId);
    if (item) {
      item.feedback_rating = rating;
      item.feedback_text = comment || null;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    // 백엔드 API 연동 시도 (실패해도 무방)
    try {
      const state = this.getUserState();
      await fetch(`${API_BASE_URL}/api/v1/interpret/${historyId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': state.user_id
        },
        body: JSON.stringify({ rating, comment: comment || null })
      });
    } catch {
      // 오프라인이거나 서버 미가동 시에도 로컬에 안전하게 보존
    }
  }

  /**
   * 차원 관측소 데이터 통계 조회 (서버 우선, 오프라인 시 로컬 데이터 기반 실시간 집계)
   */
  static async getObservatoryStats(): Promise<ObservatoryStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/stats/summary`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.observatory) {
          return data.observatory;
        }
      }
    } catch {
      // 서버 접근 불가 시 아래의 클라이언트 로컬 집계 파이프라인 작동
    }

    // 클라이언트 로컬 스토리지 기반 실시간 분석 파이프라인 (Client-side Data Aggregation)
    const history = this.getHistory();
    const totalFortunes = history.length;
    const totalAi = history.filter(h => !!h.llm_interpretation).length;

    // 7대 등급 분포 집계
    const counts: Record<string, number> = {
      "大吉": 0, "中吉": 0, "小吉": 0, "吉": 0, "末吉": 0, "凶": 0, "大凶": 0
    };
    history.forEach(h => {
      if (counts[h.luck_level] !== undefined) {
        counts[h.luck_level]++;
      }
    });

    const luck_distribution = LUCK_LEVELS.map(lvl => ({
      level: lvl,
      count: counts[lvl] || 0,
      percentage: totalFortunes > 0 ? Math.round(((counts[lvl] || 0) / totalFortunes) * 1000) / 10 : 0
    }));

    // 스팟별 탐험 분포 집계
    const spotCounts: Record<number, number> = {};
    history.forEach(h => {
      if (h.spot_id !== null) {
        spotCounts[h.spot_id] = (spotCounts[h.spot_id] || 0) + 1;
      }
    });

    const spot_distribution = SPOTS.map(s => ({
      spot_id: s.id,
      name: s.locationName || s.name,
      visits: spotCounts[s.id] || 0
    })).sort((a, b) => b.visits - a.visits);

    // 피드백 집계
    const rated = history.filter(h => h.feedback_rating !== undefined && h.feedback_rating !== null);
    const positive = rated.filter(h => h.feedback_rating === 1).length;
    const negative = rated.filter(h => h.feedback_rating === -1).length;
    const satisfaction_rate = rated.length > 0 ? Math.round((positive / rated.length) * 1000) / 10 : 100.0;

    return {
      total_travelers: 1,
      total_fortunes_drawn: totalFortunes,
      total_ai_interpretations: totalAi,
      feedback: {
        total_rated: rated.length,
        positive,
        negative,
        satisfaction_rate
      },
      luck_distribution,
      spot_distribution
    };
  }
}
