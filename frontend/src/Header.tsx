import React, { useState } from 'react';
import { UserState } from './types';
import { AudioEngine } from './audioEngine';

interface HeaderProps {
  userState: UserState | null;
  isAdmin: boolean;
  setIsAdmin: (val: boolean | ((prev: boolean) => boolean)) => void;
  tokenTimeLeft: number;
  onOpenCodex: () => void;
  onOpenHistory: () => void;
  codexCount: number;
  isCodexComplete: boolean;
  isZenMode: boolean;
  setIsZenMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Header({ 
  userState, 
  isAdmin, 
  setIsAdmin, 
  tokenTimeLeft,
  onOpenCodex,
  onOpenHistory,
  codexCount = 0,
  isCodexComplete = false,
  isZenMode = false,
  setIsZenMode
}: HeaderProps) {
  const [isAudioMuted, setIsAudioMuted] = useState(AudioEngine.isMuted());
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}시간 ` : ''}${m}분 ${s}초`;
  };

  const streakDays = userState?.streak_days || 1;

  return (
    <header className="relative z-30 p-3 sm:p-4 bg-black/40 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
        {/* Project Title with Portal Icon */}
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl sm:text-3xl animate-spin-slow">🔮</span>
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 tracking-tight drop-shadow-sm">
              ChronoKuji
            </h1>
            <p className="text-[10px] sm:text-xs text-purple-300 font-medium tracking-wide">
              시공간을 넘나드는 멀티버스 AI 오미쿠지
            </p>
          </div>
        </div>

        {/* Status Bar & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Zen View Mode Toggle */}
          <button
            onClick={() => setIsZenMode && setIsZenMode(prev => !prev)}
            className={`flex items-center space-x-1 border px-2.5 py-1.5 rounded-xl text-xs font-bold transition backdrop-blur-md shadow-sm ${
              isZenMode 
                ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse' 
                : 'bg-black/40 hover:bg-black/60 border-white/10 text-gray-300 hover:text-white'
            }`}
            title="UI를 숨기고 고화질 아트워크와 BGM만 감상합니다"
          >
            <span>🖼️</span>
            <span>{isZenMode ? "UI 복귀" : "감상 모드"}</span>
          </button>

          {/* Daily Streak Badge */}
          <div className="flex items-center space-x-1 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 shadow">
            <span>🔥</span>
            <span>{streakDays}일 연속 접속</span>
          </div>

          {/* Codex Button (차원의 균열 성소에서만 열람 가능) */}
          <button 
            onClick={() => {
              if (userState?.current_spot_id) {
                alert("📖 [차원 럭키 아이템 도감]은 시공간의 성소인 '차원의 균열'에서만 열람할 수 있습니다.\n\n아래 워프 메뉴에서 '차원의 균열로 귀환'을 선택해 이동하세요.");
              } else {
                onOpenCodex();
              }
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border transition shadow-md text-xs font-bold ${
              isCodexComplete 
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse' 
                : userState?.current_spot_id 
                  ? 'bg-black/30 border-white/5 text-gray-500 hover:text-gray-400' 
                  : 'bg-black/50 hover:bg-black/70 border-purple-500/50 text-purple-300 shadow-purple-500/20 shadow'
            }`}
            title={userState?.current_spot_id ? "차원의 균열에서만 열람 가능" : "차원 럭키 아이템 도감"}
          >
            <span>{userState?.current_spot_id ? "🔒" : "📖"}</span>
            <span>도감</span>
            <span className="text-amber-400 font-black">({codexCount}/11)</span>
          </button>

          {/* Fate History Archive Button (차원의 균열 성소에서만 열람 가능) */}
          {onOpenHistory && (
            <button
              onClick={() => {
                if (userState?.current_spot_id) {
                  alert("📜 [차원 운명 기록보관소]는 시공간의 성소인 '차원의 균열'에서만 열람할 수 있습니다.\n\n아래 워프 메뉴에서 '차원의 균열로 귀환'을 선택해 이동하세요.");
                } else {
                  onOpenHistory();
                }
              }}
              className={`flex items-center space-x-1 border px-3 py-1.5 rounded-xl text-xs font-bold transition backdrop-blur-md shadow-sm ${
                userState?.current_spot_id 
                  ? 'bg-black/30 border-white/5 text-gray-500 hover:text-gray-400' 
                  : 'bg-black/50 hover:bg-black/70 border-cyan-500/50 text-cyan-300 shadow-cyan-500/20 shadow'
              }`}
              title={userState?.current_spot_id ? "차원의 균열에서만 열람 가능" : "과거 점괘 및 AI 해석 기록 조회"}
            >
              <span>{userState?.current_spot_id ? "🔒" : "📜"}</span>
              <span>기록</span>
            </button>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              const muted = AudioEngine.toggleMute();
              setIsAudioMuted(muted);
            }}
            className="flex items-center space-x-1 bg-black/40 hover:bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs transition backdrop-blur-md shadow-sm"
            title="배경음악 ON/OFF"
          >
            <span>{isAudioMuted ? "🔇" : "🔊"}</span>
          </button>

          {/* Token Status Badge */}
          <div className="flex items-center space-x-1.5 bg-black/50 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm">
            <span>🔮 토큰:</span>
            <span className="text-purple-300 font-extrabold">{userState?.llm_tokens ?? 3}/3</span>
            {tokenTimeLeft > 0 && (
              <span className="text-[10px] text-gray-400 font-mono ml-1">
                ({formatTime(tokenTimeLeft)})
              </span>
            )}
          </div>

          {/* Admin Toggle */}
          <button 
            onClick={() => setIsAdmin(prev => !prev)}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition backdrop-blur-md ${
              isAdmin 
                ? 'bg-red-950/80 border-red-500 text-red-300 shadow-red-500/30 shadow' 
                : 'bg-black/40 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            {isAdmin ? "⚡ 관리자 ON" : "관리자"}
          </button>
        </div>
      </div>
    </header>
  );
}
