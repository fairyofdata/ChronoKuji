import React, { useState, useEffect, useRef } from 'react';
import { SPOTS, SYSTEM_AUDIO_TRACKS } from './constants';
import { UserState } from './types';
import { parseUtcDate } from './utils/date';
import WarpInteractiveCanvas from './WarpInteractiveCanvas';

interface MovementTimerProps {
  userState: UserState | null;
  timeLeft: number;
  isAdmin: boolean;
  onArrive: () => void;
}

// 5초마다 순환되는 시공간 차원 관측 로그 멘트 목록
const SPACETIME_LOGS = [
  "🌀 시공간 위상 왜곡 장치 가동... 차원 막을 통과합니다.",
  "📡 현지 타임라인 중력장 및 크로노 파동 교정 중...",
  "⚛️ 양자 얽힘 좌표 동기화 진행 중... 미지의 주파수 수신.",
  "🛡️ 차원 회랑의 타임 패러독스 방어막 전개 완료.",
  "🌌 도착지 세계관의 국소적 엔트로피 역전 현상 감지...",
  "⏳ 과거와 미래의 인과율 축 정렬 중... 시공간 위상 동기화.",
  "🥠 운명의 산통(神籤) 공명 주파수와 차원 링크 연결...",
  "🚀 초공간 도약 추진체 임계 출력 유지 중...",
  "🔮 목적지 차원의 운명장(Fate Matrix) 스캔 진행 중...",
  "⚡ 시공간 감속 개시... 차원 브레이크 작동 중.",
  "🎯 현지 대기권 및 시공간 좌표 록온 완료!",
  "✨ 차원 게이트 개방 임박! 목적지에 안전하게 안착합니다..."
];

