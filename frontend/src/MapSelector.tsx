import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SPOTS } from './constants';
import { UserState } from './types';
import { AudioEngine } from './audioEngine';

interface MapSelectorProps {
  userState: UserState | null;
  selectedSpot: number;
  setSelectedSpot: (id: number) => void;
  onStartMove: (customSpotId?: number) => void;
  isCodexComplete?: boolean;
  isAdmin?: boolean;
}

export default function MapSelector({ 
  userState, 
  selectedSpot, 
  setSelectedSpot, 
  onStartMove, 
  isCodexComplete = false,
  isAdmin = false
}: MapSelectorProps) {
  // 뷰 모드: 'coverflow' (3D 플로팅 마법 카드 덱) vs 'grid' (매트릭스 그리드)
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');

  const currentSpot = userState?.current_spot_id 
    ? SPOTS.find(s => s.id === userState.current_spot_id) 
    : null;

  // 활성 선택된 스팟 인덱스
  const activeSpotIndex = Math.max(0, SPOTS.findIndex(s => s.id === selectedSpot));
  const activeSpot = SPOTS[activeSpotIndex] || SPOTS[0];

  // 터치 / 드래그 스와이프 제어
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // 카드 변경 시 효과음 재생 및 선택 반영
  const handleSelectIndex = useCallback((newIndex: number, direction: 'left' | 'right' | 'select' = 'select') => {
    if (newIndex < 0 || newIndex >= SPOTS.length) return;
    const target = SPOTS[newIndex];
    if (target.id !== selectedSpot) {
      setSelectedSpot(target.id);
      AudioEngine.playDimensionalSwipeSound(direction);
    }
  }, [selectedSpot, setSelectedSpot]);

  const handlePrev = useCallback(() => {
    const nextIdx = (activeSpotIndex - 1 + SPOTS.length) % SPOTS.length;
    handleSelectIndex(nextIdx, 'left');
  }, [activeSpotIndex, handleSelectIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeSpotIndex + 1) % SPOTS.length;
    handleSelectIndex(nextIdx, 'right');
  }, [activeSpotIndex, handleSelectIndex]);

  // 키보드 좌우 화살표로 카드 넘기기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'coverflow') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handlePrev, handleNext]);

  // 터치 스와이프 핸들러 (모바일 OS 넘기기 인터랙션)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (touchDeltaX.current < -45) {
      handleNext();
    } else if (touchDeltaX.current > 45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // 마우스 드래그 스와이프 핸들러 (데스크탑)
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    touchDeltaX.current = 0;
    isDragging.current = true;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    touchDeltaX.current = e.clientX - touchStartX.current;
  };

  const onMouseUp = () => {
    if (isDragging.current && touchStartX.current !== null) {
      if (touchDeltaX.current < -50) {
        handleNext();
      } else if (touchDeltaX.current > 50) {
        handlePrev();
      }
    }
    isDragging.current = false;
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="w-full flex flex-col space-y-5 animate-fade-in select-none">
      {/* 1. Current Spacetime Status HUD */}
      <div className="bg-black/45 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl shadow-2xl border border-purple-500/20 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl animate-pulse">🌌</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-300">
              Spacetime Coordinates
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200">
            {currentSpot ? `📍 현위치: ${currentSpot.locationName} (${currentSpot.worldName})` : "⛩️ 차원의 균열 (성소)"}
          </span>
        </div>

        {currentSpot ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <img 
              src={currentSpot.bgImage} 
              alt={currentSpot.name} 
              className="w-full h-44 sm:h-56 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex flex-col justify-end p-5 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-purple-600 text-white shadow">
                  {currentSpot.worldName}
                </span>
                {currentSpot.bgmTitle && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 text-purple-300">
                    🎵 {currentSpot.bgmTitle}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                {currentSpot.locationName}
              </h2>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-black/60 border border-dashed border-purple-500/30 text-center">
            <p className="text-purple-200 font-extrabold text-base sm:text-lg mb-1">
              ✨ 차원의 균열 성소에 머물고 있습니다
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              공중에 떠 있는 마법사 카드를 넘기며 도약할 멀티버스 시공간을 선택하세요.
            </p>
          </div>
        )}
      </div>

      {/* 2. Multiverse Dimensional Portal Area */}
      <div className="bg-black/45 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl shadow-2xl border border-white/10 flex flex-col space-y-5 text-left relative overflow-hidden">
        
        {/* Header with Mode Toggle & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔮</span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {viewMode === 'coverflow' ? '3D 차원장 플로팅 카드 덱' : '차원 게이트 매트릭스'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-purple-300/80 font-medium mt-0.5">
              {viewMode === 'coverflow' 
                ? '좌우로 다라라락 넘겨 차원장의 균열을 조율하세요 (스와이프 / 방향키)' 
                : '도약할 목표 세계관의 장소를 록온(Lock-on)하세요'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {(isCodexComplete || isAdmin) && (
              <span className="text-[11px] text-amber-300 font-bold bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40 animate-pulse">
                ⭐ 5차원 해금
              </span>
            )}

            {/* View Mode Toggle Button */}
            <div className="flex items-center bg-purple-950/60 p-1 rounded-xl border border-purple-500/40">
              <button
                onClick={() => {
                  setViewMode('coverflow');
                  AudioEngine.playDimensionalSwipeSound('select');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'coverflow'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="공중에 뜬 마법사 카드 덱 넘기기"
              >
                <span>🎴</span>
                <span>3D 덱</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('grid');
                  AudioEngine.playDimensionalSwipeSound('select');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="전체 12개 차원 한눈에 보기"
              >
                <span>⊞</span>
                <span>그리드</span>
              </button>
            </div>
          </div>
        </div>

        {/* ----------------- MODE A: 3D FLOATING COVER FLOW ----------------- */}
        {viewMode === 'coverflow' ? (
          <div 
            className="relative w-full flex flex-col items-center justify-center py-6 sm:py-8 overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Ambient Background Aura behind cards */}
            <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-600/25 to-pink-500/20 blur-3xl pointer-events-none -top-10 animate-pulse" />

            {/* 3D Perspective Stage Container */}
            <div 
              className="relative w-full h-[380px] sm:h-[420px] flex items-center justify-center"
              style={{
                perspective: '1100px',
                perspectiveOrigin: '50% 50%',
                transformStyle: 'preserve-3d'
              }}
            >
              {SPOTS.map((spot, index) => {
                const offset = index - activeSpotIndex;
                const isCenter = offset === 0;
                const isCurrent = userState?.current_spot_id === spot.id;
                const isLocked = spot.isHidden && !isCodexComplete && !isAdmin;
                const orderNum = String(index + 1).padStart(2, '0');

                // 오프셋이 너무 멀면 렌더링 부하 절감을 위해 투명화
                if (Math.abs(offset) > 3) {
                  return null;
                }

                // 3D 공간 배치 수치 계산 (모바일/데스크탑 반응형)
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                const stepX = isMobile ? 120 : 180;
                const translateX = offset * stepX;
                const translateZ = isCenter ? 60 : -Math.abs(offset) * (isMobile ? 110 : 140);
                const rotateY = isCenter ? 0 : offset * (isMobile ? -36 : -42);
                const scale = isCenter ? 1.05 : Math.max(0.68, 1 - Math.abs(offset) * 0.16);
                const opacity = isCenter ? 1 : Math.max(0.25, 1 - Math.abs(offset) * 0.35);
                const zIndex = 50 - Math.abs(offset) * 10;

                return (
                  <div
                    key={spot.id}
                    onClick={() => {
                      if (!isCenter) {
                        handleSelectIndex(index, offset > 0 ? 'right' : 'left');
                      }
                    }}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                      transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease'
                    }}
                    className={`absolute w-64 sm:w-72 h-[340px] sm:h-[370px] rounded-3xl p-3 flex flex-col justify-between cursor-pointer select-none transition-shadow ${
                      isCenter 
                        ? 'animate-float-card ring-2 ring-cyan-400/90 shadow-[0_0_40px_rgba(34,211,238,0.45)]' 
                        : 'hover:brightness-125'
                    } ${
                      isLocked
                        ? 'bg-gradient-to-b from-purple-950/70 via-gray-900/90 to-black/95 border border-purple-500/40'
                        : 'bg-gradient-to-b from-gray-900/90 via-black/85 to-gray-950 border border-white/20'
                    }`}
                  >
                    {/* Holographic Border Shine for Center Active Card */}
                    {isCenter && (
                      <div className="absolute inset-0 rounded-3xl pointer-events-none holo-card-glow opacity-30 mix-blend-screen" />
                    )}

                    {/* Card Inner Content */}
                    {isLocked ? (
                      // 12번 잠긴 히든 스팟
                      <div className="w-full h-full flex flex-col justify-between p-4 text-center rounded-2xl bg-black/40 border border-purple-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl animate-pulse">🌌</span>
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300">
                            #{orderNum}
                          </span>
                        </div>

                        <div className="my-auto space-y-2">
                          <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-3xl animate-spin-slow">
                            🔒
                          </div>
                          <h4 className="text-base font-black text-amber-300">??? 차원의 틈새</h4>
                          <p className="text-xs text-purple-200/70 italic px-2">
                            "모든 11대 차원의 흔적을 모은 자만이 열 수 있는 미지의 시공간"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-purple-500/30">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/90 px-3 py-1 rounded-full border border-amber-500/50">
                            도감 11종 수집 시 개방
                          </span>
                        </div>
                      </div>
                    ) : (
                      // 일반 오픈 스팟 카드
                      <div className="w-full h-full flex flex-col justify-between rounded-2xl overflow-hidden relative">
                        {/* Spot Background Image */}
                        <div className="w-full h-44 sm:h-52 relative overflow-hidden rounded-xl">
                          <img 
                            src={spot.bgImage} 
                            alt={spot.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/30 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                            {isCurrent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-600 text-white shadow-md">
                                📍 현위치
                              </span>
                            )}
                            {isCenter && !isCurrent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-400 text-black shadow-md animate-pulse">
                                🎯 록온됨
                              </span>
                            )}
                            {spot.isHidden && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-black shadow-md">
                                ⭐ 테서렉트
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-black/80 border border-white/20 text-gray-200">
                              #{orderNum}
                            </span>
                          </div>

                          {/* Lucky Item pill */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[11px] text-gray-200 flex items-center justify-between">
                              <span className="text-amber-300 font-bold truncate">🎁 {spot.luckyItem}</span>
                              <span className="text-[9px] text-purple-300 uppercase">Lucky</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Meta */}
                        <div className="p-3 bg-gradient-to-b from-gray-950/80 to-black rounded-xl flex flex-col justify-between flex-1 mt-2 border border-white/5">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                                {spot.worldName}
                              </span>
                              {spot.bgmTitle && (
                                <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                                  🎵 {spot.bgmTitle}
                                </span>
                              )}
                            </div>
                            <h4 className="text-base sm:text-lg font-black text-white truncate mt-0.5 drop-shadow">
                              {spot.locationName}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">도약 소요</span>
                            <span className="text-cyan-300 font-bold">⚡ 60초</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Left / Right Quick Orbit Buttons & Dots Indicator */}
            <div className="w-full flex items-center justify-between max-w-sm px-4 mt-3 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="w-10 h-10 rounded-full bg-black/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 flex items-center justify-center text-lg transition active:scale-90 shadow-lg hover:border-cyan-400"
                title="이전 차원 (← 키)"
              >
                ◀
              </button>

              {/* Dots bar */}
              <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-[200px] custom-scrollbar">
                {SPOTS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectIndex(idx, idx > activeSpotIndex ? 'right' : 'left');
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeSpotIndex
                        ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                    title={s.locationName}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="w-10 h-10 rounded-full bg-black/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 flex items-center justify-center text-lg transition active:scale-90 shadow-lg hover:border-cyan-400"
                title="다음 차원 (→ 키)"
              >
                ▶
              </button>
            </div>
          </div>
        ) : (
          /* ----------------- MODE B: CLASSIC 4-COLUMN MATRIX GRID ----------------- */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4 max-h-[620px] overflow-y-auto pr-1.5 custom-scrollbar">
            {SPOTS.map((spot, index) => {
              const isCurrent = userState?.current_spot_id === spot.id;
              const isSelected = selectedSpot === spot.id;
              const isLocked = spot.isHidden && !isCodexComplete && !isAdmin;
              const orderNum = String(index + 1).padStart(2, '0');

              if (isLocked) {
                return (
                  <div
                    key={spot.id}
                    className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-black/80 p-3.5 flex flex-col justify-between cursor-not-allowed select-none min-h-[190px] group shadow-inner"
                    title="소문에 의하면 다른 차원에 모두 다녀온 자만이 이동할 수 있는 특별한 차원의 틈새가 있다고 하는데..."
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xl animate-pulse">🌌</span>
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-black/80 border border-purple-500/30 text-purple-300">
                        #{orderNum}
                      </span>
                    </div>

                    <div className="my-auto py-2 text-center flex flex-col items-center space-y-1.5">
                      <span className="text-xs font-black text-amber-300/90 tracking-wide">
                        ??? 차원의 틈새
                      </span>
                      <p className="text-[10px] text-purple-200/70 italic leading-relaxed px-1 font-medium">
                        "소문에 의하면 다른 차원에 모두 다녀온 자만이 이동할 수 있는 특별한 차원의 틈새가 있다고 하는데..."
                      </p>
                    </div>

                    <div className="pt-2 border-t border-purple-500/20 flex items-center justify-center">
                      <span className="text-[9px] font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                        🔒 도감 11종 수집 시 개방
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    if (!isCurrent) {
                      handleSelectIndex(index, 'select');
                    }
                  }}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer select-none group min-h-[190px] ${
                    isCurrent
                      ? 'border-purple-500/40 opacity-70 cursor-default ring-1 ring-purple-500/30'
                      : isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/80 shadow-lg shadow-cyan-500/30 scale-[1.02]'
                      : 'border-white/10 hover:border-purple-400/60 bg-black/40 hover:bg-black/60 hover:scale-[1.01]'
                  }`}
                >
                  <div className="w-full h-24 sm:h-28 relative overflow-hidden">
                    <img 
                      src={spot.bgImage} 
                      alt={spot.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
                    
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isCurrent && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-600 text-white shadow">
                          📍 현위치
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-black shadow animate-pulse">
                          🎯 록온
                        </span>
                      )}
                      {spot.isHidden && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-black shadow animate-pulse">
                          ⭐ 히든 스팟
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-black/75 border border-white/15 text-gray-300">
                        #{orderNum}
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300">
                      <span className="truncate font-semibold max-w-[120px]">
                        🎁 {spot.luckyItem}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-950/90 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white truncate drop-shadow-sm">
                        {spot.locationName}
                      </h4>
                      <span className="text-[10px] font-bold text-purple-300/80 block truncate">
                        {spot.worldName}
                      </span>
                    </div>
                    {spot.isHidden && (
                      <span className="text-[9px] text-amber-300 font-bold mt-1">
                        ✨ 궁극의 5차원 시공간
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Portal Action Command Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
          {userState?.current_spot_id && (
            <button
              onClick={() => onStartMove(0)}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs transition shadow-md whitespace-nowrap active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>⛩️</span>
              <span>성소 귀환 (60초)</span>
            </button>
          )}

          <button
            onClick={() => onStartMove(selectedSpot)}
            disabled={userState?.current_spot_id === selectedSpot}
            className={`w-full flex-1 py-3.5 px-5 rounded-xl font-black text-sm tracking-wide transition shadow-xl flex items-center justify-center space-x-2 ${
              userState?.current_spot_id === selectedSpot
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.98]'
            }`}
          >
            <span className="text-base animate-pulse">⚡</span>
            <span>
              [{activeSpot.locationName}] ({activeSpot.worldName}) (으)로 시공간 도약 개시 (60초)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

