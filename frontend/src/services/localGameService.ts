import { UserState, OmikujiResult, FateHistoryItem, LlmInterpretationResult, CollectedCodexItem } from '../types';
import { SPOTS, CODEX_ITEMS } from '../constants';
import { WORLD_OMIKUJI_LORE } from '../omikujiLore';

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
        // 이동 중인 경우 도착 시간 검증
        if (state.target_spot_id !== null && state.arrival_time) {
          const arrival = new Date(state.arrival_time);
          if (now >= arrival) {
            state.is_arrived = true;
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
   * 오미쿠지 뽑기
   */
  static drawOmikuji(spotId: number): OmikujiResult {
    const luckLevel = getRandomLuckLevel();
    const worldLore = WORLD_OMIKUJI_LORE[spotId] || WORLD_OMIKUJI_LORE[2]; // 폴백: 물풍경
    const fortune = worldLore[luckLevel] || worldLore["吉"];

    const historyId = Date.now();
    const result: OmikujiResult = {
      history_id: historyId,
      spot_id: spotId,
      luck_level: luckLevel,
      original_text: fortune.text,
      meta_info: {
        poem: fortune.poem,
        categories: fortune.categories
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
   * AI 운세 해석 (오프라인 룰베이스 감성 해석)
   */
  static async interpretOmikuji(historyId: number, userContext?: string): Promise<LlmInterpretationResult> {
    const history = this.getHistory();
    const item = history.find(h => h.history_id === historyId);
    const spot = SPOTS.find(s => s.id === item?.spot_id);
    const worldName = spot?.worldName || '시공간';

    // 감성적 오프라인 AI 템플릿 해석
    const interpretation = `[${worldName}의 운명 해석]
당신이 뽑은 점괘는 "${item?.luck_level || '吉'}"입니다.
${item?.meta_info?.poem ? `"${item.meta_info.poem}"\n\n` : ''}
${userContext ? `당신의 질문("${userContext}")에 비추어 볼 때, ` : ''}${worldName}의 세계선에서는 지금 조급해하지 않고 흐름에 몸을 맡길 때 가장 강력한 운의 파동이 솟아난다고 전합니다.
주저하지 말고 첫 발을 내딛으세요. 시공의 인과율이 당신의 앞길을 밝히고 있습니다.`;

    // 히스토리에 해석 저장
    if (item) {
      item.user_context = userContext;
      item.llm_interpretation = interpretation;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    return {
      interpretation,
      world_concept_title: `${worldName} 시공간 인과율 해석`,
      world_bgm_action: spot?.bgm
    };
  }
}
