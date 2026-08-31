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
  const targetShakes = 4;

  const spot = SPOTS.find(s => s.id === spotId);

  useEffect(() => {
    if (isOpen) {
      setShakeCount(0);
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleShake = () => {
    if (shakeCount >= targetShakes) return;

    setIsAnimating(true);
    // Haptic vibration feedback if supported
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(60);
    }

    setTimeout(() => {
      setIsAnimating(false);
      const nextCount = shakeCount + 1;
      setShakeCount(nextCount);

      if (nextCount >= targetShakes) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in text-white">
      <div 
        className="relative w-full max-w-sm bg-gray-900/90 border border-purple-500/40 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center space-y-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div>
          <span className="text-[11px] font-bold text-purple-400 tracking-wider uppercase">
            {spot?.worldName || "Multiverse"}
          </span>
          <h3 className="text-lg font-black text-white drop-shadow">
            운명의 산통 흔들기
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            산통을 {targetShakes}번 탭하여 점괘 막대를 뽑으세요!
          </p>
        </div>

        {/* Shake Container Box */}
        <div 
          onClick={handleShake}
          className={`w-44 h-56 rounded-2xl overflow-hidden relative cursor-pointer border-2 transition-all duration-200 select-none shadow-2xl flex items-center justify-center bg-gray-950 ${
            isAnimating 
              ? 'animate-wiggle scale-105 border-amber-400 shadow-amber-500/50' 
              : 'border-purple-500/40 hover:scale-102 hover:border-purple-400'
          }`}
        >
          <img 
            src={spot?.boxImage} 
            alt={spot?.name} 
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
            <span className="text-[11px] font-extrabold text-amber-300 animate-pulse">
              👉 산통을 터치하세요!
            </span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-2">
          {Array.from({ length: targetShakes }).map((_, i) => (
            <div 
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                i < shakeCount 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 scale-110 shadow-lg shadow-amber-400/50' 
                  : 'bg-gray-700 border border-gray-600'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 font-mono">
          {shakeCount} / {targetShakes} 흔듦
        </p>
      </div>
    </div>
  );
}
