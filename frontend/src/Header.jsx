import React, { useState, useEffect } from 'react';
import { AudioEngine } from './audioEngine';

export default function Header({ userState, handleAdminLogin, onOpenCodex, codexCount = 0, isCodexComplete = false, onToggleZen, onOpenHistory }) {
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [streakDays, setStreakDays] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(AudioEngine.isMuted());

  // 1. 연속 출석(Daily Streak) 계산
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('omikuz_last_visit_date');
    let currentStreak = parseInt(localStorage.getItem('omikuz_streak_days') || '1', 10);

    if (lastVisit) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastVisit === yesterday) {
        currentStreak += 1;
        localStorage.setItem('omikuz_streak_days', currentStreak.toString());
      } else if (lastVisit !== today) {
        currentStreak = 1;
        localStorage.setItem('omikuz_streak_days', '1');
      }
    }
    localStorage.setItem('omikuz_last_visit_date', today);
    setStreakDays(currentStreak);
  }, []);

  // 2. 실시간 토큰 리필 쿨다운 카운트다운 (20시간 주기)
  useEffect(() => {
    if (!userState?.tokens_updated_at) {
      setTimeLeftStr("완충됨");
      return;
    }

    const updateCooldown = () => {
      const lastRefill = new Date(userState.tokens_updated_at).getTime();
      const nextRefill = lastRefill + (20 * 60 * 60 * 1000); // 20시간 후
      const diff = nextRefill - Date.now();

      if (diff <= 0 || (userState.llm_tokens >= 3)) {
        setTimeLeftStr("완충됨");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [userState]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Token Display & Cooldown */}
          <div className="flex items-center space-x-1.5 bg-gray-800/90 px-3 py-1.5 rounded-xl border border-gray-700 shadow-md">
            <span className="text-xs text-gray-400">🎟️ 토큰:</span>
            <span className="text-purple-400 font-black text-sm">{userState ? userState.llm_tokens : 0}개</span>
            <span className="text-[10px] text-gray-400 font-mono pl-1 border-l border-gray-700">
              {timeLeftStr === "완충됨" ? "✨ 완충" : `⏳ ${timeLeftStr}`}
            </span>
          </div>

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

          {/* Zen Cinema Mode Button */}
          {onToggleZen && (
            <button
              onClick={onToggleZen}
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-400/30 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-200 transition backdrop-blur-md shadow-sm hover:scale-105"
              title="UI를 숨기고 고화질 세계관 일러스트 감상"
            >
              <span>🖼️</span>
              <span className="hidden sm:inline">감상 모드</span>
            </button>
          )}
        </div>
        
        <button 
          onClick={handleAdminLogin}
          className="text-xl opacity-40 hover:opacity-100 transition-opacity p-2"
          title="관리자 설정"
        >
          ⚙️
        </button>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 mb-1 animate-slide-up tracking-tight drop-shadow-2xl">
        🔮 ChronoKuji
      </h1>
      <p className="text-gray-300/90 text-sm sm:text-base font-medium animate-slide-up mb-6 drop-shadow" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        시공간을 넘나드는 멀티버스 AI 오미쿠지
      </p>
    </div>
  );
}