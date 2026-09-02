import React, { useState, useEffect } from 'react';
import { SPOTS } from './constants';
import { OmikujiResult, LlmInterpretationResult, Spot } from './types';
import { useToast } from './Toast';
import { WORLD_OMIKUJI_LORE } from './omikujiLore';

interface OmikujiViewProps {
  result: OmikujiResult;
  spot: Spot | undefined;
  llmResult: LlmInterpretationResult | null;
  isInterpreting: boolean;
  onInterpret: (context: string) => void;
  onShare: () => void;
  userTokens: number;
  isGuest?: boolean;
  onGoogleLogin?: () => void;
}

export default function OmikujiView({ 
  result, 
  spot, 
  llmResult, 
  isInterpreting, 
  onInterpret, 
  onShare, 
  userTokens,
  isGuest = true,
  onGoogleLogin
}: OmikujiViewProps) {
  const [userContext, setUserContext] = useState('');
  const [isTied, setIsTied] = useState(false);
  const [isTieAnimating, setIsTieAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { showToast } = useToast();

  const activeSpot = spot || SPOTS.find(s => s.id === result.spot_id);
  const isGreatLuck = result.luck_level === "大吉";
  const isBadLuck = result.luck_level === "凶" || result.luck_level === "大凶";

  // 12대 세계관 맞춤형 오미쿠지 로어 보강 (Enrichment)
  const spotId = activeSpot?.id || result.spot_id;
  const customLore = WORLD_OMIKUJI_LORE[spotId]?.[result.luck_level];
  const displayPoem = customLore?.poem || result.meta_info?.poem;
  const displayText = customLore?.text || result.original_text;
  const displayCategories = customLore?.categories || result.meta_info?.categories;

  // 대길일 때 황금 컨페티 파티클 연출 트리거
  useEffect(() => {
    if (isGreatLuck) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isGreatLuck]);

  // 운세 등급별 테마 색상 & 뱃지
  const getLuckBadgeStyle = (level: string) => {
    switch (level) {
      case '大吉':
        return 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-white shadow-amber-500/60 ring-2 ring-amber-300 animate-pulse';
      case '中吉':
        return 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-orange-500/40';
      case '小吉':
        return 'bg-gradient-to-r from-emerald-600 to-teal-400 text-white shadow-emerald-500/40';
      case '吉':
        return 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-blue-500/40';
      case '末吉':
        return 'bg-gradient-to-r from-indigo-600 to-purple-400 text-white shadow-purple-500/40';
      case '凶':
      case '大凶':
        return 'bg-gradient-to-r from-purple-950 via-gray-900 to-black text-purple-300 border border-purple-500/60 shadow-purple-950/80';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  // 점괘 묶기(結び) 액막이 실행
  const handleTieFortune = () => {
    if (isTied || isTieAnimating) return;
    setIsTieAnimating(true);
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 40, 80]);
    }
    setTimeout(() => {
      setIsTieAnimating(false);
      setIsTied(true);
      showToast({
        type: 'shrine',
        title: '⛩️ 액막이 결계 완료',
        message: '불길한 점괘를 차원의 결계에 묶어 액을 털어냈습니다.\n이제 길한 새로운 기운이 당신에게 깃듭니다.'
      });
    }, 1200);
  };

  // 점괘 텍스트 복사하기
  const handleCopyFortuneText = () => {
    const text = `🥠 [ChronoKuji 차원 오미쿠지]\n차원: ${activeSpot?.worldName} (${activeSpot?.locationName})\n등급: ${result.luck_level}\n행운의 아이템: ${activeSpot?.luckyItem}\n\n시구: "${displayPoem || ''}"\n총운: ${displayText || ''}\n\n지금 차원 점괘 뽑기 👉 https://chronokuji.web.app`;
    navigator.clipboard.writeText(text).then(() => {
      showToast({
        type: 'success',
        title: '📋 복사 완료',
        message: '점괘 내용이 클립보드에 복사되었습니다.'
      });
    });
  };

  return (
    <div className="relative animate-fade-in flex flex-col space-y-4 text-left select-none">
      {/* Confetti Explosion Layer for 大吉 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti text-lg"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['✨', '🎉', '🌟', '🪙', '🎊', '💫'][i % 6]}
            </div>
          ))}
        </div>
      )}

      {/* 1. Main Omikuji Scroll Card */}
      <div className={`p-6 sm:p-7 rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all duration-700 relative overflow-hidden ${
        isTied 
          ? 'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-950/60'
          : isBadLuck 
          ? 'bg-purple-950/60 border-purple-500/50 shadow-purple-950/90' 
          : 'bg-black/50 border-white/15'
      }`}>
        {/* Tied Ribbon Effect Overlay */}
        {isTied && (
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-extrabold backdrop-blur-md animate-pulse">
            <span>🎗️ 차원의 결계에 액막이 묶음 완료</span>
          </div>
        )}

        {/* Decorative Shrine Header */}
        <div className="flex justify-between items-start border-b border-gray-700/60 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              {activeSpot?.worldName || "Chrono World"} • 神社御神籤
            </span>
            <h3 className="text-sm font-extrabold text-purple-300">
              {activeSpot?.locationName}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400 font-mono">No. {result.history_id}</span>
          </div>
        </div>

        {/* Big Luck Level Display */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-800/80">
          <div className="flex items-center space-x-3">
            <div className={`text-3xl sm:text-4xl font-black px-4 py-2 rounded-2xl shadow-xl flex items-center justify-center font-serif tracking-widest ${getLuckBadgeStyle(result.luck_level)}`}>
              {result.luck_level}
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400">차원 운명 등급</p>
              <p className="text-sm font-bold text-gray-200">
                {result.luck_level === '大吉' ? "최상의 대길운이 깃들었습니다! 🎉" : 
                 result.luck_level === '凶' || result.luck_level === '大凶' ? (isTied ? "액막이 결계로 정화되었습니다." : "경계와 성찰의 시간입니다.") : 
                 "평온하고 길한 기운이 감돕니다."}
              </p>
            </div>
          </div>

          {/* Lucky Item / Meta Details */}
          <div className="flex items-center space-x-2 bg-gray-900/80 border border-gray-700/70 px-3 py-2 rounded-2xl text-xs">
            <img src={activeSpot?.itemImage} alt={activeSpot?.luckyItem} className="w-8 h-8 rounded-lg object-cover shadow" />
            <div className="text-left">
              <span className="text-[10px] text-amber-400 font-bold block">행운의 아이템</span>
              <span className="text-white font-bold">{activeSpot?.luckyItem}</span>
            </div>
          </div>
        </div>

        {/* Poetic Verse (운세 시) */}
        {displayPoem && (
          <div className="my-3.5 p-4 bg-gradient-to-r from-gray-950 via-purple-950/30 to-gray-950 rounded-2xl border border-purple-500/30 text-center font-serif shadow-inner">
            <span className="text-[10px] text-purple-400 font-mono tracking-widest block mb-1">
              ✦ {activeSpot?.worldName} 運勢詩 ✦
            </span>
            <p className="text-xs sm:text-sm text-amber-200 font-bold italic leading-relaxed">
              "{displayPoem}"
            </p>
          </div>
        )}

        {/* World Custom Overall Fortune (세계관 맞춤 총운) */}
        {displayText && (
          <div className="my-3 p-3.5 bg-black/45 rounded-2xl border border-white/10 text-left">
            <span className="text-[10px] text-amber-400 font-bold block mb-1">
              📜 차원의 총운
            </span>
            <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
              {displayText}
            </p>
          </div>
        )}

        {/* 6 Traditional Life Categories (세부운) */}
        {displayCategories && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 my-3.5">
            {displayCategories.wish && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-purple-400 font-bold block">願事 (소원)</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.wish}</span>
              </div>
            )}
            {displayCategories.love && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-pink-400 font-bold block">戀愛 (인연)</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.love}</span>
              </div>
            )}
            {displayCategories.wealth && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-yellow-400 font-bold block">金運 (재물)</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.wealth}</span>
              </div>
            )}
            {displayCategories.work && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-blue-400 font-bold block">事業 (학업·일)</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.work}</span>
              </div>
            )}
            {displayCategories.travel && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-bold block">旅行 (이동)</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.travel}</span>
              </div>
            )}
            {displayCategories.waiting && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-cyan-400 font-bold block">待人 (기다림)</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.waiting}</span>
              </div>
            )}
          </div>
        )}

        {/* Lucky Direction & Number */}
        <div className="flex flex-wrap gap-2 text-[11px] font-bold text-gray-300 pt-2 border-t border-gray-800/80">
          {result.meta_info?.lucky_direction && (
            <span className="bg-gray-900/80 border border-gray-700/60 px-3 py-1 rounded-xl">
              🧭 행운의 방위: <span className="text-cyan-300">{result.meta_info.lucky_direction}</span>
            </span>
          )}
          {result.meta_info?.lucky_number && (
            <span className="bg-gray-900/80 border border-gray-700/60 px-3 py-1 rounded-xl">
              🎲 행운의 숫자: <span className="text-amber-300">{result.meta_info.lucky_number}</span>
            </span>
          )}
        </div>

        {/* Actions: Copy & Bad Luck Tie Button */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-800/80">
          <button
            onClick={handleCopyFortuneText}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600/50 transition flex items-center space-x-1.5 shadow"
          >
            <span>📋</span>
            <span>점괘 텍스트 복사</span>
          </button>

          {isBadLuck && !isTied && (
            <button
              onClick={handleTieFortune}
              disabled={isTieAnimating}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition flex items-center space-x-1.5 shadow-lg ${
                isTieAnimating
                  ? 'bg-purple-900/80 border-purple-400 text-purple-200 animate-pulse'
                  : 'bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-700 hover:to-indigo-600 border-purple-400/60 text-white shadow-purple-900/50'
              }`}
            >
              <span>🎗️</span>
              <span>{isTieAnimating ? "액막이 결계에 묶는 중..." : "차원의 결계에 액막이 묶기(結び)"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. AI Deep Interpretation Section */}
      <div className="p-5 sm:p-6 rounded-3xl backdrop-blur-2xl bg-black/60 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔮</span>
            <h4 className="text-sm font-extrabold text-white">
              {activeSpot?.worldName} AI 심층 차원 해석
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300">
            {isGuest ? "게스트 🔒" : `남은 토큰: ${userTokens}개`}
          </span>
        </div>

        {llmResult ? (
          <div className="space-y-3 animate-fade-in text-xs leading-relaxed text-gray-300">
            <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">
                ✦ {llmResult.world_concept_title || "차원의 메시지"}
              </span>
              <p className="text-gray-200 font-medium">
                {llmResult.interpretation}
              </p>
            </div>

            {llmResult.world_bgm_action && (
              <p className="text-[11px] text-gray-400 italic">
                {llmResult.world_bgm_action}
              </p>
            )}
          </div>
        ) : isGuest ? (
          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl text-center space-y-2">
            <p className="text-xs text-gray-300">
              구글 로그인을 하시면 <span className="text-amber-300 font-bold">20시간마다 1회 무료</span>로 세계관 AI 심층 풀이를 받으실 수 있습니다.
            </p>
            {onGoogleLogin && (
              <button
                onClick={onGoogleLogin}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-100 transition shadow-lg inline-flex items-center space-x-1.5"
              >
                <span>🔑</span>
                <span>구글 로그인하고 무료 해석 받기</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              현재 고민이나 상황을 적어주시면, 해당 세계관 페르소나가 맞춤 심층 해석을 건넵니다.
            </p>
            <textarea
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="예: 요즘 새로운 시험을 준비 중인데 자꾸 불안해요. 앞으로의 운이 어떨까요?"
              rows={3}
              maxLength={300}
              className="w-full bg-gray-950/80 border border-gray-700/80 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">{userContext.length} / 300자</span>
              <button
                onClick={() => onInterpret(userContext)}
                disabled={isInterpreting || !userContext.trim()}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg flex items-center space-x-1.5 ${
                  isInterpreting || !userContext.trim()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/50'
                }`}
              >
                <span>✨</span>
                <span>{isInterpreting ? "차원 지혜 해석 중..." : "AI 심층 해석 의뢰하기 (토큰 1개)"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
