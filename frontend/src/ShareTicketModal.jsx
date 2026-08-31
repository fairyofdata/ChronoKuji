import React, { useState } from 'react';

export default function ShareTicketModal({ isOpen, onClose, omikujiResult, spot, llmResult }) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !omikujiResult) return null;

  const luckyItemName = omikujiResult?.meta_info?.lucky_item || spot?.luckyItem || '행운의 부적';
  const itemImage = omikujiResult?.meta_info?.item_image || spot?.itemImage || '/assets/items/item_1_windfeather.jpg';
  const isGoodLuck = omikujiResult.luck_level.includes("대길") || omikujiResult.luck_level.includes("길");
  
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const shareText = `🔮 [O_miku_Z] 오늘의 멀티버스 차원 점괘
📍 차원: ${spot?.name || "미지의 차원"}
✨ 운세: ${omikujiResult.luck_level}
🎁 럭키 아이템: ${luckyItemName}
📜 원문: "${omikujiResult.original_text}"
${llmResult?.world_concept_title ? `🧙‍♂️ 해석: ${llmResult.world_concept_title}` : ''}

👉 당신의 차원 운세도 확인해보세요: ${window.location.origin}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `O_miku_Z 차원 점괘 - ${omikujiResult.luck_level}`,
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-sm bg-stone-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-4 text-center border-b-2 border-dashed border-amber-700/60 relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-stone-900 flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
          <span className="text-[10px] tracking-widest font-black uppercase text-amber-950 block">
            OMIKU_Z DIMENSION TICKET
          </span>
          <h2 className="text-xl font-black text-stone-950 tracking-tight mt-0.5">
            🔮 차원 운세 티켓
          </h2>
          <span className="text-[11px] text-amber-900/90 font-semibold block mt-0.5">
            {today} 발행
          </span>
        </div>

        {/* Ticket Body (Paper style) */}
        <div className="bg-stone-100 p-5 space-y-4 text-left relative shadow-inner">
          {/* World Badge */}
          <div className="flex justify-between items-center border-b border-stone-300 pb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">DIMENSION</span>
            <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
              {spot?.shortName || spot?.name || "차원"}
            </span>
          </div>

          {/* Luck Tier */}
          <div className="text-center py-2 bg-stone-200/70 rounded-xl border border-stone-300">
            <span className="text-[10px] text-stone-600 font-bold block mb-0.5">운세 등급</span>
            <span className={`text-2xl font-black ${isGoodLuck ? 'text-amber-600' : 'text-stone-800'}`}>
              ✨ {omikujiResult.luck_level} ✨
            </span>
          </div>

          {/* Original Text */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-300/80">
            <p className="text-xs text-stone-700 leading-relaxed italic font-medium">
              "{omikujiResult.original_text}"
            </p>
          </div>

          {/* Lucky Item Card */}
          <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-300/80">
            <img 
              src={itemImage} 
              alt={luckyItemName} 
              className="w-12 h-12 rounded-lg object-cover border border-amber-400 shadow"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">LUCKY ITEM</span>
              <h4 className="text-sm font-black text-stone-900 truncate">
                {luckyItemName}
              </h4>
            </div>
          </div>

          {/* LLM Persona Title (if interpreted) */}
          {llmResult?.world_concept_title && (
            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs">
              <span className="font-extrabold text-purple-900 block mb-0.5">🧙‍♂️ 심층 해석 풀이</span>
              <p className="text-stone-700 text-[11px] line-clamp-2">
                {llmResult.world_concept_title}
              </p>
            </div>
          )}

          {/* Barcode Deco */}
          <div className="pt-2 border-t border-dashed border-stone-300 flex flex-col items-center">
            <div className="font-mono text-[9px] tracking-widest text-stone-400">
              ||| | ||||| || |||| || ||| |||| |
            </div>
            <span className="text-[9px] font-mono text-stone-400 mt-0.5">
              VERIFIED MULTIVERSE FORTUNE
            </span>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="bg-stone-900 p-4 border-t border-amber-500/30 flex flex-col gap-2">
          <button 
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 text-sm"
          >
            <span>{isCopied ? "✅ 클립보드 복사 완료!" : "📲 운세 티켓 공유하기 (SNS/링크)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
