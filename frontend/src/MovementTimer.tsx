import React, { useState, useEffect, useRef } from 'react';
import { SPOTS, SYSTEM_AUDIO_TRACKS } from './constants';
import { UserState } from './types';
import { parseUtcDate } from './utils/date';
import WarpInteractiveCanvas from './WarpInteractiveCanvas';
import { useLanguage } from './i18n/LanguageContext';

interface MovementTimerProps {
  userState: UserState | null;
  timeLeft: number;
  isAdmin: boolean;
  onArrive: () => void;
  onBrake?: (seconds: number) => void;
}

export default function MovementTimer({ userState, timeLeft, isAdmin, onArrive, onBrake }: MovementTimerProps) {
  const { t, getSpotTranslation, language } = useLanguage();
  const [logIndex, setLogIndex] = useState(0);
  const [totalBrakedSeconds, setTotalBrakedSeconds] = useState(0);
  const [isBrakingPulse, setIsBrakingPulse] = useState(false);
  const hasCountedDownRef = useRef(false);

  const handleBrakeTrigger = (sec: number = 3) => {
    setTotalBrakedSeconds(prev => prev + sec);
    setIsBrakingPulse(true);
    setTimeout(() => setIsBrakingPulse(false), 300);
    onBrake?.(sec);
  };

  const isMoving = userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.current_spot_id;
  const isTargetRift = userState?.target_spot_id === 0;
  const targetSpot = (userState?.target_spot_id !== null && userState?.target_spot_id !== undefined)
    ? SPOTS.find(s => s.id === userState.target_spot_id) 
    : null;
  const targetSpotInfo = targetSpot ? getSpotTranslation(targetSpot.id) : null;
  const targetDisplay = isTargetRift 
    ? t.movement.sanctuaryRift 
    : targetSpotInfo 
    ? `${targetSpotInfo.locationName} (${targetSpotInfo.worldName})` 
    : "";

  // arrival_time 기반 실시간 오차 보정 시간 계산
  const arrivalMs = userState?.arrival_time ? parseUtcDate(userState.arrival_time) : 0;
  const computedSeconds = arrivalMs ? Math.max(0, Math.ceil((arrivalMs - Date.now()) / 1000)) : 0;
  const currentSeconds = timeLeft > 0 ? timeLeft : computedSeconds;

  const progressPercent = Math.min(100, Math.max(0, ((60 - currentSeconds) / 60) * 100));

  // 1. 5초마다 관측 멘트 부드럽게 순환
  useEffect(() => {
    const logsCount = t.movement.spacetimeLogs?.length || 12;
    const interval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % logsCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [t.movement.spacetimeLogs]);

  // 카운트다운 시작 감지 및 도착 자동 트리거 안전망
  useEffect(() => {
    if (currentSeconds > 0) {
      hasCountedDownRef.current = true;
    } else if (isMoving) {
      // 0초에 도달했거나 이미 시간이 지난 상태라면 지체 없이 자동 도착 처리
      const timer = setTimeout(() => {
        onArrive();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSeconds, isMoving]);

  if (!isMoving) return null;

  return (
    <div className="animate-fade-in w-full">
      <div className="bg-black/50 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl shadow-2xl border border-cyan-500/30 flex flex-col items-center space-y-5">
        {/* Header Status */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <div className="flex items-center space-x-2 text-cyan-300 text-base sm:text-lg font-black tracking-tight animate-pulse">
            <span className="text-xl">🚀</span>
            <span>
              [{targetDisplay}] — {t.movement.jumpingTo}
            </span>
          </div>
          <span className="text-[10px] font-bold px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center space-x-1 backdrop-blur-sm shadow">
            <span>⏳</span>
            <span>BGM: {SYSTEM_AUDIO_TRACKS.travel.title}</span>
          </span>
        </div>
        
        {/* Destination Visual Core with Interactive Spacetime Canvas */}
        <div className="w-full h-36 sm:h-44 rounded-2xl overflow-hidden relative border border-cyan-500/30 shadow-2xl group">
          <img 
            src={isTargetRift ? "/assets/worlds/lobby_rift.jpg?v=2" : (targetSpot?.bgImage || "/assets/worlds/lobby_rift.jpg?v=2")} 
            alt="목적지" 
            className="w-full h-full object-cover filter brightness-90 animate-pulse transition duration-1000" 
          />
          {/* Interactive Spacetime Ripple Canvas with Regenerative Braking */}
          <WarpInteractiveCanvas onBrake={handleBrakeTrigger} />

          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex items-end justify-between p-3.5 z-20 pointer-events-none">
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block flex items-center space-x-1">
                <span>⚡</span>
                <span>{t.movement.brakeCanvasHint}</span>
              </span>
              <span className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                {targetDisplay}
              </span>
            </div>
            <span className="text-[10px] font-bold text-yellow-300 bg-black/60 px-2 py-0.5 rounded-md border border-yellow-500/30">
              {Math.round(progressPercent)}% {t.movement.warpProgress}
            </span>
          </div>
        </div>

        {/* Warp Stream Progress Gauge */}
        <div className="w-full bg-gray-950 rounded-full h-4 border border-cyan-500/30 overflow-hidden shadow-inner relative p-0.5">
          <div 
            className={`bg-gradient-to-r from-purple-600 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-linear relative overflow-hidden ${isBrakingPulse ? 'brightness-150' : ''}`}
            style={{ width: `${progressPercent}%` }}
          >
            {/* Warp Light Streaks Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Countdown & Auto-Arrival Indicator */}
        <div className="flex flex-col items-center space-y-1">
          {currentSeconds > 0 ? (
            <>
              <div className="flex items-baseline space-x-2">
                <p className="text-4xl sm:text-5xl font-mono text-white font-black tracking-widest drop-shadow-lg">
                  {currentSeconds}<span className="text-base font-normal text-cyan-400 ml-1">{t.movement.seconds}</span>
                </p>
                {totalBrakedSeconds > 0 && (
                  <span className="text-xs font-mono font-bold text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-2 py-0.5 rounded-full animate-bounce">
                    ⚡ -{totalBrakedSeconds}s {t.movement.brakedBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {t.movement.cruisingHint}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <div className="flex items-center space-x-2 text-yellow-300 animate-pulse text-sm sm:text-base font-black">
                <span>✨ {t.movement.arrivingSoon}</span>
              </div>
              <button
                type="button"
                onClick={onArrive}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center space-x-1.5 animate-bounce"
              >
                <span>⛩️</span>
                <span>
                  {language === 'en' ? 'Enter Dimension' : language === 'ja' ? '次元突入 (Enter)' : '차원 진입하기 (Enter)'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Regenerative Warp Braking Dedicated Control Pad */}
        <div className={`w-full bg-gradient-to-r from-cyan-950/60 via-blue-950/60 to-purple-950/60 border rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col space-y-2.5 transition-all duration-200 ${isBrakingPulse ? 'border-cyan-300 shadow-cyan-500/20 scale-[1.01]' : 'border-cyan-500/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-base">⚡</span>
              <span className="text-xs sm:text-sm font-black text-cyan-200 tracking-tight">
                {t.movement.regenBrakingTitle}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-300">
              {t.movement.absorbingEnergy}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleBrakeTrigger(3)}
            disabled={currentSeconds <= 0}
            className="w-full relative overflow-hidden group py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-purple-600/30 border border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
          >
            <span className="text-base group-hover:scale-125 transition-transform duration-200">⚡</span>
            <span className="text-xs sm:text-sm font-black text-cyan-100 group-hover:text-white">
              {t.movement.regenBrakingButton}
            </span>
            <span className="text-[10px] text-yellow-300 font-extrabold bg-black/50 px-2 py-0.5 rounded border border-yellow-500/30">
              {t.movement.regenBrakingSpeed}
            </span>
          </button>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            {t.movement.regenBrakingDesc}
          </p>
        </div>

        {/* Spacetime Lore & Hint Flip Card (15-Second Stepwise Lore) */}
        <div className="w-full bg-gradient-to-r from-cyan-950/40 via-black/70 to-purple-950/40 border border-cyan-500/30 rounded-2xl p-4 text-left shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
              <span>📡</span>
              <span>
                {currentSeconds > 45 ? t.movement.phase1 :
                 currentSeconds > 30 ? t.movement.phase2 :
                 currentSeconds > 15 ? t.movement.phase3 :
                 t.movement.phase4}
              </span>
            </span>
            <span className="text-[9px] font-mono text-gray-400">
              {currentSeconds > 45 ? "1/4" : currentSeconds > 30 ? "2/4" : currentSeconds > 15 ? "3/4" : "4/4"}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-cyan-100 leading-relaxed min-h-[38px] flex items-center">
            {currentSeconds > 45 
              ? (typeof t.movement.phase1Desc === 'function' ? t.movement.phase1Desc(targetSpotInfo?.worldName || t.movement.sanctuaryRift) : (t.movement.phase1Desc || 'Traversing dimensional event horizon...'))
              : currentSeconds > 30
              ? (typeof t.movement.phase2Desc === 'function' ? t.movement.phase2Desc(targetSpotInfo?.luckyItem || "Piece of Miracle") : (t.movement.phase2Desc || 'Synching temporal frequency resonance...'))
              : currentSeconds > 15
              ? (typeof t.movement.phase3Desc === 'function' ? t.movement.phase3Desc(targetSpotInfo?.locationName || targetDisplay) : (t.movement.phase3Desc || 'Materializing world coordinates...'))
              : (typeof t.movement.phase4Desc === 'function' ? t.movement.phase4Desc(targetSpotInfo?.locationName || targetDisplay) : (t.movement.phase4Desc || 'Final atmospheric entry & landing...'))}
          </p>
        </div>

        {/* 5-Second Periodic Spacetime Calibration Log */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-center shadow-inner flex items-center justify-center min-h-[46px] transition-all duration-500">
          <p className="text-xs font-bold text-cyan-200 animate-fade-in tracking-wide leading-relaxed">
            {t.movement.spacetimeLogs?.[logIndex % (t.movement.spacetimeLogs?.length || 1)]}
          </p>
        </div>

        {/* Admin Instant Arrive Bypass Button */}
        {isAdmin && (
          <button 
            onClick={onArrive}
            className="text-xs text-amber-300 font-bold px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/50 hover:bg-amber-900 transition"
          >
            {t.movement.adminInstant}
          </button>
        )}
      </div>
    </div>
  );
}
