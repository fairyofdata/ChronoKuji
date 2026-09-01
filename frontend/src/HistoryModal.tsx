import React, { useState, useEffect } from 'react';
import { SPOTS } from './constants';
import { AudioEngine } from './audioEngine';
import { FateHistoryItem } from './types';
import { API_BASE_URL } from './config';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentSpotId?: number | null;
}

export default function HistoryModal({ isOpen, onClose, userId, currentSpotId }: HistoryModalProps) {
  const [histories, setHistories] = useState<FateHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/omikuji/history`, {
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
                시공간을 여행하며 마주했던 과거의 모든 운명과 AI 해석
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* List Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400 animate-pulse text-sm">
              ✨ 기록보관소의 양피지를 펼치는 중입니다...
            </div>
          ) : histories.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <span className="text-3xl block">📭</span>
              <p className="text-sm">아직 기록된 점괘가 없습니다.</p>
              <p className="text-xs text-gray-500">다른 세계관으로 이동하여 첫 점괘를 뽑아보세요!</p>
            </div>
          ) : (
            histories.map((item) => {
              const spot = SPOTS.find(s => s.id === item.spot_id);
              const dateStr = item.drawn_at 
                ? new Date(item.drawn_at).toLocaleString('ko-KR', { 
                    year: 'numeric', month: 'short', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  }) 
                : "시간 불명";

              return (
                <div 
                  key={item.history_id}
                  className="p-4 rounded-2xl bg-gray-800/60 border border-gray-700/60 hover:border-purple-500/50 transition-all space-y-2 text-left"
                >
                  <div className="flex justify-between items-center border-b border-gray-700/40 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-purple-300">
                        {spot ? spot.name : "차원의 틈새"}
                      </span>
                      <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30 text-purple-200 font-bold">
                        {item.luck_level}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{dateStr}</span>
                  </div>

                  {item.meta_info?.poem && (
                    <p className="text-xs text-amber-200/90 italic font-serif bg-black/30 p-2 rounded-xl">
                      "{item.meta_info.poem}"
                    </p>
                  )}

                  {item.user_context && (
                    <div className="text-xs text-gray-300 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-purple-400 font-bold block mb-0.5">💭 나의 고민</span>
                      {item.user_context}
                    </div>
                  )}

                  {item.llm_interpretation && (
                    <div className="text-xs text-gray-200 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/30">
                      <span className="text-[10px] text-amber-400 font-bold block mb-0.5">✨ AI 심층 해석</span>
                      <p className="whitespace-pre-line leading-relaxed">{item.llm_interpretation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
