import React, { useState, useEffect } from 'react';
import { SPOTS } from './constants';

interface FortuneShakeModalProps {
  isOpen: boolean;
  spotId: number;
  onComplete: () => void;
}

export default function FortuneShakeModal({ isOpen, spotId, onComplete }: FortuneShakeModalProps) {
  const [shakeCount, setShakeCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isStickEjecting, setIsStickEjecting] = useState<boolean>(false);
  const targetShakes = 4;

  const spot = SPOTS.find(s => s.id === spotId);

  useEffect(() => {
    if (isOpen) {
      setShakeCount(0);
      setIsAnimating(false);
      setIsStickEjecting(false);
    }
  }, [isOpen]);

  const handleShake = () => {
    if (shakeCount >= targetShakes || isAnimating || isStickEjecting) return;

    setIsAnimating(true);

    // Haptic vibration feedback
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([40, 30, 60]);
    }

    setTimeout(() => {
      setIsAnimating(false);
      const nextCount = shakeCount + 1;
      setShakeCount(nextCount);

      // 마지막 흔듦 달성 시 나무 막대 솟구침 연출
      if (nextCount >= targetShakes) {
        setIsStickEjecting(true);
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([80, 50, 120]);
        }
        setTimeout(() => {
          onComplete();
        }, 900);
      }
    }, 380);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in text-white select-none">
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-purple-600/20 blur-3xl pointer-events-none animate-pulse" />

      <div 
        className="relative w-full max-w-sm bg-gradient-to-b from-gray-900/95 to-black/95 border border-purple-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center space-y-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Sparkles */}
        <div className="flex items-center space-x-2">
          <span className="animate-spin text-amber-400 text-sm">✦</span>
          <span className="text-[11px] font-black text-purple-300 tracking-widest uppercase">
            {spot?.worldName || "Multiverse"} • 運命の筒
          </span>
          <span className="animate-spin text-amber-400 text-sm">✦</span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200 drop-shadow">
            운명의 산통 흔들기
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            산통을 <span className="text-amber-300 font-bold">{targetShakes}번</span> 탭하여 점괘 막대를 뽑아내세요!
          </p>
        </div>

        {/* Interactive Shake Container */}
        <div className="relative w-48 h-64 flex items-center justify-center my-1">
          {/* Ejecting Fortune Stick (솟구쳐 나오는 점괘 막대) */}
          <div 
            className={`absolute z-20 w-8 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 rounded-t-lg shadow-2xl border border-amber-300 transition-all duration-700 ease-out flex flex-col items-center justify-start pt-2 ${
              isStickEjecting 
                ? '-top-10 h-36 opacity-100 shadow-amber-400/80' 
                : 'top-16 h-0 opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-[9px] font-black text-red-700 writing-vertical tracking-widest">
              大吉
            </span>
          </div>

          {/* Gacha Cylinder Box */}
          <div 
            onClick={handleShake}
            className={`w-44 h-56 rounded-3xl overflow-hidden relative cursor-pointer border-2 transition-all duration-300 select-none shadow-2xl flex items-center justify-center bg-gray-950 ${
              isAnimating 
                ? 'scale-110 -rotate-6 border-amber-400 shadow-amber-500/70' 
                : isStickEjecting
                ? 'scale-105 border-purple-400 shadow-purple-500/50'
                : 'border-purple-500/40 hover:scale-105 hover:border-purple-400 hover:shadow-purple-500/40'
            }`}
          >
            <img 
              src={spot?.boxImage} 
              alt={spot?.name} 
              className={`w-full h-full object-cover transition-all duration-300 ${
                isAnimating ? 'brightness-110 contrast-110' : 'brightness-90'
              }`}
            />

            {/* Tap Ripple / Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 flex flex-col justify-end items-center p-3">
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md transition-all ${
                isStickEjecting
                  ? 'bg-amber-500 text-black animate-bounce shadow-lg shadow-amber-400/50'
                  : isAnimating 
                  ? 'bg-amber-400 text-black scale-105' 
                  : 'bg-black/60 border border-purple-500/40 text-amber-300 animate-pulse'
              }`}>
                {isStickEjecting ? "🎉 점괘 막대 출현!" : "👉 산통을 터치하세요!"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Step Diamonds */}
        <div className="flex items-center space-x-2.5 pt-1">
          {Array.from({ length: targetShakes }).map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-md rotate-45 transition-all duration-300 flex items-center justify-center ${
                i < shakeCount 
                  ? 'bg-gradient-to-br from-amber-300 to-yellow-500 scale-110 shadow-lg shadow-amber-400/60' 
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              {i < shakeCount && (
                <span className="-rotate-45 text-[9px] font-black text-black">✓</span>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 font-mono tracking-wider">
          {shakeCount} / {targetShakes} 흔듦 {shakeCount >= targetShakes && "— 운명 확정"}
        </p>
      </div>
    </div>
  );
}
