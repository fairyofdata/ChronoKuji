import React, { useState } from 'react';
import { SPOTS } from './constants';
import { OmikujiResult } from './types';

interface ShareTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: OmikujiResult | null;
  spotId: number;
}

export default function ShareTicketModal({ isOpen, onClose, result, spotId }: ShareTicketModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  if (!isOpen || !result) return null;

  const spot = SPOTS.find(s => s.id === spotId);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in text-white">
      <div 
        className="relative w-full max-w-sm bg-gray-900 border border-purple-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ticket Header */}
        <div className="text-center">
          <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">
            CHRONO PASS • MULTIVERSE FATE TICKET
          </span>
          <h3 className="text-lg font-black text-white">차원 운명 티켓</h3>
        </div>

        {/* Cinematic Ticket Body */}
        <div className="w-full rounded-2xl bg-gradient-to-b from-gray-950 to-gray-900 border border-purple-500/40 p-4 relative shadow-2xl flex flex-col space-y-3">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <div>
              <span className="text-[10px] text-gray-400 block">DESTINATION</span>
              <span className="text-xs font-black text-purple-300">{spot?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">LUCK RANK</span>
              <span className="text-sm font-black text-amber-300">{result.luck_level}</span>
            </div>
          </div>

          <div className="w-full h-28 rounded-xl overflow-hidden relative border border-gray-800">
            <img src={spot?.bgImage} alt={spot?.name} className="w-full h-full object-cover filter brightness-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent flex items-end p-2">
              <span className="text-[11px] font-bold text-white">
                행운 아이템: {spot?.luckyItem}
              </span>
            </div>
          </div>

          {result.meta_info?.poem && (
            <p className="text-xs text-amber-200/90 italic text-center font-serif py-1">
              "{result.meta_info.poem}"
            </p>
          )}

          <div className="pt-2 border-t border-dashed border-gray-700 text-center">
            <p className="text-[10px] text-gray-400 font-mono">
              🔮 ChronoKuji • https://github.com/fairyofdata/ChronoKuji
            </p>
          </div>
        </div>

        {/* Share & Close Buttons */}
        <div className="w-full flex space-x-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition"
          >
            {copied ? "✅ 링크 복사 완료!" : "🔗 공유 링크 복사"}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
