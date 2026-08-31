import React, { useState, useEffect } from 'react';
import { SPOTS } from './constants';

// Web Audio API를 활용한 무의존성 물리 사운드 합성기
function playRattleSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1. 나무/금속 부딪히는 짤깍 소리 (Clack Sound)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (화려한 화음)
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.05);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.05);
      osc.stop(ctx.currentTime + index * 0.05 + 0.6);
    });
  } catch (e) {}
}

export default function FortuneShakeModal({ isOpen, spotId = 1, onComplete }) {
  const [shakeCount, setShakeCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  const REQUIRED_SHAKES = 4; // 4회 흔들면 당첨 개봉!

  const spot = SPOTS.find(s => s.id === spotId) || SPOTS[0];
  const boxImage = spot.boxImage || '/assets/boxes/box_1_kraiden.jpg';

  const handleShakeInteraction = () => {
    if (isEjecting) return;

    // 1. 사운드 및 햅틱 진동 피드백
    playRattleSound();
    if (navigator.vibrate) {
      navigator.vibrate(35); // 35ms 손맛 진동
    }

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 220);

    const nextCount = shakeCount + 1;
    setShakeCount(nextCount);

    // 4회 흔들기 완료 시 막대 사출 애니메이션
    if (nextCount >= REQUIRED_SHAKES) {
      setIsEjecting(true);
      playChimeSound();
      if (navigator.vibrate) {
        navigator.vibrate([50, 70, 120]); // 사출 성공 햅틱 패턴
      }

      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  };

  // 모바일 가속도계(디바이스 흔들기) 지원
  useEffect(() => {
    if (!isOpen || isEjecting) return;

    let lastX = null, lastY = null, lastZ = null;
    let lastTime = 0;

    const handleMotion = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = new Date().getTime();
      if ((currentTime - lastTime) > 150) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        if (lastX !== null) {
          const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;
          if (speed > 800) {
            handleShakeInteraction();
          }
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [isOpen, shakeCount, isEjecting]);

  // 리셋
  useEffect(() => {
    if (isOpen) {
      setShakeCount(0);
      setIsEjecting(false);
      setIsShaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((shakeCount / REQUIRED_SHAKES) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in select-none">
      <div 
        className="relative w-full max-w-sm flex flex-col items-center text-center space-y-5"
        onClick={handleShakeInteraction}
      >
        {/* Top Header */}
        <div className="space-y-1 animate-slide-up">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 shadow">
            {spot.shortName || spot.name}의 운명 뽑기
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow mt-2">
            {isEjecting ? "✨ 점괘가 솟아오릅니다!" : "통을 탭하거나 휴대폰을 흔드세요!"}
          </h2>
          <p className="text-xs text-gray-400">
            {spot.name}의 기운을 담아 4회 공명시키세요
          </p>
        </div>

        {/* 2. Interactive High-Res Box Container Visual */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center cursor-pointer group">
          
          {/* Ejecting Fortune Stick */}
          <div 
            className={`absolute z-20 w-12 sm:w-14 h-48 rounded-t-xl bg-gradient-to-t from-amber-200 via-yellow-300 to-amber-400 border-2 border-amber-500 shadow-2xl flex flex-col items-center justify-start pt-3 transition-all duration-700 ease-out font-black text-xs text-amber-950 ${
              isEjecting ? '-translate-y-40 scale-110 shadow-amber-400/90' : 'translate-y-16 opacity-0'
            }`}
          >
            <span className="text-base animate-bounce">🥠</span>
            <span className="writing-vertical mt-2 tracking-widest font-black text-xs">
              운명개봉
            </span>
          </div>

          {/* High-Resolution 1:1 Box Image with 3D Shake physics */}
          <div 
            className={`relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-2xl transition-transform duration-100 ${
              isShaking ? 'scale-110 rotate-6 shadow-amber-500/50' : 'group-hover:scale-105 shadow-purple-500/30'
            }`}
            style={{
              boxShadow: isShaking 
                ? '0 0 50px rgba(245, 158, 11, 0.6)' 
                : '0 0 30px rgba(168, 85, 247, 0.3)'
            }}
          >
            <img 
              src={boxImage} 
              alt={spot.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Shake Overlay Wave */}
            {isShaking && (
              <div className="absolute inset-0 bg-amber-400/20 mix-blend-overlay animate-pulse"></div>
            )}
          </div>
        </div>

        {/* 3. Progress Resonance Bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-300">
            <span>공명 에너지</span>
            <span className="text-amber-400 font-black">{shakeCount} / {REQUIRED_SHAKES}</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-400 transition-all duration-300 rounded-full shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4. Touch Button Prompt */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShakeInteraction();
          }}
          disabled={isEjecting}
          className="w-full max-w-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black py-3 px-4 rounded-xl shadow-lg transition transform active:scale-95 text-sm flex items-center justify-center space-x-2"
        >
          <span>🥠</span>
          <span>{isEjecting ? "운명 개봉 중..." : `산통 흔들기 (${shakeCount}/${REQUIRED_SHAKES})`}</span>
        </button>
      </div>
    </div>
  );
}
