import React, { useState, useEffect } from 'react';
import { SPOTS } from './constants';
import { AudioEngine } from './audioEngine';

export default function HistoryModal({ isOpen, onClose, userId, currentSpotId }) {
  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 기록보관소 전용 음악: 메이플스토리 차원의 균열
      AudioEngine.playHistoryMusic();
      if (userId) fetchHistory();
    }
    return () => {
      if (isOpen) {
        // 모달 닫힐 때 원래 음악(현재 스팟 음악 또는 로비 음악)으로 복귀
        if (currentSpotId) {
          AudioEngine.playSpotMusic(currentSpotId);
        } else {
          AudioEngine.playLobbyMusic();
        }
      }
    };
  }, [isOpen, userId, currentSpotId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/omikuji/history', {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setHistories(data.histories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-gray-900/90 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-950/80 via-gray-900 to-indigo-950/80">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📜</span>
            <div>
              <h2 className="text-lg font-black text-purple-300 drop-shadow">
                차원 점괘 기록보관소 (Fate Archive)
              </h2>
              <p className="text-xs text-gray-400">
                당신이 차원을 넘나들며 마주했던 운명과 AI 심층 해석의 기록
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 animate-pulse">
              ⏳ 과거의 시공간 기록을 펼치는 중...
            </div>
          ) : histories.length === 0 ? (
            <div className="p-12 text-center bg-gray-950/40 rounded-2xl border border-gray-800">
              <span className="text-3xl block mb-2">🥠</span>
              <p className="text-sm font-bold text-gray-300">아직 뽑은 점괘 기록이 없습니다.</p>
              <p className="text-xs text-gray-500 mt-1">차원을 탐험하며 운명의 산통을 흔들어보세요.</p>
            </div>
          ) : (
            histories.map((h, idx) => {
              const spot = SPOTS.find(s => s.id === h.spot_id);
              const isGoodLuck = h.luck_level.includes("대길") || h.luck_level.includes("길");

              return (
                <div 
                  key={h.history_id || idx}
                  className="p-4 bg-gray-950/60 border border-gray-800 hover:border-purple-500/50 rounded-2xl transition-all shadow-md space-y-3"
                >
                  {/* Top Bar: Date, Spot, Luck Level */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-800/80 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                        📍 {spot?.name || "차원의 틈새"}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {h.drawn_at}
                      </span>
                    </div>

                    <span className={`px-3 py-0.5 rounded-full text-xs font-black shadow ${
                      isGoodLuck 
                        ? 'bg-amber-400 text-gray-950' 
                        : 'bg-red-900/80 text-red-200 border border-red-700'
                    }`}>
                      {h.luck_level}
                    </span>
                  </div>

                  {/* Poem & Base Text */}
                  {h.meta_info?.poem && (
                    <p className="text-xs text-amber-200/90 font-serif italic bg-amber-950/20 p-2 rounded-xl border border-amber-500/20">
                      📜 "{h.meta_info.poem}"
                    </p>
                  )}

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {h.original_text}
                  </p>

                  {/* User Context & LLM Interpretation */}
                  {h.llm_interpretation && (
                    <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1.5 mt-2">
                      {h.user_context && (
                        <p className="text-[11px] text-purple-300 font-semibold">
                          💭 <span className="text-gray-400 font-normal">당시의 고민:</span> "{h.user_context}"
                        </p>
                      )}
                      <div className="text-xs text-purple-100 leading-relaxed border-t border-purple-500/20 pt-1.5">
                        <span className="font-bold text-purple-300 block mb-1">✨ AI 심층 해석:</span>
                        {h.llm_interpretation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-semibold">
            총 {histories.length}건의 운명 기록
          </span>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
