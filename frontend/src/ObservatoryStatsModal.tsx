import React, { useState, useEffect } from 'react';
import { ObservatoryStats } from './types';
import { LocalGameService } from './services/localGameService';
import { useLanguage } from './i18n/LanguageContext';

interface ObservatoryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ObservatoryStatsModal({ isOpen, onClose }: ObservatoryStatsModalProps) {
  const { t, getSpotTranslation } = useLanguage();
  const [stats, setStats] = useState<ObservatoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      LocalGameService.getObservatoryStats()
        .then(data => setStats(data))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLuckColor = (level: string) => {
    switch (level) {
      case '大吉': return 'bg-amber-500 text-amber-950 border-amber-400';
      case '中吉': return 'bg-emerald-500 text-emerald-950 border-emerald-400';
      case '小吉': return 'bg-cyan-500 text-cyan-950 border-cyan-400';
      case '吉': return 'bg-blue-500 text-blue-950 border-blue-400';
      case '末吉': return 'bg-slate-500 text-slate-950 border-slate-400';
      case '凶': return 'bg-purple-600 text-purple-100 border-purple-400';
      case '大凶': return 'bg-rose-700 text-rose-100 border-rose-500';
      default: return 'bg-gray-600 text-white border-gray-500';
    }
  };

  const getLuckBarColor = (level: string) => {
    switch (level) {
      case '大吉': return 'bg-gradient-to-r from-amber-600 to-yellow-400';
      case '中吉': return 'bg-gradient-to-r from-emerald-600 to-teal-400';
      case '小吉': return 'bg-gradient-to-r from-cyan-600 to-blue-400';
      case '吉': return 'bg-gradient-to-r from-blue-600 to-indigo-400';
      case '末吉': return 'bg-gradient-to-r from-slate-600 to-gray-400';
      case '凶': return 'bg-gradient-to-r from-purple-700 to-pink-500';
      case '大凶': return 'bg-gradient-to-r from-rose-700 to-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-gray-950/90 border border-purple-500/40 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-gray-900 to-indigo-950/40">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center space-x-2">
                <span>{t.stats.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {t.stats.badge}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {t.stats.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-left custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 animate-pulse space-y-2">
              <div className="text-3xl">🔮</div>
              <p className="text-xs font-mono">{t.stats.loading}</p>
            </div>
          ) : stats ? (
            <>
              {/* 4 Core KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/50 border border-purple-500/20 shadow-lg text-center">
                  <span className="text-[10px] text-purple-300 font-bold block mb-1">{t.stats.totalTravelers}</span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {stats.total_travelers.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-gray-500">Active Travelers</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/20 shadow-lg text-center">
                  <span className="text-[10px] text-amber-300 font-bold block mb-1">{t.stats.totalFortunes}</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                    {stats.total_fortunes_drawn.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-gray-500">Fortunes Drawn</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-indigo-500/20 shadow-lg text-center">
                  <span className="text-[10px] text-indigo-300 font-bold block mb-1">{t.stats.totalAi}</span>
                  <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
                    {stats.total_ai_interpretations.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-gray-500">LLM Inference</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/20 shadow-lg text-center">
                  <span className="text-[10px] text-emerald-300 font-bold block mb-1">{t.stats.satisfaction}</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                    {stats.feedback.satisfaction_rate}%
                  </div>
                  <span className="text-[9px] text-gray-500">{stats.feedback.positive}👍 / {stats.feedback.negative}👎</span>
                </div>
              </div>

              {/* Section 1: Fortune Luck Level Distribution */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center space-x-1.5">
                    <span>🎲</span>
                    <span>{t.stats.luckDistributionTitle}</span>
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {t.stats.luckDistributionSubtitle}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {stats.luck_distribution.map(item => (
                    <div key={item.level} className="flex items-center space-x-3 text-xs font-mono">
                      <span className={`w-12 text-center text-[11px] font-black px-1.5 py-0.5 rounded-lg border font-serif ${getLuckColor(item.level)}`}>
                        {item.level}
                      </span>
                      <div className="flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${getLuckBarColor(item.level)}`}
                          style={{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-gray-300 font-bold">
                        {item.percentage}%
                      </span>
                      <span className="w-10 text-right text-gray-500 text-[10px]">
                        ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Multiverse Spot Exploration Popularity */}
              {stats.spot_distribution.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center space-x-1.5">
                      <span>🌌</span>
                      <span>{t.stats.spotPopularityTitle}</span>
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {t.stats.spotPopularitySubtitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {stats.spot_distribution.slice(0, 6).map((spot, idx) => {
                      const spotInfo = getSpotTranslation(spot.spot_id);
                      return (
                        <div key={spot.spot_id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-[10px] font-mono text-purple-400 font-bold">#{idx + 1}</span>
                            <span className="text-gray-200 font-medium truncate">
                              {spotInfo.locationName} ({spotInfo.worldName})
                            </span>
                          </div>
                          <span className="text-amber-400 font-mono font-bold text-[11px] ml-2 shrink-0">
                            {typeof t.stats.visitsCount === 'function' ? t.stats.visitsCount(spot.visits) : `${spot.visits} visits`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Engineering Architecture Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 text-[11px] space-y-1.5 text-gray-300">
                <div className="flex items-center space-x-1 text-purple-300 font-bold">
                  <span>💡</span>
                  <span>{t.stats.archHighlightTitle}</span>
                </div>
                <p className="leading-relaxed text-gray-400">
                  {t.stats.archHighlightDesc}
                </p>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              {t.stats.failedToLoad}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-gray-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition active:scale-95 shadow-lg shadow-purple-600/30"
          >
            {t.stats.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
