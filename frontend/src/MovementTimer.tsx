import React, { useState, useEffect, useRef } from 'react';
import { SPOTS, SYSTEM_AUDIO_TRACKS } from './constants';
import { UserState } from './types';
import { parseUtcDate } from './utils/date';

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
        
        {/* Destination Visual Core */}
        <div className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden relative border border-cyan-500/30 shadow-2xl group">
          <img 
            src={isTargetRift ? "/assets/worlds/lobby_rift.jpg?v=2" : (targetSpot?.bgImage || "/assets/worlds/lobby_rift.jpg?v=2")} 
            alt="목적지" 
            className="w-full h-full object-cover filter brightness-90 animate-pulse transition duration-1000" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex items-end justify-between p-3">
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block">
                Target Dimension
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
          {timeLeft > 0 ? (
            <>
              <p className="text-4xl sm:text-5xl font-mono text-white font-black tracking-widest drop-shadow-lg">
                {timeLeft}<span className="text-base font-normal text-cyan-400 ml-1">초</span>
              </p>
              <p className="text-xs text-gray-400 font-medium">
                시공간 궤도를 항해하고 있습니다.
              </p>
            </>
          ) : (
            <div className="flex items-center space-x-2 py-2 text-yellow-300 animate-pulse text-base font-black">
              <span>✨ 차원 진입 중... 잠시 후 자동 안착합니다.</span>
            </div>
          )}
        </div>

        {/* 5-Second Periodic Spacetime Calibration Log */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-center shadow-inner flex items-center justify-center min-h-[50px] transition-all duration-500">
          <p className="text-xs sm:text-sm font-bold text-cyan-200 animate-fade-in tracking-wide leading-relaxed">
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
