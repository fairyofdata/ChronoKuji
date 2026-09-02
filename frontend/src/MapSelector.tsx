import React from 'react';
import { SPOTS } from './constants';
import { UserState } from './types';

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
  const currentSpot = userState?.current_spot_id 
    ? SPOTS.find(s => s.id === userState.current_spot_id) 
    : null;

  const activeSpot = SPOTS.find(s => s.id === selectedSpot) || SPOTS[0];

  return (
    <div className="w-full flex flex-col space-y-5 animate-fade-in">
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
              도약할 멀티버스 차원 게이트를 선택하고 시공간 워프를 개시하세요.
            </p>
          </div>
        )}
      </div>

      {/* 2. Multiverse Dimensional Portal Matrix */}
      <div className="bg-black/45 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl shadow-2xl border border-white/10 flex flex-col space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>🌀</span>
              <span>차원 게이트 매트릭스</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              도약할 목표 세계관의 장소를 록온(Lock-on)하세요
            </p>
          </div>
          {(isCodexComplete || isAdmin) && (
            <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 animate-pulse">
              ⭐ 5차원 테서렉트 접근 가능
            </span>
          )}
        </div>

        {/* Portal Grid: 4-Columns on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4 max-h-[620px] overflow-y-auto pr-1.5 custom-scrollbar">
          {SPOTS.map((spot, index) => {
            const isCurrent = userState?.current_spot_id === spot.id;
            const isSelected = selectedSpot === spot.id;
            // 관리자이거나 도감 11종 완성 시에만 12번 스팟 해금
            const isLocked = spot.isHidden && !isCodexComplete && !isAdmin;
            const orderNum = String(index + 1).padStart(2, '0');

            // 12번 히든 스팟이 잠겨 있을 때의 미지의 슬롯 렌더링
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
                    setSelectedSpot(spot.id);
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
                {/* Background Thumbnail */}
                <div className="w-full h-24 sm:h-28 relative overflow-hidden">
                  <img 
                    src={spot.bgImage} 
                    alt={spot.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
                  
                  {/* Status Badge & Sequence Tag */}
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

                  {/* Order Sequence Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-black/75 border border-white/15 text-gray-300">
                      #{orderNum}
                    </span>
                  </div>

                  {/* Lucky Item Hint */}
                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300">
                    <span className="truncate font-semibold max-w-[120px]">
                      🎁 {spot.luckyItem}
                    </span>
                  </div>
                </div>

                {/* Card Footer Info */}
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

        {/* 3. Portal Action Command Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
          {/* If user is in a spot, allow quick return to Rift */}
          {userState?.current_spot_id && (
            <button
              onClick={() => onStartMove(0)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs transition shadow-md whitespace-nowrap active:scale-95"
            >
              ⛩️ 성소 귀환 (60초)
            </button>
          )}

          <button
            onClick={() => onStartMove(selectedSpot)}
            disabled={userState?.current_spot_id === selectedSpot}
            className={`w-full flex-1 py-3.5 px-5 rounded-xl font-black text-sm tracking-wide transition shadow-xl flex items-center justify-center space-x-2 ${
              userState?.current_spot_id === selectedSpot
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <span>⚡</span>
            <span>
              [{activeSpot.locationName}] ({activeSpot.worldName}) (으)로 시공간 도약 개시 (60초)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
