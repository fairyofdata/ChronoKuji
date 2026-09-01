import React, { useState } from 'react';
import { UserState } from './types';
import { AudioEngine } from './audioEngine';
import { useToast } from './Toast';

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
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  isLoggingIn?: boolean;
  onReturnToRift?: () => void;
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
  setIsZenMode,
  onGoogleLogin,
  onGoogleLogout,
  isLoggingIn = false,
  onReturnToRift
}: HeaderProps) {
  const [isAudioMuted, setIsAudioMuted] = useState(AudioEngine.isMuted());
  const { showToast } = useToast();
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const streakDays = userState?.streak_days || 1;
  const isGuest = userState?.is_guest ?? true;

  const handleRestrictedClick = (featureName: string) => {
    showToast({
      type: 'shrine',
      title: `🔒 ${featureName} 열람 제한`,
      message: `${featureName}은 시공간의 성소인 '차원의 균열'에서만 열람할 수 있습니다.`,
      actionText: onReturnToRift ? '성소로 귀환하기' : undefined,
      onAction: onReturnToRift
    });
  };

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

          {/* Codex Button */}
          <button 
            onClick={() => {
              if (userState?.current_spot_id) {
                handleRestrictedClick("차원 럭키 아이템 도감");
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

          {/* Fate History Archive Button */}
          {onOpenHistory && (
            <button
              onClick={() => {
                if (userState?.current_spot_id) {
                  handleRestrictedClick("차원 운명 기록보관소");
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

          {/* Token / Auth Status Badge */}
          {isGuest ? (
            <button
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-50"
              title="구글 로그인하고 20시간마다 1회 무료 AI 심층 풀이를 받으세요"
            >
              {/* Google G Icon */}
              <svg className="w-3.5 h-3.5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoggingIn ? "로그인 중..." : "Google 로그인"}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-purple-950/40 border border-purple-500/40 px-2.5 py-1 rounded-xl text-xs backdrop-blur-md">
              {userState?.photo_url ? (
                <img 
                  src={userState.photo_url} 
                  alt="avatar" 
                  className="w-5 h-5 rounded-full border border-purple-400"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-purple-600 text-[10px] flex items-center justify-center font-bold">
                  {userState?.display_name ? userState.display_name[0] : "U"}
                </span>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-purple-200 max-w-[80px] truncate leading-tight">
                  {userState?.display_name || userState?.email?.split('@')[0] || "회원"}
                </span>
                <span className="text-[9px] text-purple-300 font-semibold flex items-center gap-1">
                  🔮 AI 풀이: <strong className="text-amber-300">{userState?.llm_tokens ?? 0}/1</strong>
                  {tokenTimeLeft > 0 && ` (${formatTime(tokenTimeLeft)})`}
                </span>
              </div>
              <button
                onClick={onGoogleLogout}
                className="text-[10px] text-gray-400 hover:text-red-300 ml-1 p-1 hover:bg-white/5 rounded transition"
                title="로그아웃"
              >
                ✕
              </button>
            </div>
          )}

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
