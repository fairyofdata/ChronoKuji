import React, { useState } from 'react';
import { SPOTS } from './constants';
import { OmikujiResult, LlmInterpretationResult } from './types';

interface OmikujiViewProps {
  result: OmikujiResult;
  spotId: number;
  userTokens: number;
  onInterpret: (context: string) => Promise<void>;
  isInterpreting: boolean;
  llmResult: LlmInterpretationResult | null;
  onShare: () => void;
}

export default function OmikujiView({ 
  result, 
  spotId, 
  userTokens, 
  onInterpret, 
  isInterpreting, 
  llmResult,
  onShare 
}: OmikujiViewProps) {
  const [userContext, setUserContext] = useState('');
  const [isTied, setIsTied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const spot = SPOTS.find(s => s.id === spotId);
  const isBadLuck = result.luck_level === "凶" || result.luck_level === "大凶";

  // 운세 등급별 테마 색상 & 뱃지
  const getLuckBadgeStyle = (level: string) => {
    switch (level) {
      case '大吉':
        return 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-amber-500/50';
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

  return (
    <div className="relative animate-fade-in flex flex-col space-y-4 text-left">
      {/* 1. Main Omikuji Scroll Card */}
      <div className={`p-6 sm:p-7 rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all duration-700 relative overflow-hidden ${
        isBadLuck 
          ? 'bg-purple-950/60 border-purple-500/50 shadow-purple-950/90' 
          : 'bg-black/50 border-white/15'
      }`}>
        {/* Decorative Shrine Header */}
        <div className="flex justify-between items-start border-b border-gray-700/60 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              {spot?.worldName || "Chrono World"} • 神社御神籤
            </span>
            <h3 className="text-sm font-extrabold text-purple-300">
              {spot?.locationName}
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
                {result.luck_level === '大吉' ? "최상의 대길운이 깃들었습니다!" : 
                 result.luck_level === '凶' || result.luck_level === '大凶' ? "경계와 성찰의 시간입니다." : 
                 "평온하고 길한 기운이 감돕니다."}
              </p>
            </div>
          </div>

          {/* Lucky Item / Meta Details */}
          <div className="flex items-center space-x-2 bg-gray-900/80 border border-gray-700/70 px-3 py-2 rounded-2xl text-xs">
            <img src={spot?.itemImage} alt={spot?.luckyItem} className="w-8 h-8 rounded-lg object-cover shadow" />
            <div className="text-left">
              <span className="text-[10px] text-amber-400 font-bold block">행운의 아이템</span>
              <span className="text-white font-bold">{spot?.luckyItem}</span>
            </div>
          </div>
        </div>

        {/* Poetic Verse (운세 시) */}
        {result.meta_info?.poem && (
          <div className="my-4 p-3.5 bg-gray-900/60 rounded-2xl border border-gray-800 text-center font-serif">
            <p className="text-xs sm:text-sm text-amber-200 font-medium italic leading-relaxed">
              "{result.meta_info.poem}"
            </p>
          </div>
        )}

        {/* 5 Traditional Life Categories (세부운) */}
        {result.meta_info?.categories && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 my-4">
            {result.meta_info.categories.wish && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-purple-400 font-bold block">願事 (소원)</span>
                <span className="text-xs text-gray-200 font-medium">{result.meta_info.categories.wish}</span>
              </div>
            )}
            {result.meta_info.categories.love && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-pink-400 font-bold block">戀愛 (인연)</span>
                <span className="text-xs text-gray-200 font-medium">{result.meta_info.categories.love}</span>
              </div>
            )}
            {result.meta_info.categories.wealth && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-yellow-400 font-bold block">金運 (재물)</span>
                <span className="text-xs text-gray-200 font-medium">{result.meta_info.categories.wealth}</span>
              </div>
            )}
            {result.meta_info.categories.work && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-blue-400 font-bold block">事業 (학업·일)</span>
                <span className="text-xs text-gray-200 font-medium">{result.meta_info.categories.work}</span>
              </div>
            )}
            {result.meta_info.categories.travel && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-bold block">旅行 (이동)</span>
                <span className="text-xs text-gray-200 font-medium">{result.meta_info.categories.travel}</span>
              </div>
            )}
            {result.meta_info.categories.waiting && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-cyan-400 font-bold block">待人 (기다림)</span>
                <span className="text-xs text-gray-200 font-medium">{result.meta_info.categories.waiting}</span>
              </div>
            )}
          </div>
        )}

        {/* Traditional Knot / Storage Buttons & Share */}
        <div className="pt-3 border-t border-gray-800/80 flex flex-wrap justify-between items-center gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => { setIsTied(true); setIsSaved(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                isTied 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>🎋</span>
              <span>{isTied ? "신사에 묶음 완료" : "신사에 묶어 액막이"}</span>
            </button>
            <button
              onClick={() => { setIsSaved(true); setIsTied(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                isSaved 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>👛</span>
              <span>{isSaved ? "지갑에 소장 완료" : "지갑에 부적으로 보관"}</span>
            </button>
          </div>

          <button
            onClick={onShare}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1 shadow"
          >
            <span>🎫</span>
            <span>운명 티켓 공유</span>
          </button>
        </div>
      </div>

      {/* 2. Kyo (흉) Reversal Glitch Banner */}
      {isBadLuck && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/80 via-black to-indigo-950/80 border border-purple-500/50 shadow-2xl flex flex-col space-y-2 animate-pulse text-left">
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-spin-slow">🌀</span>
            <h4 className="text-sm font-black text-purple-300">
              차원 왜곡 경고: 이세계 반전 구원 프로토콜
            </h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            이 차원의 '흉'은 다른 평행우주에서 '대길'로 수렴합니다. 신비로운 <span className="text-amber-400 font-bold">{spot?.luckyItem}</span>(이)가 당신의 액운을 흡수하여 새로운 기회로 치환하고 있습니다.
          </p>
        </div>
      )}

      {/* 3. Deep LLM Counseling Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-purple-500/30 shadow-2xl flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔮</span>
            <h4 className="text-sm sm:text-base font-black text-purple-300">
              {spot?.worldName} AI 심층 운명 해석
            </h4>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            소모: 1토큰 (보유: {userTokens}/3)
          </span>
        </div>

        {!llmResult ? (
          <div className="flex flex-col space-y-2.5">
            <textarea
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="현재 고민하고 계신 일(진로, 연애, 이직, 시험 등)을 적어주시면 해당 세계관의 캐릭터가 점괘를 심층 해석해 드립니다."
              rows={3}
              className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => onInterpret(userContext)}
              disabled={isInterpreting || userTokens <= 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 ${
                isInterpreting || userTokens <= 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
              }`}
            >
              <span>{isInterpreting ? "✨ 차원의 지혜를 불러오는 중..." : "AI 심층 해석 의뢰하기 (1 토큰)"}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-gray-900/90 rounded-2xl border border-purple-500/40 text-left space-y-2 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-amber-300">
                📜 {llmResult.world_concept_title || `${spot?.worldName}의 전언`}
              </span>
              <span className="text-[10px] text-gray-400">Gemini 2.5 Flash</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-line leading-relaxed font-sans">
              {llmResult.interpretation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