export default function MovementTimer({ userState, timeLeft, isAdmin, onArrive }: MovementTimerProps) {
  const [logIndex, setLogIndex] = useState(0);
  const isAutoArrivingRef = useRef(false);
  const hasCountedDownRef = useRef(false);

  const isMoving = userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.is_arrived;
  const isTargetRift = userState?.target_spot_id === 0;
  const targetSpot = (userState?.target_spot_id !== null && userState?.target_spot_id !== undefined)
    ? SPOTS.find(s => s.id === userState.target_spot_id) 
    : null;

  // arrival_time 기반 실시간 오차 보정 시간 계산
  const arrivalMs = userState?.arrival_time ? parseUtcDate(userState.arrival_time) : 0;
  const computedSeconds = arrivalMs ? Math.max(0, Math.ceil((arrivalMs - Date.now()) / 1000)) : 0;
  const currentSeconds = timeLeft > 0 ? timeLeft : computedSeconds;

  const progressPercent = Math.min(100, Math.max(0, ((60 - currentSeconds) / 60) * 100));

  // 1. 5초마다 관측 멘트 부드럽게 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % SPACETIME_LOGS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. 카운트다운 시작 감지
  useEffect(() => {
    if (currentSeconds > 0) {
      hasCountedDownRef.current = true;
    }
  }, [currentSeconds]);

  // 3. 0초 도달 시에만 안전하게 자동 진입 (마운트 직후 0초 오작동 원천 차단)
  useEffect(() => {
    if (isMoving && currentSeconds <= 0 && hasCountedDownRef.current && !isAutoArrivingRef.current) {
      isAutoArrivingRef.current = true;
      const timer = setTimeout(() => {
        onArrive();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentSeconds, isMoving, onArrive]);

  if (!isMoving) return null;

  return (
    <div className="animate-fade-in w-full">
      <div className="bg-black/50 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl shadow-2xl border border-cyan-500/30 flex flex-col items-center space-y-5">
        {/* Header Status */}
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <div className="flex items-center space-x-2 text-cyan-300 text-base sm:text-lg font-black tracking-tight animate-pulse">
            <span className="text-xl">🚀</span>
            <span>
              [{isTargetRift ? "차원의 균열 (성소)" : `${targetSpot?.locationName} (${targetSpot?.worldName})`}] (으)로 도약 중...
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
          {/* Interactive Spacetime Ripple Canvas */}
          <WarpInteractiveCanvas />

          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex items-end justify-between p-3.5 z-20 pointer-events-none">
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block">
                Target Dimension • 탭하여 시공간 파동 발생
              </span>
              <span className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                {isTargetRift ? "차원의 균열 성소" : `${targetSpot?.locationName} (${targetSpot?.worldName})`}
              </span>
            </div>
            <span className="text-[10px] font-bold text-yellow-300 bg-black/60 px-2 py-0.5 rounded-md border border-yellow-500/30">
              {Math.round(progressPercent)}% 도약
            </span>
          </div>
        </div>

        {/* Warp Stream Progress Gauge */}
        <div className="w-full bg-gray-950 rounded-full h-4 border border-cyan-500/30 overflow-hidden shadow-inner relative p-0.5">
          <div 
            className="bg-gradient-to-r from-purple-600 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear relative overflow-hidden"
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
              <p className="text-4xl sm:text-5xl font-mono text-white font-black tracking-widest drop-shadow-lg">
                {currentSeconds}<span className="text-base font-normal text-cyan-400 ml-1">초</span>
              </p>
              <p className="text-xs text-gray-400 font-medium">
                시공간 궤도를 항해하고 있습니다. (화면을 탭해보세요 ✨)
              </p>
            </>
          ) : (
            <div className="flex items-center space-x-2 py-2 text-yellow-300 animate-pulse text-base font-black">
              <span>✨ 차원 진입 중... 잠시 후 자동 안착합니다.</span>
            </div>
          )}
        </div>

        {/* Spacetime Lore & Hint Flip Card (15-Second Stepwise Lore) */}
        <div className="w-full bg-gradient-to-r from-cyan-950/40 via-black/70 to-purple-950/40 border border-cyan-500/30 rounded-2xl p-4 text-left shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
              <span>📡</span>
              <span>
                {currentSeconds > 45 ? "Phase 1: 차원 좌표 록온" :
                 currentSeconds > 30 ? "Phase 2: 행운의 아이템 공명" :
                 currentSeconds > 15 ? "Phase 3: 현지 시공간 이스터에그" :
                 "Phase 4: 감속 궤도 및 게이트 안착"}
              </span>
            </span>
            <span className="text-[9px] font-mono text-gray-400">
              {currentSeconds > 45 ? "1/4" : currentSeconds > 30 ? "2/4" : currentSeconds > 15 ? "3/4" : "4/4"}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-cyan-100 leading-relaxed min-h-[38px] flex items-center">
            {currentSeconds > 45 
              ? `🌌 [${targetSpot?.worldName || "성소"}]의 시공간 중력장에 진입 중입니다. 엔트로피 역전 현상을 주의하세요.`
              : currentSeconds > 30
              ? `🎁 이 차원에는 전설의 럭키 아이템 [${targetSpot?.luckyItem || "기적의 조각"}]의 파동이 강하게 감지됩니다.`
              : currentSeconds > 15
              ? `💡 조언: "${targetSpot?.locationName}"에 안착 후 산통을 흔들면 최상의 운명이 응답할 것입니다.`
              : `🎯 차원 게이트 개방 완료! 이제 안전하게 ${targetSpot?.locationName || "목적지"}에 발을 디딥니다...`}
          </p>
        </div>

        {/* 5-Second Periodic Spacetime Calibration Log */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-center shadow-inner flex items-center justify-center min-h-[46px] transition-all duration-500">
          <p className="text-xs font-bold text-cyan-200 animate-fade-in tracking-wide leading-relaxed">
            {SPACETIME_LOGS[logIndex]}
          </p>
        </div>

        {/* Admin Instant Arrive Bypass Button */}
        {isAdmin && (
          <button 
            onClick={onArrive}
            className="text-xs text-amber-300 font-bold px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/50 hover:bg-amber-900 transition"
          >
            ⚡ [관리자 치트] 즉시 워프 완료
          </button>
        )}
      </div>
    </div>
  );
}
