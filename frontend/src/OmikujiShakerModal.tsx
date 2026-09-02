import React, { useState, useEffect } from 'react';
import { Spot } from './types';

interface OmikujiShakerModalProps {
  spot: Spot | undefined;
  luckLevel: string;
  onComplete: () => void;
}

export default function OmikujiShakerModal({ spot, luckLevel, onComplete }: OmikujiShakerModalProps) {
  // stages: 'shaking' -> 'stick_revealed' -> 'paper_unfolding'
  const [stage, setStage] = useState<'shaking' | 'stick_revealed' | 'paper_unfolding'>('shaking');
  const [fortuneNumber] = useState(() => Math.floor(Math.random() * 88) + 1);

  // Web Audio API를 활용한 대나무 산통 달그락 타악 효과음 합성
  const playBambooWoodSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be restricted before gesture
    }
  };

  // 큰 징/종 웅장한 인장 타격음
  const playSealSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 햅틱 진동
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([40, 30, 50, 30, 60, 40, 100]);
    }

    // 1단계: 산통 흔들기 사운드 루프
    const soundInterval = setInterval(() => {
      playBambooWoodSound();
    }, 180);

    // 1.5초 후 2단계: 점괘 막대 돌출
    const timer1 = setTimeout(() => {
      clearInterval(soundInterval);
      setStage('stick_revealed');
      playBambooWoodSound();
    }, 1500);

    // 2.7초 후 3단계: 오미쿠지 종이 언폴딩 & 인장
    const timer2 = setTimeout(() => {
      setStage('paper_unfolding');
      playSealSound();
    }, 2700);

    return () => {
      clearInterval(soundInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const getSealColor = (level: string) => {
    switch (level) {
      case '大吉':
        return 'text-red-600 border-red-600 bg-red-950/20';
      case '中吉':
      case '小吉':
      case '吉':
        return 'text-amber-600 border-amber-600 bg-amber-950/20';
      default:
        return 'text-purple-700 border-purple-700 bg-purple-950/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
        {/* World Context Badge */}
        <div className="mb-6 flex items-center space-x-2 bg-purple-950/70 border border-purple-500/40 px-3.5 py-1 rounded-full shadow-lg">
          <span className="text-sm">⛩️</span>
          <span className="text-xs font-black text-purple-200">
            {spot?.worldName} • {spot?.locationName}
          </span>
        </div>

        {/* STAGE 1 & 2: Bamboo Cylinder Shaker & Stick */}
        {(stage === 'shaking' || stage === 'stick_revealed') && (
          <div className="flex flex-col items-center space-y-6 animate-scale-up">
            <div className="relative flex flex-col items-center">
              {/* Ejected Bamboo Stick (Stage 2) */}
              <div 
                className={`w-6 h-28 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-600 rounded-t-md shadow-2xl flex flex-col items-center justify-center font-serif text-[11px] font-black text-amber-950 transition-all duration-700 ${
                  stage === 'stick_revealed' 
                    ? '-translate-y-12 opacity-100 scale-105 animate-bounce' 
                    : 'translate-y-8 opacity-0 pointer-events-none'
                }`}
              >
                <span className="writing-vertical tracking-widest">
                  第{fortuneNumber}番
                </span>
              </div>

              {/* 3D Hexagonal Bamboo Shaker Cylinder */}
              <div 
                className={`relative w-28 h-52 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-900 rounded-3xl border-4 border-amber-500 shadow-2xl shadow-amber-950/80 flex flex-col items-center justify-between p-3 ${
                  stage === 'shaking' ? 'animate-wiggle' : ''
                }`}
              >
                {/* Cylinder Top Rim & Small Hole */}
                <div className="w-16 h-5 bg-amber-950 rounded-full border-2 border-amber-400 flex items-center justify-center shadow-inner">
                  <div className="w-4 h-2 bg-black rounded-full" />
                </div>

                {/* Vertical Bamboo Carvings & Kanji */}
                <div className="my-auto py-2 px-1 border border-amber-300/40 rounded-xl bg-black/30 text-amber-200 font-serif font-black tracking-widest text-sm flex flex-col items-center space-y-1">
                  <span>御</span>
                  <span>神</span>
                  <span>籤</span>
                </div>

                {/* Cylinder Bottom Base */}
                <div className="w-20 h-4 bg-amber-950 rounded-full border border-amber-400/80 shadow-md" />
              </div>
            </div>

            <p className="text-sm font-bold text-amber-300 animate-pulse tracking-wide">
              {stage === 'shaking' 
                ? "운명의 산통을 흔들고 있습니다..." 
                : `제 ${fortuneNumber}번 차원 점괘 막대가 나왔습니다!`}
            </p>
          </div>
        )}

        {/* STAGE 3: Traditional Japanese Omikuji Paper Unfolding */}
        {stage === 'paper_unfolding' && (
          <div className="w-full max-w-xs bg-[#fbf8ee] text-gray-900 rounded-2xl shadow-2xl border-2 border-amber-300/80 p-6 flex flex-col items-center space-y-4 animate-unfold relative overflow-hidden font-serif">
            {/* Subtle Rice-Paper Pattern Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Paper Header */}
            <div className="border-b-2 border-dashed border-gray-400/70 pb-3 w-full text-center">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest block mb-0.5">
                CHRONO OMIKUJI • 第{fortuneNumber}番
              </span>
              <h3 className="text-base font-extrabold text-gray-800 tracking-wider">
                {spot?.worldName} 御神籤
              </h3>
            </div>

            {/* Grand Stamp Seal (쾅 찍히는 낙관 인장) */}
            <div className="py-3">
              <div className={`w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center font-black tracking-widest shadow-lg transform rotate-[-4deg] animate-stamp ${getSealColor(luckLevel)}`}>
                <span className="text-4xl">{luckLevel}</span>
                <span className="text-[9px] font-sans tracking-tight uppercase mt-0.5">FATE SEAL</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              차원의 운명이 기록되었습니다.<br />
              상세한 차원의 시구와 세부운을 확인하세요.
            </p>

            {/* Complete Action Button */}
            <button
              onClick={onComplete}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:from-red-500 hover:to-amber-500 text-white font-sans font-black text-sm tracking-wide shadow-xl transition active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <span>점괘 펼쳐보기</span>
              <span>📜</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
