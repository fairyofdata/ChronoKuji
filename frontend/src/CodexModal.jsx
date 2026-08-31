import React from 'react';
import { CODEX_ITEMS } from './constants';

export default function CodexModal({ isOpen, onClose, collectedItems = [], isComplete }) {
  if (!isOpen) return null;

  const collectedCount = collectedItems.length;
  const progressPercent = Math.round((collectedCount / CODEX_ITEMS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-gray-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-950/80 via-gray-900 to-indigo-950/80">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg font-black text-purple-300 drop-shadow">
                차원 럭키 아이템 도감 (Dimension Codex)
              </h2>
              <p className="text-xs text-gray-400">
                11대 세계관의 고유 기운이 담긴 매개체를 수집하세요
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar & Unlock Banner */}
        <div className="px-5 pt-4, pb-2 bg-gray-950/60">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-purple-400">수집 진행도</span>
            <span className="text-amber-400 font-extrabold">{collectedCount} / {CODEX_ITEMS.length} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-400 transition-all duration-700 rounded-full shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isComplete ? (
            <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 rounded-xl flex items-center space-x-3 animate-fade-in shadow-lg">
              <span className="text-2xl animate-bounce">⏳</span>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                  🎉 시공간 초월자 달성!
                </h4>
                <p className="text-[11px] text-amber-100">
                  <span className="font-bold underline">[히든 스팟: 인터스텔라 5차원 테서렉트]</span>가 해금되었습니다!
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              💡 11종을 모두 모으면 <span className="text-amber-300 font-semibold">숨겨진 12번째 5차원 시공간 테서렉트</span>가 해금됩니다.
            </p>
          )}
        </div>

        {/* 10 Items Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-2 gap-3 custom-scrollbar">
          {CODEX_ITEMS.map((item) => {
            const isCollected = collectedItems.some(c => c.name === item.name || c.id === item.id);
            const collectedData = collectedItems.find(c => c.name === item.name || c.id === item.id);

            return (
              <div 
                key={item.id}
                className={`relative p-3 rounded-xl border transition-all duration-300 flex flex-col items-center text-center ${
                  isCollected 
                    ? 'bg-gray-800/90 border-amber-500/50 shadow-md hover:border-amber-400 hover:scale-[1.02]' 
                    : 'bg-gray-950/60 border-gray-800 opacity-60'
                }`}
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 border border-gray-700 flex-shrink-0 shadow-inner">
                  {isCollected ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-gray-600">
                      <span className="text-xl">🔒</span>
                      <span className="text-[9px] mt-0.5 font-bold">미수집</span>
                    </div>
                  )}
                  {isCollected && (
                    <span className="absolute top-1 right-1 text-[9px] bg-amber-500 text-gray-950 font-black px-1.5 py-0.2 rounded shadow">
                      GET
                    </span>
                  )}
                </div>

                <div className="w-full min-w-0">
                  <div className="flex items-center justify-center space-x-1 mb-0.5">
                    <span className="text-[10px] font-bold text-amber-300 block truncate">
                      📍 {item.locationName}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-purple-400 block truncate mb-1">
                    ({item.worldName})
                  </span>
                  <h4 className={`text-xs sm:text-sm font-extrabold truncate ${isCollected ? 'text-white' : 'text-gray-500'}`}>
                    {isCollected ? item.name : '???'}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-tight">
                    {isCollected ? item.desc : `[${item.locationName}]에서 획득 가능`}
                  </p>
                  {isCollected && collectedData?.acquiredAt && (
                    <span className="text-[9px] text-gray-500 mt-1.5 block">
                      획득일: {collectedData.acquiredAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
