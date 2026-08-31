import { useState, useEffect } from 'react';
import { SPOTS, CODEX_ITEMS } from './constants';
import ShareTicketModal from './ShareTicketModal';
import { AudioEngine } from './audioEngine';

export default function OmikujiView({ omikujiResult, setOmikujiResult, llmResult, userContext, setUserContext, handleInterpret, isLoading, onCollectItem }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [actualItem, setActualItem] = useState(null);
  const [dropType, setDropType] = useState('native'); // 'great_luck' | 'reversal_rift' | 'normal_drop' | 'no_item'
  const [isRiftRevealed, setIsRiftRevealed] = useState(false); // 흉일 때 뒤늦게 차원 균열이 폭발했는지 여부
  const [isGlitching, setIsGlitching] = useState(false);

  const spot = SPOTS.find(s => s.id === omikujiResult?.spot_id);

  // 1. 대길/흉/평운 차등 드롭 로직
  useEffect(() => {
    if (omikujiResult) {
      setIsRiftRevealed(false);
      setIsGlitching(false);

      const luckStr = omikujiResult.luck_level || "";
      const isGreatLuck = luckStr.includes("대길");
      const isMisfortune = luckStr.includes("흉") || luckStr.includes("대흉");

      const nativeItemName = spot?.luckyItem || '행운의 부적';
      const nativeItemImage = spot?.itemImage || '/assets/items/item_1_windfeather.jpg';

      if (isGreatLuck) {
        // [대길] 100% 확정으로 본 세계관의 고유 럭키 아이템 지급
        const chosen = {
          name: nativeItemName,
          image: nativeItemImage,
          worldName: spot?.shortName || "현재 세계관"
        };
        setActualItem(chosen);
        setDropType('great_luck');

        // 라푼젤 등 특정 세계관의 대길 축제 테마 음악 전환
        AudioEngine.playCelebrationMusic(omikujiResult.spot_id);

        if (onCollectItem) {
          const matched = CODEX_ITEMS.find(c => c.name === nativeItemName);
          if (matched) onCollectItem(matched);
        }
      } else if (isMisfortune) {
        // [흉/대흉] 다른 차원의 반전 아이템 준비 (처음엔 숨김 상태)
        const otherItems = CODEX_ITEMS.filter(c => c.spotId !== omikujiResult.spot_id);
        const randomCrossItem = otherItems.length > 0 
          ? otherItems[Math.floor(Math.random() * otherItems.length)]
          : CODEX_ITEMS[0];

        const chosen = {
          id: randomCrossItem.id,
          name: randomCrossItem.name,
          image: randomCrossItem.image,
          worldName: randomCrossItem.worldName,
          isRift: true
        };
        setActualItem(chosen);
        setDropType('reversal_rift');
        // 도감 등록은 균열이 발동될 때 수행!
      } else {
        // [일반 길 / 평운] 50% 확률로 아이템 획득 or 순수 운세만 획득
        const hasItemDrop = Math.random() < 0.5;
        if (hasItemDrop) {
          const chosen = {
            name: nativeItemName,
            image: nativeItemImage,
            worldName: spot?.shortName || "현재 세계관"
          };
          setActualItem(chosen);
          setDropType('normal_drop');

          if (onCollectItem) {
            const matched = CODEX_ITEMS.find(c => c.name === nativeItemName);
            if (matched) onCollectItem(matched);
          }
        } else {
          setActualItem(null);
          setDropType('no_item');
        }
      }
    }
  }, [omikujiResult]);

  // 흉에서 차원 균열 시네마틱 특수효과 발동 트리거
  const handleTriggerRiftAnomaly = () => {
    if (isRiftRevealed || isGlitching) return;

    setIsGlitching(true);
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 150]); // 글리치 진동
    }

    setTimeout(() => {
      setIsGlitching(false);
      setIsRiftRevealed(true);

      // 도감에 구원 아이템 등록
      if (onCollectItem && actualItem) {
        onCollectItem(actualItem);
      }
    }, 1200);
  };

  // 2. 타이핑(Typewriter) 효과 로직
  useEffect(() => {
    if (llmResult?.interpretation) {
      setDisplayedText("");
      let i = 0;
      const fullText = llmResult.interpretation;
      const timer = setInterval(() => {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length) clearInterval(timer);
      }, 40);
      return () => clearInterval(timer);
    }
  }, [llmResult]);

  if (!omikujiResult) return null;

  const itemImage = actualItem?.image || spot?.itemImage || '/assets/items/item_1_windfeather.jpg';
  const luckyItemName = actualItem?.name || spot?.luckyItem || '행운의 부적';
  const isGoodLuck = omikujiResult.luck_level.includes("대길") || omikujiResult.luck_level.includes("길");

  return (
    <div className="bg-black/45 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl text-left animate-flip-in shadow-2xl border border-white/10 space-y-5">
      {/* 1. Header & Luck Level */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className={`inline-block px-6 py-2 rounded-full font-black text-2xl shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300 ${isGoodLuck ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 ring-4 ring-yellow-400/30' : 'bg-gradient-to-r from-slate-700 to-red-900 text-red-200 ring-4 ring-red-500/20'}`}>
            ✨ {omikujiResult.luck_level} ✨
          </span>
        </div>

        {/* 운세 시(詩) / 전승 격언 */}
        {omikujiResult?.meta_info?.poem && (
          <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-center">
            <p className="text-xs sm:text-sm text-amber-200 font-serif italic tracking-wide">
              📜 "{omikujiResult.meta_info.poem}"
            </p>
          </div>
        )}

        <p className="text-gray-200 leading-relaxed text-sm sm:text-base font-medium px-3 py-2 bg-gray-900/60 rounded-xl border border-gray-700/60">
          "{omikujiResult.original_text}"
        </p>

        {/* 행운의 방위 & 행운의 숫자 배지 */}
        <div className="flex items-center justify-center space-x-2 text-[11px] font-bold">
          <span className="bg-slate-900/90 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center space-x-1">
            <span>🧭 행운의 방위:</span>
            <span className="text-white">{omikujiResult?.meta_info?.lucky_direction || '동쪽 차원의 바람'}</span>
          </span>
          <span className="bg-slate-900/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center space-x-1">
            <span>🎲 행운의 숫자:</span>
            <span className="text-white">{omikujiResult?.meta_info?.lucky_number || '7'}</span>
          </span>
        </div>
      </div>

      {/* 1-B. 미니멀 5대 정통 세부운 (소원, 연애, 재물, 학업, 이동, 기다리는 사람) */}
      {omikujiResult?.meta_info?.categories && (
        <div className="p-3.5 bg-gray-900/80 rounded-xl border border-gray-700/60 space-y-2">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span>📜</span>
            <span>정통 분야별 세부운 (運勢項目)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(omikujiResult.meta_info.categories).map(([key, val]) => {
              const icons = {
                wish: '🎋',
                love: '🌸',
                wealth: '💰',
                work: '⚔️',
                travel: '🚀',
                waiting: '✉️'
              };
              return (
                <div key={key} className="p-2 bg-gray-950/60 rounded-lg border border-gray-800 flex items-start space-x-2">
                  <span className="text-sm flex-shrink-0">{icons[key] || '•'}</span>
                  <span className="text-gray-300 leading-snug">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Item Cards with Dynamic Lore */}
      {/* 2-A. 대길 확정 럭키 아이템 */}
      {dropType === 'great_luck' && actualItem && (
        <div className="p-3.5 bg-gradient-to-br from-amber-950/60 via-gray-950 to-yellow-950/60 rounded-xl border-2 border-amber-400/80 shadow-lg shadow-amber-500/20 flex items-center space-x-4">
          <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xl group">
            <img src={itemImage} alt={luckyItemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <span className="absolute bottom-1 right-1 text-[9px] font-extrabold bg-amber-400 text-black px-1.5 py-0.2 rounded shadow">
              GREAT LUCK
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-amber-300">🌟 대길 확정 럭키 아이템</span>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded border border-amber-400/40">도감 등록</span>
            </div>
            <h4 className="text-base font-black text-white truncate drop-shadow mt-0.5">{luckyItemName}</h4>
            <p className="text-xs text-gray-300 mt-0.5">{spot.name}의 순수한 축복이 담긴 최고급 매개체입니다.</p>
          </div>
        </div>
      )}

      {/* 2-B. 일반 길 50% 드롭 */}
      {dropType === 'normal_drop' && actualItem && (
        <div className="p-3.5 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-xl border border-amber-500/30 shadow-inner flex items-center space-x-4">
          <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-lg group">
            <img src={itemImage} alt={luckyItemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <span className="absolute bottom-1 right-1 text-[10px] font-extrabold bg-amber-500 text-black px-1.5 py-0.5 rounded shadow">
              ITEM
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">🎁 오늘의 행운 아이템</span>
              <span className="text-[10px] bg-purple-900/80 text-purple-300 px-1.5 py-0.2 rounded border border-purple-600/40">도감 등록</span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white truncate drop-shadow mt-0.5">{luckyItemName}</h4>
            <p className="text-xs text-gray-400 mt-0.5">이 세계관의 고유 기운이 깃든 특별한 매개체입니다.</p>
          </div>
        </div>
      )}

      {/* 2-C. 평운 미당첨: 스스로 운명을 개척하는 날 */}
      {dropType === 'no_item' && (
        <div className="p-4 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 rounded-xl border border-gray-700 text-center space-y-1 shadow-inner">
          <div className="flex items-center justify-center space-x-1.5 text-amber-300 font-bold text-xs">
            <span>✨</span>
            <span>스스로 운명을 개척하는 날</span>
            <span>✨</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            "오늘은 어떤 도구나 매개체에도 의존하지 않고, 오직 당신 자신의 지혜와 용기로 운명을 직접 만들어갈 날입니다."
          </p>
        </div>
      )}

      {/* 2-D. 흉 상태: 초기에는 태연한 경고, 발동 시 차원 왜곡 구원 연출! */}
      {dropType === 'reversal_rift' && (
        <div className="space-y-3">
          {isGlitching && (
            <div className="p-4 bg-purple-950 border-2 border-purple-400 rounded-xl text-center animate-bounce shadow-2xl">
              <span className="text-2xl animate-spin inline-block">🌀</span>
              <p className="text-purple-200 font-extrabold text-sm mt-1">
                ⚠️ 시공간 차원 균열 왜곡 현상 발생 중...
              </p>
            </div>
          )}

          {isRiftRevealed && actualItem ? (
            <div className="space-y-2 animate-fade-in">
              {/* Cinematic Lore Card */}
              <div className="p-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950 border border-purple-400/80 rounded-xl text-purple-100 shadow-2xl space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xl animate-pulse">🌀</span>
                  <span className="font-black text-amber-300 text-xs tracking-wider uppercase">
                    [차원의 균열: 잠재력 개화]
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                  "당신의 점괘가 가진 기이한 잠재력이, 차원의 균열로부터 이세계의 행운을 불러오고 있습니다. 어쩌면, 세계의 반대편 다른 세계에서는 이 점괘가 <span className="text-amber-300 font-black">대길</span>에 해당할지도 모르겠군요."
                </p>
                <p className="text-xs text-purple-300 pt-1 border-t border-purple-800/60 font-semibold">
                  ✨ 이 영험한 물건이 위기를 기회로 만들 당신에게 큰 도움이 되어줄 겁니다.
                </p>
              </div>

              {/* Emerged Gift Item Card */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 rounded-xl border border-purple-500/60 shadow-inner flex items-center space-x-4">
                <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-purple-400/80 shadow-lg group">
                  <img src={itemImage} alt={luckyItemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute bottom-1 right-1 text-[9px] font-extrabold bg-purple-500 text-white px-1.5 py-0.2 rounded shadow">
                    RIFT GIFT
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-amber-400">🎁 구원의 럭키 아이템</span>
                    <span className="text-[10px] bg-purple-900 text-purple-300 px-1.5 py-0.2 rounded border border-purple-600/40">도감 등록</span>
                  </div>
                  <h4 className="text-base font-black text-white truncate drop-shadow mt-0.5">{luckyItemName}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">[{actualItem.worldName}]의 영험한 기운이 깃들어 있습니다.</p>
                </div>
              </div>
            </div>
          ) : (
            !isGlitching && (
              <div 
                onClick={handleTriggerRiftAnomaly}
                className="p-3.5 bg-gray-900/90 hover:bg-purple-950/50 border border-dashed border-gray-700 hover:border-purple-500/60 rounded-xl cursor-pointer transition-all duration-300 text-center space-y-1 group shadow"
              >
                <div className="flex items-center justify-center space-x-1 text-gray-400 group-hover:text-purple-300 transition">
                  <span className="text-sm">👁️</span>
                  <span className="text-xs font-bold">점괘 주변에서 미세한 차원 왜곡이 감지됩니다...</span>
                </div>
                <p className="text-[11px] text-gray-500 group-hover:text-gray-400">
                  (탭하여 기이한 파동을 조사하기)
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* 3. 점괘 묶기(結び) & 보관하기 정통 신사 인터랙션 */}
      <div className="pt-2 border-t border-gray-700/80 flex items-center justify-between gap-2">
        <button
          onClick={() => alert("🎋 차원의 닻(신사 나무)에 점괘를 매어 달았습니다. 불운은 씻겨 나가고 행운만이 머물 것입니다.")}
          className="flex-1 bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
        >
          <span>🎋</span>
          <span>차원의 닻에 점괘 묶기</span>
        </button>
        <button
          onClick={() => alert("👝 오늘의 점괘를 차원 인벤토리에 소중히 간직했습니다. 하루 동안 가호가 함께합니다.")}
          className="flex-1 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/40 text-amber-200 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
        >
          <span>👝</span>
          <span>지갑에 고이 간직하기</span>
        </button>
      </div>

      {/* 4. Deep AI Interpretation Section */}
      {!llmResult ? (
        <div className="border-t border-gray-700/80 pt-4 animate-fade-in space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-1">
              🔮 유저 상황 맞춤형 심층 해석 <span className="text-purple-400 font-extrabold">(토큰 1개 소모)</span>
            </p>
            <p className="text-xs text-gray-400">
              현재 고민이나 상황을 입력하시면, {spot?.shortName || "해당 세계관"} 캐릭터가 운세를 풀이해 드립니다.
            </p>
          </div>

          <textarea 
            value={userContext} 
            onChange={e => setUserContext(e.target.value)} 
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none placeholder-gray-500" 
            rows="3" 
            placeholder="예: 요즘 취업 준비와 프로젝트가 겹쳐서 불안하고 답답해..."
          />

          <button 
            onClick={handleInterpret} 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center shadow-lg hover:shadow-purple-500/30"
          >
            {isLoading && <span className="animate-spin mr-2">🔄</span>}
            {isLoading ? "운명의 흐름을 읽는 중..." : "AI 심층 해석 받기 🔮"}
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-700/80 pt-4 bg-gray-900/90 p-4 sm:p-5 rounded-xl shadow-inner animate-fade-in space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-700/80 pb-2">
            <span className="text-lg">📜</span>
            <h3 className="text-purple-300 font-extrabold text-base sm:text-lg truncate">
              {llmResult.world_concept_title}
            </h3>
          </div>
          
          <p className="text-gray-200 leading-relaxed text-sm sm:text-base min-h-[80px]">
            {displayedText}<span className="animate-pulse font-bold text-blue-400">|</span>
          </p>

          {llmResult.world_bgm_action && (
            <div className="pt-2 border-t border-gray-800 flex items-center text-xs text-blue-300 italic">
              <span className="mr-2 animate-bounce">🎵</span>
              <span>{llmResult.world_bgm_action}</span>
            </div>
          )}
        </div>
      )}

      {/* 5. Action Buttons (Share Ticket & Return) */}
      <div className="pt-2 space-y-2">
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-extrabold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 text-sm transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>📲</span>
          <span>운세 티켓 공유하기 (SNS/링크)</span>
        </button>

        <button 
          onClick={() => setOmikujiResult(null)} 
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 px-4 rounded-xl transition font-bold text-sm shadow hover:text-white"
        >
          다른 차원으로 가기 / 돌아가기
        </button>
      </div>

      {/* Share Ticket Modal */}
      <ShareTicketModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        omikujiResult={omikujiResult}
        spot={spot}
        llmResult={llmResult}
      />
    </div>
  );
}