import React, { useState, useEffect } from 'react';
import { SPOTS } from './constants';
import { OmikujiResult, LlmInterpretationResult, Spot } from './types';
import { useToast } from './Toast';
import { getSpacetimeFortune } from './omikujiLore';
import { generateAmuletCardImage } from './utils/AmuletCardGenerator';
import { LocalGameService } from './services/LocalGameService';
import { useLanguage } from './i18n/LanguageContext';

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
  const { t, getSpotTranslation, language } = useLanguage();
  const [userContext, setUserContext] = useState('');
  const [isTied, setIsTied] = useState(false);
  const [isTieAnimating, setIsTieAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<number | null>(null);
  const { showToast } = useToast();

  const activeSpot = spot || SPOTS.find(s => s.id === result.spot_id);
  const spotInfo = activeSpot ? getSpotTranslation(activeSpot.id) : null;
  const isGreatLuck = result.luck_level === "大吉";
  const isBadLuck = result.luck_level === "凶" || result.luck_level === "大凶";

  // 12대 세계관 맞춤형 오미쿠지 로어 보강 (언어별 다국어 완벽 적용)
  const spotId = activeSpot?.id || result.spot_id;
  const customLore = getSpacetimeFortune(spotId, result.luck_level, language);
  const displayPoem = customLore?.poem || result.meta_info?.poem;
  const displayText = customLore?.text || result.original_text;
  const displayCategories = customLore?.categories || result.meta_info?.categories;

  const formatLuckyDirection = (dir?: string) => {
    if (!dir) return '';
    if (language === 'ko') return dir;
    const directionMapEn: Record<string, string> = {
      '동쪽': 'East',
      '서쪽': 'West',
      '남쪽': 'South',
      '북쪽': 'North',
      '동북쪽': 'North-East',
      '북동쪽': 'North-East',
      '동남쪽': 'South-East',
      '남동쪽': 'South-East',
      '서북쪽': 'North-West',
      '북서쪽': 'North-West',
      '서남쪽': 'South-West',
      '남서쪽': 'South-West',
    };
    const directionMapJa: Record<string, string> = {
      '동쪽': '東',
      '서쪽': '西',
      '남쪽': '南',
      '북쪽': '北',
      '동북쪽': '北東',
      '북동쪽': '北東',
      '동남쪽': '南東',
      '남동쪽': '南東',
      '서북쪽': '北西',
      '북서쪽': '北西',
      '서남쪽': '南西',
      '남서쪽': '南西',
    };
    let formatted = dir;
    if (language === 'en') {
      for (const [k, v] of Object.entries(directionMapEn)) {
        if (formatted.includes(k)) return `${v} Dimensional Wind`;
      }
      return formatted.replace('차원의 바람', 'Dimensional Wind');
    } else if (language === 'ja') {
      for (const [k, v] of Object.entries(directionMapJa)) {
        if (formatted.includes(k)) return `${v}の次元風`;
      }
      return formatted.replace('차원의 바람', 'の次元風');
    }
    return formatted;
  };

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
        title: language === 'en' ? '⛩️ Purification Complete' : language === 'ja' ? '⛩️ 厄払い完了' : '⛩️ 액막이 결계 완료',
        message: language === 'en' 
          ? 'The inauspicious fortune was tied to the dimensional ward.\nNew blessings now flow toward you.' 
          : language === 'ja' 
          ? '不吉なおみくじを結界に結び、厄を祓いました。\n新たな吉祥の気が宿ります。' 
          : '불길한 점괘를 차원의 결계에 묶어 액을 털어냈습니다.\n이제 길한 새로운 기운이 당신에게 깃듭니다.'
      });
    }, 1200);
  };

  // 점괘 텍스트 복사하기
  const handleCopyFortuneText = () => {
    const spotName = spotInfo?.locationName || activeSpot?.locationName;
    const worldName = spotInfo?.worldName || activeSpot?.worldName;
    const luckyItem = spotInfo?.luckyItem || activeSpot?.luckyItem;
    const text = `🥠 [ChronoKuji]\n${language === 'en' ? 'Dimension' : language === 'ja' ? '次元' : '차원'}: ${worldName} (${spotName})\n${t.omikuji.gradeLabel}: ${result.luck_level}\n${t.omikuji.luckyItemLabel}: ${luckyItem}\n\n${displayPoem ? `"${displayPoem}"\n` : ''}${t.omikuji.overallTitle}: ${displayText || ''}\n\nhttps://chronokuji.web.app`;
    navigator.clipboard.writeText(text).then(() => {
      showToast({
        type: 'success',
        title: language === 'en' ? '📋 Copied' : language === 'ja' ? '📋 コピー完了' : '📋 복사 완료',
        message: language === 'en' ? 'Fortune text copied to clipboard.' : language === 'ja' ? 'おみくじをクリップボードにコピーしました。' : '점괘 내용이 클립보드에 복사되었습니다.'
      });
    });
  };

  // 차원 부적 포토카드 PNG 생성 및 다운로드/공유
  const handleDownloadAmuletCard = async () => {
    if (!activeSpot || isGeneratingCard) return;
    setIsGeneratingCard(true);

    try {
      showToast({
        type: 'info',
        title: language === 'en' ? '🎨 Rendering Amulet' : language === 'ja' ? '🎨 お守り生成中' : '🎨 차원 부적 렌더링 중',
        message: language === 'en' ? 'Generating high-resolution 9:16 photocard...' : language === 'ja' ? '高画質9:16お守り画像を生成しています...' : '고화질 9:16 포토카드 이미지를 생성하고 있습니다...'
      });

      const blob = await generateAmuletCardImage({
        spot: activeSpot,
        luckLevel: result.luck_level,
        poem: displayPoem || "The dimensional winds guide your fate.",
        overallText: displayText || "Great fortune walks beside you.",
        language: language,
        spotInfo: spotInfo || undefined
      });

      const file = new File([blob], `ChronoKuji_${activeSpot.name}_${result.luck_level}.png`, { type: 'image/png' });

      // 모바일 Web Share API 파일 공유 지원 검사
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `ChronoKuji - ${spotInfo?.worldName || activeSpot.worldName} ${result.luck_level}`,
            text: `[ChronoKuji] ${spotInfo?.locationName || activeSpot.locationName} - ${result.luck_level}`
          });
          showToast({
            type: 'success',
            title: language === 'en' ? '📸 Shared' : language === 'ja' ? '📸 共有完了' : '📸 부적 공유 완료',
            message: language === 'en' ? 'Amulet photocard shared.' : language === 'ja' ? 'お守りカードを共有しました。' : '차원 부적 카드가 공유되었습니다.'
          });
          return;
        } catch {
          // 취소 시 브라우저 다운로드로 진행
        }
      }

      // 브라우저 직접 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ChronoKuji_Amulet_${activeSpot.name}_${result.luck_level}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: language === 'en' ? '📸 Saved' : language === 'ja' ? '📸 保存完了' : '📸 부적 저장 완료',
        message: language === 'en' ? 'High-resolution amulet card (PNG) downloaded.' : language === 'ja' ? '高解像度お守りカード(PNG)をダウンロードしました。' : '고화질 차원 부적 카드(PNG)가 다운로드되었습니다.'
      });
    } catch (e) {
      console.error(e);
      showToast({
        type: 'error',
        title: language === 'en' ? 'Failed to Create Card' : language === 'ja' ? 'カード生成失敗' : '카드 생성 실패',
        message: language === 'en' ? 'An error occurred during image generation.' : language === 'ja' ? '画像生成中にエラーが発生しました。' : '이미지 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleFeedback = async (rating: number) => {
    setFeedbackSent(rating);
    await LocalGameService.saveFeedback(result.history_id, rating);
    showToast({
      type: 'success',
      title: rating === 1 
        ? (language === 'en' ? 'Feedback Recorded' : language === 'ja' ? 'フィードバック反映完了' : '소중한 피드백 반영 완료') 
        : (language === 'en' ? 'Feedback Received' : language === 'ja' ? 'フィードバック受付完了' : '피드백 접수 완료'),
      message: rating === 1 
        ? (language === 'en' ? 'Your feedback will be used to improve AI interpretation quality.' : language === 'ja' ? 'AI解釈クオリティ向上に反映されます。' : 'AI 심층 해석 품질 개선 및 RLHF 파이프라인에 반영되었습니다.') 
        : (language === 'en' ? 'Thank you! We will refine future spacetime prompts.' : language === 'ja' ? '貴重なご意見を参考にプロンプトを調整します。' : '의견이 접수되었습니다. 향후 프롬프트 및 인과율 튜닝에 참고하겠습니다.')
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
            <span>🎗️ {t.omikuji.tiedBanner}</span>
          </div>
        )}

        {/* Decorative Shrine Header */}
        <div className="flex justify-between items-start border-b border-gray-700/60 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              {spotInfo?.worldName || "Chrono World"} • {t.omikuji.spotSubtitle}
            </span>
            <h3 className="text-sm font-extrabold text-purple-300">
              {spotInfo?.locationName}
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
              <p className="text-xs text-gray-400">{t.omikuji.gradeLabel}</p>
              <p className="text-sm font-bold text-gray-200">
                {result.luck_level === '大吉' ? t.omikuji.greatLuckCheer : 
                 result.luck_level === '凶' || result.luck_level === '大凶' ? (isTied ? t.omikuji.purifiedWarn : t.omikuji.badLuckWarn) : 
                 t.omikuji.peacefulCheer}
              </p>
            </div>
          </div>

          {/* Lucky Item / Meta Details */}
          <div className="flex items-center space-x-2 bg-gray-900/80 border border-gray-700/70 px-3 py-2 rounded-2xl text-xs">
            <img src={activeSpot?.itemImage} alt={spotInfo?.luckyItem} className="w-8 h-8 rounded-lg object-cover shadow" />
            <div className="text-left">
              <span className="text-[10px] text-amber-400 font-bold block">{t.omikuji.luckyItemLabel}</span>
              <span className="text-white font-bold">{spotInfo?.luckyItem}</span>
            </div>
          </div>
        </div>

        {/* Poetic Verse (운세 시) */}
        {displayPoem && (
          <div className="my-3.5 p-4 bg-gradient-to-r from-gray-950 via-purple-950/30 to-gray-950 rounded-2xl border border-purple-500/30 text-center font-serif shadow-inner">
            <span className="text-[10px] text-purple-400 font-mono tracking-widest block mb-1">
              ✦ {t.omikuji.poemTitle(spotInfo?.worldName || "Chrono World")} ✦
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
              📜 {t.omikuji.overallTitle}
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
                <span className="text-[10px] text-purple-400 font-bold block">{t.omikuji.categories.wish}</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.wish}</span>
              </div>
            )}
            {displayCategories.love && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-pink-400 font-bold block">{t.omikuji.categories.love}</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.love}</span>
              </div>
            )}
            {displayCategories.wealth && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-yellow-400 font-bold block">{t.omikuji.categories.wealth}</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.wealth}</span>
              </div>
            )}
            {displayCategories.work && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-blue-400 font-bold block">{t.omikuji.categories.work}</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.work}</span>
              </div>
            )}
            {displayCategories.travel && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-bold block">{t.omikuji.categories.travel}</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.travel}</span>
              </div>
            )}
            {displayCategories.waiting && (
              <div className="bg-black/40 border border-gray-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-cyan-400 font-bold block">{t.omikuji.categories.waiting}</span>
                <span className="text-xs text-gray-200 font-medium">{displayCategories.waiting}</span>
              </div>
            )}
          </div>
        )}

        {/* Lucky Direction & Number */}
        <div className="flex flex-wrap gap-2 text-[11px] font-bold text-gray-300 pt-2 border-t border-gray-800/80">
          {result.meta_info?.lucky_direction && (
            <span className="bg-gray-900/80 border border-gray-700/60 px-3 py-1 rounded-xl">
              🧭 {t.omikuji.luckyDirection}: <span className="text-cyan-300">{formatLuckyDirection(result.meta_info.lucky_direction)}</span>
            </span>
          )}
          {result.meta_info?.lucky_number && (
            <span className="bg-gray-900/80 border border-gray-700/60 px-3 py-1 rounded-xl">
              🎲 {t.omikuji.luckyNumber}: <span className="text-amber-300">{result.meta_info.lucky_number}</span>
            </span>
          )}
        </div>

        {/* Actions: Amulet Card Download, Copy & Bad Luck Tie Button */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-800/80">
          <button
            onClick={handleDownloadAmuletCard}
            disabled={isGeneratingCard}
            className="text-xs font-black px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-gray-950 shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>📸</span>
            <span>{isGeneratingCard ? t.omikuji.generatingCard : t.omikuji.saveCardPng}</span>
          </button>

          <button
            onClick={handleCopyFortuneText}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600/50 transition flex items-center space-x-1.5 shadow active:scale-95"
          >
            <span>📋</span>
            <span>{t.omikuji.copyText}</span>
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
              <span>{isTieAnimating ? t.omikuji.tyingBadLuck : t.omikuji.tieBadLuck}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. AI Deep Interpretation Section */}
      <div className="p-5 sm:p-6 rounded-3xl backdrop-blur-2xl bg-black/60 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-gray-800 pb-2.5 gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔮</span>
            <h4 className="text-sm font-extrabold text-white">
              {t.omikuji.aiTitle(spotInfo?.worldName || activeSpot?.worldName || "")}
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSamplePreview(prev => !prev)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/80 transition shadow"
            >
              {t.omikuji.sampleToggle(showSamplePreview)}
            </button>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300">
              {isGuest 
                ? (userTokens > 0 ? t.omikuji.guestFreeBadge : t.omikuji.guestExhaustedBadge) 
                : t.omikuji.tokensLeft(userTokens)}
            </span>
          </div>
        </div>

        {/* Sample Preview Accordion Box */}
        {showSamplePreview && (
          <div className="mb-4 p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl text-xs space-y-2 animate-fade-in text-left">
            <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px]">
              <span>[{language === 'en' ? 'User Question Example' : language === 'ja' ? '質問の例' : '실제 질문 예시'}]: "{t.omikuji.sampleQuestion}"</span>
            </div>
            <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 block">
                ✦ {t.omikuji.sampleAnswerTitle(spotInfo?.worldName || activeSpot?.worldName || "")}
              </span>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                "{t.omikuji.sampleAnswer}"
              </p>
            </div>
          </div>
        )}

        {/* Interpretation Result */}
        {llmResult ? (
          <div className="space-y-3 animate-fade-in text-xs leading-relaxed text-gray-300">
            <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">
                ✦ {llmResult.world_concept_title || (language === 'en' ? "Spacetime Message" : language === 'ja' ? "次元のお告げ" : "차원의 메시지")}
              </span>
              <p className="text-gray-200 font-medium leading-relaxed">
                {llmResult.interpretation}
              </p>
            </div>

            {llmResult.world_bgm_action && (
              <p className="text-[11px] text-gray-400 italic">
                {llmResult.world_bgm_action}
              </p>
            )}

            {/* RLHF & Prompt Evaluation Feedback Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-purple-500/20 text-[11px]">
              <span className="text-gray-400 font-medium flex items-center space-x-1">
                <span>✦</span>
                <span>{t.omikuji.feedbackQuestion}</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFeedback(1)}
                  disabled={feedbackSent !== null}
                  className={`px-3 py-1 rounded-xl border font-bold transition flex items-center space-x-1 active:scale-95 ${
                    feedbackSent === 1
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                      : 'bg-black/50 border-gray-700 hover:border-emerald-500/60 hover:text-emerald-300 text-gray-300'
                  }`}
                >
                  <span>👍</span>
                  <span>{feedbackSent === 1 ? (language === 'en' ? 'Helpful' : language === 'ja' ? '参考になった' : '도움됨') : t.omikuji.feedbackHelpful}</span>
                </button>
                <button
                  onClick={() => handleFeedback(-1)}
                  disabled={feedbackSent !== null}
                  className={`px-3 py-1 rounded-xl border font-bold transition flex items-center space-x-1 active:scale-95 ${
                    feedbackSent === -1
                      ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-md shadow-rose-500/20'
                      : 'bg-black/50 border-gray-700 hover:border-rose-500/60 hover:text-rose-300 text-gray-300'
                  }`}
                >
                  <span>👎</span>
                  <span>{feedbackSent === -1 ? (language === 'en' ? 'Recorded' : language === 'ja' ? '記録済' : '반영됨') : t.omikuji.feedbackNeedsWork}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (userTokens > 0) ? (
          /* User has token (Guest 1st Free Pass OR Logged-in User) */
          <div className="space-y-3 text-left">
            {isGuest && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center space-x-2">
                <span>🎁</span>
                <span><strong>{t.omikuji.guestWelcomeBenefit}</strong></span>
              </div>
            )}
            <p className="text-xs text-gray-400">
              {t.omikuji.counselingDesc}
            </p>
            <textarea
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder={t.omikuji.counselingPlaceholder}
              rows={3}
              maxLength={300}
              className="w-full bg-gray-950/80 border border-gray-700/80 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">{t.omikuji.charCount(userContext.length, 300)}</span>
              <button
                onClick={() => onInterpret(userContext)}
                disabled={isInterpreting || !userContext.trim()}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg flex items-center space-x-1.5 ${
                  isInterpreting || !userContext.trim()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/50 active:scale-95'
                }`}
              >
                <span>✨</span>
                <span>
                  {isInterpreting 
                    ? t.omikuji.interpretingAi 
                    : (isGuest ? t.omikuji.requestAiButtonFree : t.omikuji.requestAiButton)}
                </span>
              </button>
            </div>
          </div>
        ) : isGuest ? (
          /* Guest exhausted free pass -> Prompt Google Login */
          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl text-center space-y-2.5">
            <span className="text-xl block">🎉</span>
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {t.omikuji.loginPromptDesc}
            </p>
            {onGoogleLogin && (
              <button
                onClick={onGoogleLogin}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-100 transition shadow-lg inline-flex items-center space-x-1.5 active:scale-95"
              >
                <span>🔑</span>
                <span>{t.omikuji.loginGoogleButton}</span>
              </button>
            )}
          </div>
        ) : (
          /* Member waiting for cooldown refill */
          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl text-center space-y-1">
            <p className="text-xs text-gray-300">
              {t.omikuji.exhaustedMemberTitle}
            </p>
            <p className="text-[11px] text-gray-400">
              {t.omikuji.exhaustedMemberDesc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
