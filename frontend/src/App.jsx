import { useState, useEffect } from 'react'
import { SPOTS, CODEX_ITEMS } from './constants';
import Header from './Header';
import MapSelector from './MapSelector';
import MovementTimer from './MovementTimer';
import OmikujiView from './OmikujiView';
import CodexModal from './CodexModal';
import HistoryModal from './HistoryModal';
import FortuneShakeModal from './FortuneShakeModal';
import PwaInstallBanner from './PwaInstallBanner';
import { AudioEngine } from './audioEngine';

function App() {
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [userState, setUserState] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [omikujiResult, setOmikujiResult] = useState(null);
  const [userContext, setUserContext] = useState("");
  const [llmResult, setLlmResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // 도감 및 히스토리 모달 상태 관리
  const [collectedItems, setCollectedItems] = useState([]);
  const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 로컬 스토리지에서 도감 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omikuji_codex');
      if (stored) {
        setCollectedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("도감 로드 실패:", e);
    }
  }, []);

  // 도감 아이템 획득 함수 (중복 방지 및 날짜 기록)
  const handleCollectItem = (item) => {
    setCollectedItems((prev) => {
      const already = prev.some(c => c.name === item.name || c.id === item.id);
      if (already) return prev;

      const updated = [
        ...prev,
        {
          id: item.id,
          name: item.name,
          worldName: item.worldName,
          acquiredAt: new Date().toLocaleDateString('ko-KR')
        }
      ];
      localStorage.setItem('omikuji_codex', JSON.stringify(updated));
      return updated;
    });
  };

  const isCodexComplete = collectedItems.length >= CODEX_ITEMS.length;

  // 컴포넌트가 처음 화면에 나타날 때 실행되는 부분
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        // 1. 로컬 스토리지에서 기존 유저 ID 확인
        const storedUserId = localStorage.getItem('omikuji_user_id');
        let url = '/api/v1/users/auth';
        if (storedUserId) {
          url += `?client_uuid=${storedUserId}`;
        }

        // 2. 백엔드에 게스트 로그인 요청 (비동기 통신)
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) {
          throw new Error('백엔드 서버가 응답하지 않습니다.');
        }

        // 3. 응답받은 유저 ID를 상태와 로컬 스토리지에 저장
        const data = await response.json();
        localStorage.setItem('omikuji_user_id', data.user_id);
        setUserId(data.user_id);
        fetchUserState(data.user_id); // 로그인 성공 직후 유저 상태 조회
      } catch (error) {
        console.error("로그인 실패:", error);
        setError("서버 연결 실패: 백엔드 서버(8000)를 켜주세요!");
      }
    };

    authenticateUser();
  }, []);

  // 유저의 현재 상태(토큰, 위치, 도착시간)를 백엔드에서 가져오는 함수
  const fetchUserState = async (uid) => {
    try {
      const res = await fetch('/api/v1/users/me', { headers: { 'x-user-id': uid } });
      if (res.ok) {
        const data = await res.json();
        setUserState(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // userState 변경 시 음원 즉시 동기화 (워프 시작, 도착, 스팟 변경 완벽 감지)
  useEffect(() => {
    if (!userState) return;

    if (userState.target_spot_id && !userState.is_arrived) {
      // 1. 차원 이동 중: 메이플스토리 시간의 길
      AudioEngine.playTravelMusic();
    } else if (userState.current_spot_id) {
      // 2. 목적지 스팟 도착: 해당 세계관 고유 명곡 (오이서스트는 프리렌, 모의 술집은 심슨 등)
      AudioEngine.playSpotMusic(userState.current_spot_id);
    } else {
      // 3. 차원의 틈새 / 로비: 메이플스토리 차원의 균열
      AudioEngine.playLobbyMusic();
    }
  }, [userState?.current_spot_id, userState?.target_spot_id, userState?.is_arrived]);

  // 실시간 타임록(카운트다운) 계산 로직
  useEffect(() => {
    let timer;
    if (userState?.target_spot_id && userState?.arrival_time && !userState?.is_arrived) {
      const calculateTimeLeft = () => {
        // SQLite 시간 문자열 처리: 끝에 Z(UTC)가 없으면 강제로 붙여 정확한 시간 계산 보장
        let arrivalStr = userState.arrival_time;
        arrivalStr = arrivalStr.replace(' ', 'T'); // SQLite 공백을 표준 ISO 'T'로 변환
        if (!arrivalStr.endsWith('Z') && !arrivalStr.includes('+')) arrivalStr += 'Z';
        
        const arrivalTime = new Date(arrivalStr).getTime();
        const now = new Date().getTime();
        if (isNaN(arrivalTime)) return 0; // 날짜 파싱 실패 시 뻗지 않도록 안전장치 추가

        return Math.max(0, Math.floor((arrivalTime - now) / 1000));
      };

      setTimeLeft(calculateTimeLeft()); // 최초 1회 즉시 계산

      timer = setInterval(() => {
        const diff = calculateTimeLeft();
        setTimeLeft(diff);

        if (diff === 0) {
          clearInterval(timer);
          fetchUserState(userId); // 시간이 다 되면 서버의 정확한 상태를 다시 가져옵니다.
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [userState, userId]);

  // 목적지로 이동 시작
  const handleMoveStart = async () => {
    try {
      setOmikujiResult(null);
      setLlmResult(null);
      const res = await fetch(`/api/v1/movement/start?target_spot_id=${selectedSpot}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) fetchUserState(userId);
      else alert("이동에 실패했습니다.");
    } catch (e) { console.error(e); }
  };

  // 목적지 도착 확인 (시간이 다 된 후 클릭)
  const handleArrive = async () => {
    try {
      const headers = { 'x-user-id': userId };
      if (isAdmin) headers['x-admin-bypass'] = '486';

      const res = await fetch('/api/v1/movement/arrive', {
        method: 'POST',
        headers: headers
      });
      if (res.ok) {
        fetchUserState(userId);
      } else {
        // 서버에서 보내준 구체적인 에러 메시지를 표시합니다.
        const errData = await res.json();
        alert(`도착 실패: ${errData.detail}`);
      }
    } catch (e) { console.error(e); }
  };

  // 산통 흔들기 모달 상태
  const [isShakeModalOpen, setIsShakeModalOpen] = useState(false);

  // 점괘 뽑기 시작 (산통 흔들기 모달 오픈)
  const handleOpenDraw = () => {
    setIsShakeModalOpen(true);
  };

  // 산통 흔들기 4회 완료 시 실제 점괘 데이터 패치
  const handleCompleteShakeAndDraw = async () => {
    setIsShakeModalOpen(false);
    try {
      const res = await fetch(`/api/v1/omikuji/draw?spot_id=${userState.current_spot_id}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setOmikujiResult(data);
        setLlmResult(null); // 새로운 점괘를 뽑으면 기존 해석 초기화
      }
    } catch (e) { 
      console.error(e); 
    }
  };

  // LLM 심층 해석 요청
  const handleInterpret = async () => {
    if (!userContext.trim()) return alert("고민을 입력해주세요!");
    setIsLoading(true);
    try {
      const headers = { 'x-user-id': userId, 'Content-Type': 'application/json' };
      if (isAdmin) headers['x-admin-bypass'] = '486';

      const res = await fetch(`/api/v1/interpret/${omikujiResult.history_id}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ user_context: userContext })
      });
      if (res.ok) {
        const data = await res.json();
        setLlmResult(data);
        fetchUserState(userId); // 토큰 차감 업데이트
      } else {
        const errData = await res.json();
        alert(`해석 실패: ${errData.detail}`);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  // 관리자 모드 진입 로직
  const handleAdminLogin = () => {
    const password = window.prompt("관리자 비밀번호를 입력하세요:");
    if (password === "486") {
      setIsAdmin(true);
      alert("관리자 권한으로 접속되었습니다. (모든 히든 스팟 및 바이패스 활성화)");
    } else if (password !== null) {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const [isZenMode, setIsZenMode] = useState(false);

  const currentSpot = userState?.current_spot_id 
    ? SPOTS.find(s => s.id === userState.current_spot_id) 
    : null;

  const targetSpot = userState?.target_spot_id
    ? SPOTS.find(s => s.id === userState.target_spot_id)
    : null;

  // 배경 이미지 결정 (워프 중이면 시간의 길/목표스팟, 도착했으면 현재 스팟, 로비면 차원의 균열)
  const activeBgImage = targetSpot?.bgImage 
    ? targetSpot.bgImage 
    : (currentSpot?.bgImage || '/assets/worlds/lobby_rift.jpg');

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 overflow-x-hidden bg-gray-950 select-none">
      
      {/* 🌌 1. Fullscreen Vivid Ambient Art Canvas (생생한 원본 캔버스) */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-out scale-100 filter brightness-90"
        style={{ backgroundImage: `url(${activeBgImage})` }}
      />
      
      {/* Cinematic Vignette & Soft Gradient Mesh (텍스트 가독성 확보 + 배경 투과) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-700 pointer-events-none ${
        isZenMode 
          ? 'bg-black/20' 
          : 'bg-gradient-to-b from-gray-950/60 via-gray-950/75 to-gray-950/90 backdrop-blur-[2px]'
      }`} />

      {/* 🖼️ 2. Zen Mode Active Floating Overlay */}
      {isZenMode && (
        <div 
          onClick={() => setIsZenMode(false)}
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 cursor-pointer animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <span className="px-4 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-bold text-white backdrop-blur-md shadow-lg animate-pulse">
              🖼️ 시네마 감상 모드 (화면을 누르면 복귀합니다)
            </span>
            <button 
              onClick={() => setIsZenMode(false)}
              className="px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/30 text-xs font-black text-amber-300 transition backdrop-blur-md shadow-xl"
            >
              ✕ UI 복귀
            </button>
          </div>

          <div className="p-6 bg-black/60 backdrop-blur-xl border border-white/15 rounded-3xl max-w-lg shadow-2xl space-y-2 animate-slide-up">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📍</span>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow">
                {currentSpot?.name || "차원의 틈새"}
              </h2>
            </div>
            {currentSpot?.bgmTitle && (
              <p className="text-xs sm:text-sm text-purple-300 font-bold flex items-center space-x-1.5">
                <span>🎵</span>
                <span>{currentSpot.bgmTitle}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 🔮 3. Main App Content Container (Responsive: Mobile 1-col, Desktop 2-col) */}
      {!isZenMode && (
        <div className="relative z-10 w-full max-w-md lg:max-w-5xl xl:max-w-6xl flex flex-col h-full space-y-4 animate-fade-in">
          
          {/* Header (Tokens, Streak, Sound Toggle, Codex, History, Zen Mode) */}
          <Header 
            userState={userState} 
            handleAdminLogin={handleAdminLogin} 
            onOpenCodex={() => setIsCodexModalOpen(true)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            codexCount={collectedItems.length}
            isCodexComplete={isCodexComplete}
            onToggleZen={() => setIsZenMode(true)}
          />

          {error ? (
            <div className="p-6 bg-black/50 backdrop-blur-2xl rounded-3xl border border-red-500/40 shadow-2xl text-center space-y-4">
              <p className="text-red-400 font-bold animate-bounce">❌ {error}</p>
              <button onClick={() => window.location.reload()} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl transition font-bold">다시 연결 시도</button>
            </div>
          ) : userId ? (
            <div className="w-full">
              {/* Desktop 2-Column Grid / Mobile 1-Column */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* [Left Column] Visual Stage & Dimension Warp Controls */}
                <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                  <MapSelector 
                    userState={userState} 
                    selectedSpot={selectedSpot} 
                    setSelectedSpot={setSelectedSpot} 
                    handleMoveStart={handleMoveStart} 
                    handleDrawOmikuji={handleOpenDraw} 
                    isDrawing={isShakeModalOpen} 
                    isCodexComplete={isCodexComplete}
                    isAdmin={isAdmin}
                  />
                </div>

                {/* [Right Column] Interactive Deck & Omikuji Fortune View */}
                <div className="lg:col-span-7 xl:col-span-7 space-y-4">
                  {/* Movement Countdown Timer (Shows while warping) */}
                  <MovementTimer 
                    userState={userState} 
                    timeLeft={timeLeft} 
                    isAdmin={isAdmin} 
                    handleArrive={handleArrive} 
                  />

                  {/* Omikuji Fortune Reveal View */}
                  {omikujiResult && !userState?.target_spot_id ? (
                    <OmikujiView 
                      omikujiResult={omikujiResult} 
                      setOmikujiResult={setOmikujiResult} 
                      llmResult={llmResult} 
                      userContext={userContext} 
                      setUserContext={setUserContext} 
                      handleInterpret={handleInterpret} 
                      isLoading={isLoading} 
                      onCollectItem={handleCollectItem}
                    />
                  ) : !userState?.target_spot_id ? (
                    /* Standby / Ready Card when arrived at a spot */
                    <div className="p-6 sm:p-8 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl text-center space-y-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">
                        🥠
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-black text-amber-300 drop-shadow">
                          {currentSpot ? `${currentSpot.name}` : "차원의 틈새"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-200">
                          {currentSpot 
                            ? "이곳의 신비로운 기운이 담긴 산통을 흔들어 오늘의 운명을 확인하세요." 
                            : "목적지를 선택하고 차원 워프를 시작하세요."}
                        </p>
                      </div>

                      {userState?.current_spot_id && (
                        <button 
                          onClick={handleOpenDraw} 
                          disabled={isShakeModalOpen}
                          className="w-full py-4 px-6 rounded-2xl font-black text-base text-gray-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition-all transform hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-yellow-500/30 active:translate-y-0 shadow-xl flex items-center justify-center space-x-2"
                        >
                          <span>🥠</span>
                          <span>운명의 산통 흔들기</span>
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10">
              <p className="text-yellow-400 animate-pulse font-bold text-base">⏳ 차원의 톱니바퀴를 돌리는 중...</p>
            </div>
          )}

        </div>
      )}

      {/* Interactive Fortune Shake Modal */}
      <FortuneShakeModal 
        isOpen={isShakeModalOpen}
        spotId={userState?.current_spot_id || 1}
        onComplete={handleCompleteShakeAndDraw}
      />

      {/* Dimension Codex Modal */}
      <CodexModal 
        isOpen={isCodexModalOpen}
        onClose={() => setIsCodexModalOpen(false)}
        collectedItems={collectedItems}
        isComplete={isCodexComplete}
      />

      {/* Fate History Archive Modal */}
      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={userId}
        currentSpotId={userState?.current_spot_id}
      />

      {/* PWA Home Screen Install Banner */}
      <PwaInstallBanner 
        onRewardBonusToken={() => {
          if (userState) {
            setUserState(prev => prev ? { ...prev, llm_tokens: (prev.llm_tokens || 0) + 1 } : prev);
            alert("🎉 앱 설치 완료! 차원 탐험 보너스 토큰 1개가 충전되었습니다!");
          }
        }}
      />
    </div>
  )
}

export default App
