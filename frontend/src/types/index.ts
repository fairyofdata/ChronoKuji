export interface Spot {
  id: number;
  name: string;
  locationName: string;
  worldName: string;
  shortName: string;
  theme: string;
  bgImage: string;
  boxImage: string;
  itemImage: string;
  luckyItem: string;
  bgm: string;
  youtubeId: string;
  bgmTitle: string;
  isHidden?: boolean;
}

export interface SystemAudioTrack {
  bgm: string;
  youtubeId: string;
  title: string;
}

export interface SystemAudioTracks {
  lobby: SystemAudioTrack;
  travel: SystemAudioTrack;
  celebrationRapunzel: SystemAudioTrack;
  easterEggs: {
    mapleRift: SystemAudioTrack;
    mapleTimePath: SystemAudioTrack;
  };
}

export interface CodexItem {
  id: number;
  spotId: number;
  name: string;
  locationName: string;
  worldName: string;
  image: string;
  desc: string;
}

export interface CollectedCodexItem {
  id?: number;
  name: string;
  worldName?: string;
  image?: string;
  acquiredAt?: string;
  isRift?: boolean;
}

export interface UserState {
  user_id: string;
  firebase_uid?: string | null;
  email?: string | null;
  display_name?: string | null;
  photo_url?: string | null;
  is_guest?: boolean;
  llm_tokens: number;
  last_token_refill_at?: string;
  current_spot_id: number | null;
  target_spot_id: number | null;
  arrival_time: string | null;
  is_arrived: boolean;
  streak_days?: number;
}

export interface OmikujiMetaInfo {
  poem?: string;
  lucky_direction?: string;
  lucky_number?: number | string;
  categories?: {
    wish?: string;
    love?: string;
    wealth?: string;
    work?: string;
    travel?: string;
    waiting?: string;
  };
}

export interface OmikujiResult {
  history_id: number;
  spot_id: number;
  luck_level: string;
  original_text: string;
  meta_info?: OmikujiMetaInfo;
}

export interface LlmInterpretationResult {
  interpretation: string;
  world_concept_title?: string;
  world_bgm_action?: string;
}

export interface FateHistoryItem {
  history_id: number;
  drawn_at: string;
  spot_id: number | null;
  luck_level: string;
  original_text: string;
  meta_info?: OmikujiMetaInfo;
  user_context?: string | null;
  llm_interpretation?: string | null;
}
