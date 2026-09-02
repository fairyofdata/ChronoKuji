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
  const [isUnfolding, setIsUnfolding] = useState<boolean>(false);
  const [fortuneNumber] = useState(() => Math.floor(Math.random() * 88) + 1);
  const targetShakes = 4;

  const spot = SPOTS.find(s => s.id === spotId);

  // Web Audio API를 활용한 대나무 산통 타악 사운드 FX
  const playBambooSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + Math.random() * 60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio might be muted or context blocked
    }
  };

  // 인장 타격 사운드 FX
  const playSealSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShakeCount(0);
      setIsAnimating(false);
      setIsStickEjecting(false);
      setIsUnfolding(false);
    }
  }, [isOpen]);

  const handleShake = () => {
    if (shakeCount >= targetShakes || isAnimating || isStickEjecting) return;

    setIsAnimating(true);
    playBambooSound();

    // Haptic vibration feedback
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([40, 30, 60]);
    }

    setTimeout(() => {
      setIsAnimating(false);
      const nextCount = shakeCount + 1;
      setShakeCount(nextCount);

      // 마지막 흔듦 달성 시 나무 막대 솟구침 -> 종이 언폴딩 연출
      if (nextCount >= targetShakes) {
        setIsStickEjecting(true);
        playBambooSound();
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([80, 50, 120]);
        }

        setTimeout(() => {
          setIsUnfolding(true);
          playSealSound();

          setTimeout(() => {
            onComplete();
          }, 1400);
        }, 800);
      }
    }, 320);
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
            className={`absolute z-20 w-7 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 rounded-t-lg shadow-2xl border border-amber-300 transition-all duration-700 ease-out flex flex-col items-center justify-start pt-2 ${
              isStickEjecting 
                ? '-top-12 h-36 opacity-100 shadow-amber-400/80 animate-bounce' 
                : 'top-16 h-0 opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-[10px] font-black text-amber-950 font-serif writing-vertical tracking-widest">
              第{fortuneNumber}番
            </span>
          </div>

          {/* Gacha Cylinder Box OR Unfolding Paper */}
          {!isUnfolding ? (
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
                  {isStickEjecting ? "🎉 점괘 막대 돌출!" : "👉 산통을 터치하세요!"}
                </span>
              </div>
            </div>
          ) : (
            /* Traditional Unfolding Paper Seal */
            <div className="w-52 h-64 bg-[#fbf8ee] text-gray-950 rounded-2xl shadow-2xl border-2 border-amber-300 p-4 flex flex-col items-center justify-between animate-unfold relative overflow-hidden font-serif">
              <div className="border-b border-gray-300 pb-1.5 w-full text-center">
                <span className="text-[9px] font-mono text-gray-500 block">CHRONO • 第{fortuneNumber}番</span>
                <span className="text-xs font-bold text-gray-800">{spot?.worldName} 御神籤</span>
              </div>

              <div className="py-2">
                <div className="w-20 h-20 rounded-2xl border-4 border-red-600 bg-red-950/10 flex flex-col items-center justify-center font-black tracking-widest text-red-600 shadow-md transform rotate-[-3deg] animate-stamp">
                  <span className="text-3xl">神籤</span>
                  <span className="text-[8px] font-sans">FATE SEAL</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-600 text-center font-sans font-bold">
                운명이 인쇄되었습니다 ✨
              </p>
            </div>
          )}
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
