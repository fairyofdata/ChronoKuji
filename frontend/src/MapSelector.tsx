import React from 'react';
import { SPOTS } from './constants';
import { UserState } from './types';

interface MapSelectorProps {
  userState: UserState | null;
  selectedSpot: number;
  setSelectedSpot: (id: number) => void;
  onStartMove: () => void;
  isCodexComplete?: boolean;
}

export default function MapSelector({ 
  userState, 
  selectedSpot, 
  setSelectedSpot, 
  onStartMove, 
  isCodexComplete = false
}: MapSelectorProps) {
  const currentSpot = userState?.current_spot_id 
    ? SPOTS.find(s => s.id === userState.current_spot_id) 
    : null;

  // 히든 스팟(Spot 12: 인터스텔라 테서렉트)은 도감 11종 수집 완료 시에만 노출
  const availableSpots = SPOTS.filter(s => !s.isHidden || isCodexComplete);

  return (
    <div className="bg-black/40 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col space-y-4">
      {/* Current Spot Info Box */}
      {currentSpot ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-700 shadow-2xl group">
          <img 
            src={currentSpot.bgImage} 
            alt={currentSpot.name} 
            className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient Overlay for seamless readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex flex-col justify-end p-4 text-left">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white shadow-md">
                📍 현재 차원
              </span>
              {currentSpot.isHidden && (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-black animate-pulse shadow">
                  ⭐ 히든 차원
                </span>
              )}
              {currentSpot.bgmTitle && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 border border-purple-500/40 text-purple-300 flex items-center space-x-1 backdrop-blur-md">
                  <span>🎵</span>
                  <span className="truncate max-w-[160px] sm:max-w-[200px]">{currentSpot.bgmTitle}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white drop-shadow-lg tracking-tight">
              {currentSpot.name}
            </h2>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-gray-800/80 rounded-xl border border-dashed border-gray-700 text-center">
          <p className="text-purple-300 font-black text-xl mb-1">🌌 차원의 틈새에 머물고 있습니다</p>
          <p className="text-xs text-gray-400">아래에서 목적지를 선택하고 워프를 시작하세요.</p>
        </div>
      )}

      {/* Omikuji Draw Button */}
      {userState?.current_spot_id && (
        <button 
          onClick={handleDrawOmikuji} 
          disabled={isDrawing}
          className={`w-full text-white font-black py-3.5 px-4 rounded-xl shadow-lg transition transform flex items-center justify-center space-x-2 text-base ${isDrawing ? 'bg-amber-700 animate-wiggle cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 hover:-translate-y-0.5 hover:shadow-yellow-500/40 active:translate-y-0'}`}
        >
          <span>{isDrawing ? "🥠 운명의 통을 흔드는 중..." : "이곳에서 점괘 뽑기 🥠"}</span>
        </button>
      )}

      <div className="pt-2 border-t border-gray-600/70">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-gray-300 text-left">
            🚀 다른 차원으로 워프하기
          </label>
          {isCodexComplete && (
            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              ⭐ 히든 스팟 해금됨!
            </span>
          )}
        </div>
        
        {/* World Selector with previews */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          <select 
            value={selectedSpot} 
            onChange={(e) => setSelectedSpot(Number(e.target.value))}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            {userState?.current_spot_id && (
              <option value={0}>
                🌌 [성소] 차원의 균열 (도감 & 기록보관소 성소로 귀환)
              </option>
            )}
            {availableSpots.map(spot => (
              <option key={spot.id} value={spot.id} disabled={spot.id === userState?.current_spot_id}>
                {spot.name} {spot.id === userState?.current_spot_id ? "(현재 위치)" : ""}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={onStartMove} 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3 px-4 rounded-xl transition transform hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-purple-500/30"
        >
          차원 이동 시작 (60초 소요) ⚡
        </button>
      </div>
    </div>
  );
}
