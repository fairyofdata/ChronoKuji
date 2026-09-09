import React from 'react';
import { CODEX_ITEMS } from './constants';
import { CollectedCodexItem } from './types';
import { useLanguage } from './i18n/LanguageContext';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectedItems: CollectedCodexItem[];
  isComplete: boolean;
}

export default function CodexModal({ isOpen, onClose, collectedItems = [], isComplete = false }: CodexModalProps) {
  const { t, getSpotTranslation } = useLanguage();

  if (!isOpen) return null;

  const collectedNames = new Set(collectedItems.map(item => item.name));
  const collectedCount = CODEX_ITEMS.filter(item => collectedNames.has(item.name)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-gray-900/90 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-950/80 via-gray-900 to-indigo-950/80">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg font-black text-purple-300 drop-shadow">
                {t.codex.title}
              </h2>
              <p className="text-xs text-gray-400">
                {t.codex.subtitle}
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

        {/* Progress Bar & Hidden Spot Status */}
        <div className="p-4 bg-black/40 border-b border-gray-800 flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-bold">{t.codex.progress}</span>
            <span className="text-amber-400 font-extrabold">{t.codex.collectedCount(collectedCount, 11)}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(collectedCount / 11) * 100}%` }}
            />
          </div>
          {isComplete ? (
            <div className="mt-1 p-2 bg-amber-950/60 border border-amber-500/50 rounded-xl text-center">
              <span className="text-xs font-bold text-amber-300 animate-pulse">
                {t.codex.hiddenUnlocked}
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 text-center">
              {t.codex.hiddenLockedNotice}
            </p>
          )}
        </div>

        {/* Items Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CODEX_ITEMS.map((item, index) => {
            const isCollected = collectedNames.has(item.name);
            const orderNum = String(index + 1).padStart(2, '0');
            const spotInfo = getSpotTranslation(item.spotId);
            const displayName = isCollected ? spotInfo.luckyItem : t.codex.unknownTreasure;

            return (
              <div 
                key={item.id}
                className={`relative p-3 rounded-2xl border transition-all flex flex-col items-center text-center ${
                  isCollected 
                    ? 'bg-gray-800/80 border-purple-500/40 shadow-lg shadow-purple-950/40' 
                    : 'bg-gray-950/60 border-gray-800 opacity-40 grayscale'
                }`}
              >
                <div className="absolute top-2 right-2">
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-gray-300">
                    #{orderNum}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-2 border border-gray-700 bg-gray-900 flex items-center justify-center">
                  {isCollected ? (
                    <img src={item.image} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-600">❓</span>
                  )}
                </div>
                <span className="text-[10px] text-purple-400 font-bold">{spotInfo.locationName}</span>
                <h4 className="text-xs font-extrabold text-white mb-1">{displayName}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                  {isCollected ? (spotInfo.itemDesc || item.desc) : t.codex.drawToCollect}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
