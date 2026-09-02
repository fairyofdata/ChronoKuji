import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import MapSelector from './MapSelector';
import MovementTimer from './MovementTimer';
import OmikujiView from './OmikujiView';
import CodexModal from './CodexModal';
import HistoryModal from './HistoryModal';
import FortuneShakeModal from './FortuneShakeModal';
import ShareTicketModal from './ShareTicketModal';
import PwaInstallBanner from './PwaInstallBanner';
import { SPOTS, CODEX_ITEMS } from './constants';
import { AudioEngine } from './audioEngine';
import { auth, loginWithGoogle, logoutFirebase, onAuthStateChanged, FirebaseUser } from './firebase';
import { UserState, OmikujiResult, LlmInterpretationResult, CollectedCodexItem } from './types';
import { parseUtcDate } from './utils/date';
import { API_BASE_URL } from './config';
import { ToastProvider, useToast } from './Toast';
import './App.css';

function AppContent() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('omikuz_user_id'));
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<number>(SPOTS[0]?.id || 2);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [tokenTimeLeft, setTokenTimeLeft] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [omikujiResult, setOmikujiResult] = useState<OmikujiResult | null>(null);
  const [llmResult, setLlmResult] = useState<LlmInterpretationResult | null>(null);
  
  // Modals & UI States
  const [isCodexModalOpen, setIsCodexModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isShakeModalOpen, setIsShakeModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [collectedItems, setCollectedItems] = useState<CollectedCodexItem[]>([]);

  const { showToast } = useToast();
  const hasUnlockedAudio = useRef<boolean>(false);
  const userStateRef = useRef<UserState | null>(null);
  userStateRef.current = userState;

  // 1. First Audio Interaction Unlock (Web Audio Autoplay Policy)
  useEffect(() => {
    const handleFirstUserGesture = () => {
      if (hasUnlockedAudio.current) return;
      hasUnlockedAudio.current = true;

      const state = userStateRef.current;
      if (state?.target_spot_id !== null && state?.target_spot_id !== undefined && !state?.is_arrived) {
        AudioEngine.playTravelMusic();
      } else if (state?.current_spot_id) {
        AudioEngine.playSpotMusic(state.current_spot_id);
      } else {
        AudioEngine.playLobbyMusic();
      }
    };

    window.addEventListener('click', handleFirstUserGesture, { once: true });
    window.addEventListener('touchstart', handleFirstUserGesture, { once: true });
    window.addEventListener('keydown', handleFirstUserGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
    };
  }, []);

  // 2. Fetch User State Helper
  const fetchUserState = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/state`, {
        headers: { 'x-user-id': uid }
      });
      if (res.ok) {
        const state: UserState = await res.json();
        setUserState(state);

        // BGM synchronization
        if (hasUnlockedAudio.current) {
          if (state.target_spot_id !== null && state.target_spot_id !== undefined && !state.is_arrived) {
            AudioEngine.playTravelMusic();
          } else if (state.current_spot_id) {
            AudioEngine.playSpotMusic(state.current_spot_id);
          } else {
            AudioEngine.playLobbyMusic();
          }
        }
      } else if (res.status === 404) {
        // Stale guest UUID in browser storage -> auto-recover new session
        localStorage.removeItem('omikuz_user_id');
        const authRes = await fetch(`${API_BASE_URL}/api/v1/users/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          setUserId(authData.user_id);
          localStorage.setItem('omikuz_user_id', authData.user_id);
          const recoverRes = await fetch(`${API_BASE_URL}/api/v1/users/state`, {
            headers: { 'x-user-id': authData.user_id }
          });
          if (recoverRes.ok) {
            const recoveredState = await recoverRes.json();
            setUserState(recoveredState);
          }
        }
      }
    } catch (e) {
      console.error("fetchUserState Error:", e);
    }
  };

  // Auth Initialization & Firebase Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);

      try {
        if (fUser) {
          // Google Authenticated User Login
          const idToken = await fUser.getIdToken();
          const res = await fetch(`${API_BASE_URL}/api/v1/users/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              firebase_uid: fUser.uid,
              email: fUser.email,
              display_name: fUser.displayName
            })
          });

          if (res.ok) {
            const data = await res.json();
            setUserId(data.user_id);
            localStorage.setItem('omikuz_user_id', data.user_id);
            fetchUserState(data.user_id);
          }
        } else {
          // Guest User Login / Restoration
          const savedUid = localStorage.getItem('omikuz_user_id');
          if (savedUid) {
            setUserId(savedUid);
            fetchUserState(savedUid);
          } else {
            const res = await fetch(`${API_BASE_URL}/api/v1/users/auth`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
              const data = await res.json();
              setUserId(data.user_id);
              localStorage.setItem('omikuz_user_id', data.user_id);
              fetchUserState(data.user_id);
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Login Action
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast({
          type: 'success',
          title: '🔑 로그인 성공',
          message: `${user.displayName || '여행자'}님 환영합니다!\n20시간마다 1회 무료 AI 심층 풀이가 충전됩니다.`
        });
      }
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        showToast({
          type: 'error',
          title: '로그인 실패',
          message: e?.message || "구글 로그인 중 오류가 발생했습니다."
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Logout Action
  const handleGoogleLogout = async () => {
    try {
      await logoutFirebase();
      setOmikujiResult(null);
      setLlmResult(null);
      showToast({
        type: 'info',
        title: '로그아웃 완료',
        message: '게스트 모드로 전환되었습니다.'
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Spacetime Warp Timer (60s Countdown)
  useEffect(() => {
    if (!userState?.arrival_time || userState?.is_arrived) {
      setTimeLeft(0);
      return;
    }

    const arrivalMs = parseUtcDate(userState.arrival_time);
    if (!arrivalMs) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const nowMs = Date.now();
      const diff = Math.max(0, Math.ceil((arrivalMs - nowMs) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        handleArrive();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [userState?.arrival_time, userState?.is_arrived, userId]);

  // 4. Token 20-Hour Refill Countdown Timer
  useEffect(() => {
    if (!userState || userState.is_guest || userState.llm_tokens >= 1 || !userState.last_token_refill_at) {
      setTokenTimeLeft(0);
      return;
    }

    const lastRefillMs = parseUtcDate(userState.last_token_refill_at);
    if (!lastRefillMs) {
      setTokenTimeLeft(0);
      return;
    }

    const nextRefillMs = lastRefillMs + (20 * 60 * 60 * 1000);

    const updateTokenTimer = () => {
      const nowMs = Date.now();
      const diff = Math.max(0, Math.ceil((nextRefillMs - nowMs) / 1000));
      setTokenTimeLeft(diff);

      if (diff <= 0) {
        if (userId) fetchUserState(userId);
      }
    };

    updateTokenTimer();
    const interval = setInterval(updateTokenTimer, 1000);

    return () => clearInterval(interval);
  }, [userState?.last_token_refill_at, userState?.is_guest, userState?.llm_tokens, userId]);

  // 5. Codex Items Synchronization from History
  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE_URL}/api/v1/omikuji/history`, { headers: { 'x-user-id': userId } })
        .then(res => res.json())
        .then(data => {
          if (data.histories) {
            const items: CollectedCodexItem[] = [];
            data.histories.forEach((h: any) => {
              const spot = SPOTS.find(s => s.id === h.spot_id);
              if (spot && !items.some(i => i.name === spot.luckyItem)) {
                items.push({
                  name: spot.luckyItem,
                  worldName: spot.worldName,
                  image: spot.itemImage,
                  acquiredAt: h.drawn_at
                });
              }
            });
            setCollectedItems(items);
          }
        })
        .catch(console.error);
    }
  }, [userId, omikujiResult]);

  // 11대 세계관 수집 완료 여부 판정
  const collectedNames = new Set(collectedItems.map(item => item.name));
  const isCodexComplete = CODEX_ITEMS.every(item => collectedNames.has(item.name));

  // 6. Warp Start Handler
  const handleMoveStart = async (customSpotId?: number) => {
    if (!userId) return;
    const targetId = customSpotId !== undefined ? customSpotId : selectedSpot;
    hasUnlockedAudio.current = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/movement/start?target_spot_id=${targetId}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const startData = await res.json();
        setOmikujiResult(null);
        setLlmResult(null);

        // 실시간 워프 시간 설정 및 상태 즉각 낙관적 갱신
        const arrivalIso = startData.arrival_time || new Date(Date.now() + 60000).toISOString();
        const arrivalMs = parseUtcDate(arrivalIso);
        const initialSeconds = arrivalMs ? Math.max(1, Math.ceil((arrivalMs - Date.now()) / 1000)) : 60;
        setTimeLeft(initialSeconds);

        setUserState(prev => prev ? {
          ...prev,
          current_spot_id: null,
          target_spot_id: targetId,
          arrival_time: arrivalIso,
          is_arrived: false
        } : null);

        AudioEngine.playTravelMusic();

        const targetSpotObj = SPOTS.find(s => s.id === targetId);
        const destName = targetId === 0 
          ? "차원의 균열 (성소)" 
          : (targetSpotObj ? `${targetSpotObj.locationName} (${targetSpotObj.worldName})` : "목적지");

        showToast({
          type: 'info',
          title: '⏳ 시공간 워프 개시',
          message: `[${destName}]을(를) 향해 도약을 시작합니다. (60초 소요)`
        });
      } else {
        const err = await res.json();
        showToast({
          type: 'error',
          title: '워프 실패',
          message: err.detail || "이동 시작에 실패했습니다."
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Warp Arrival Handler
  const handleArrive = async () => {
    if (!userId) return;
    try {
      const headers: Record<string, string> = { 'x-user-id': userId };
      if (isAdmin) headers['x-admin-bypass'] = '486';

      const res = await fetch(`${API_BASE_URL}/api/v1/movement/arrive`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setOmikujiResult(null);
        setLlmResult(null);
        setTimeLeft(0);

        const arrivedSpotId = (data.current_spot_id !== undefined && data.current_spot_id !== null)
          ? data.current_spot_id 
          : (userState?.target_spot_id && userState.target_spot_id > 0 ? userState.target_spot_id : null);

        setUserState(prev => prev ? {
          ...prev,
          current_spot_id: arrivedSpotId,
          target_spot_id: null,
          arrival_time: null,
          is_arrived: true
        } : null);

        if (arrivedSpotId) {
          AudioEngine.playSpotMusic(arrivedSpotId);
          const spot = SPOTS.find(s => s.id === arrivedSpotId);
          showToast({
            type: 'success',
            title: '🎉 차원 진입 성공',
            message: `[${spot?.locationName}] (${spot?.worldName})에 무사히 도착했습니다!`
          });
        } else {
          AudioEngine.playLobbyMusic();
          showToast({
            type: 'shrine',
            title: '⛩️ 성소 귀환 완료',
            message: '차원의 균열 성소로 안전하게 귀환했습니다.'
          });
        }
      } else {
        const err = await res.json();
        showToast({
          type: 'error',
          title: '도착 처리 실패',
          message: err.detail || "도착 처리에 실패했습니다."
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7-1. Admin Instant Teleport Handler (0s Bypass)
  const handleAdminTeleport = async (spotId: number) => {
    if (!userId) return;
    try {
      hasUnlockedAudio.current = true;
      // 1. Start movement
      await fetch(`${API_BASE_URL}/api/v1/movement/start?target_spot_id=${spotId}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });

      // 2. Immediately arrive with admin bypass header
      const res = await fetch(`${API_BASE_URL}/api/v1/movement/arrive`, {
        method: 'POST',
        headers: {
          'x-user-id': userId,
          'x-admin-bypass': '486'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setOmikujiResult(null);
        setLlmResult(null);
        await fetchUserState(userId);

        if (data.current_spot_id) {
          AudioEngine.playSpotMusic(data.current_spot_id);
          const spot = SPOTS.find(s => s.id === data.current_spot_id);
          showToast({
            type: 'success',
            title: '⚡ 관리자 텔레포트 성공',
            message: `[${spot?.locationName}] (${spot?.worldName})로 대기 없이 즉시 도약했습니다!`
          });
        } else {
          AudioEngine.playLobbyMusic();
          showToast({
            type: 'shrine',
            title: '⛩️ 성소 즉시 귀환',
            message: '차원의 균열 성소로 즉시 귀환했습니다.'
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Omikuji Draw Triggers
  const handleDrawOmikuji = () => {
    setIsShakeModalOpen(true);
  };

  const handleCompleteShakeAndDraw = async () => {
    setIsShakeModalOpen(false);
    if (!userId || !userState?.current_spot_id) return;
    setIsDrawing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/omikuji/draw?spot_id=${userState.current_spot_id}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data: OmikujiResult = await res.json();
        setOmikujiResult(data);
        setLlmResult(null);

        // 라푼젤 대길 축제 음악 전환
        if (userState.current_spot_id === 9 && data.luck_level === '大吉') {
          AudioEngine.playCelebrationMusic(9);
        }

        showToast({
          type: data.luck_level === '大吉' ? 'success' : data.luck_level === '凶' || data.luck_level === '大凶' ? 'warning' : 'info',
          title: `🥠 점괘 [${data.luck_level}] 출현`,
          message: `운명의 점괘가 펼쳐졌습니다.`
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrawing(false);
    }
  };

  // 9. AI Counseling Interpretation Handler
  const handleInterpret = async (context: string) => {
    if (!userId || !omikujiResult) return;
    
    // 게스트 상태인 경우 로그인 팝업 유도
    if (userState?.is_guest) {
      handleGoogleLogin();
      return;
    }

    setIsInterpreting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/interpret/${omikujiResult.history_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          user_context: context
        })
      });
      if (res.ok) {
        const data: LlmInterpretationResult = await res.json();
        setLlmResult(data);
        fetchUserState(userId);
        showToast({
          type: 'success',
          title: '🔮 AI 심층 해석 완료',
          message: '세계관 페르소나의 맞춤 조언이 완성되었습니다.'
        });
      } else {
        const err = await res.json();
        showToast({
          type: 'error',
          title: 'AI 해석 오류',
          message: err.detail || "AI 해석 요청에 실패했습니다."
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInterpreting(false);
    }
  };

  // 배경 이미지 결정 및 이동 중 여부 판정 (current_spot_id가 확정되기 전까지는 워프 상태 유지)
  const currentSpot = userState?.current_spot_id 
    ? SPOTS.find(s => s.id === userState.current_spot_id) 
    : null;

  const isMoving = userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.current_spot_id;

  const bgImageSrc = isMoving
    ? '/assets/worlds/traveling_time_path.jpg?v=2'
    : (currentSpot ? currentSpot.bgImage : '/assets/worlds/lobby_rift.jpg?v=2');

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-white flex flex-col font-sans select-none">
      {/* 1. Fullscreen Cinematic Vivid Artwork Canvas */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out filter brightness-90"
        style={{ backgroundImage: `url(${bgImageSrc})` }}
      />
      {/* Subtle Cinematic Vignette */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/80 pointer-events-none" />

      {/* 2. Top Header Navigation */}
      <Header 
        userState={userState}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        tokenTimeLeft={tokenTimeLeft}
        onOpenCodex={() => setIsCodexModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        codexCount={collectedItems.length}
        isCodexComplete={isCodexComplete}
        isZenMode={isZenMode}
        setIsZenMode={setIsZenMode}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        isLoggingIn={isLoggingIn}
        onReturnToRift={() => handleMoveStart(0)}
        onAdminTeleport={handleAdminTeleport}
      />

      {/* 3. Main Dynamic Content View (Zen Mode hiding support) */}
      {!isZenMode && (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full space-y-6 pb-24">
          {/* A. Traveling Warp State */}
          {isMoving && (
            <div className="w-full max-w-2xl mx-auto">
              <MovementTimer 
                userState={userState}
                timeLeft={timeLeft}
                onArrive={handleArrive}
                isAdmin={isAdmin}
              />
            </div>
          )}

          {/* B. Spot Arrived State & Omikuji Box Gacha */}
          {!isMoving && userState?.current_spot_id && (
            <div className="w-full flex flex-col items-center space-y-4 animate-fade-in">
              {/* If fortune not yet drawn */}
              {!omikujiResult && (
                <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-black/55 border border-purple-500/30 shadow-2xl flex flex-col items-center text-center space-y-4">
                  <span className="text-xs font-bold text-purple-300 tracking-wider uppercase">
                    {currentSpot?.worldName} • 神社
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow">
                    {currentSpot?.locationName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                    이곳의 시공간 에너지가 응축되어 있습니다. 운명의 산통을 흔들어 오늘의 차원 점괘를 확인하세요!
                  </p>

                  <button
                    onClick={handleDrawOmikuji}
                    disabled={isDrawing}
                    className={`w-full max-w-md py-4 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase transition shadow-2xl flex items-center justify-center space-x-2 ${
                      isDrawing 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-white shadow-amber-500/40 hover:scale-102 active:scale-98'
                    }`}
                  >
                    <span>🥠</span>
                    <span>{isDrawing ? "점괘 뽑는 중..." : "운명의 산통 흔들기 (점괘 뽑기)"}</span>
                  </button>
                </div>
              )}

              {/* Drawn Fortune Details */}
              {omikujiResult && (
                <div className="w-full max-w-2xl mx-auto">
                  <OmikujiView 
                    result={omikujiResult}
                    spot={currentSpot || undefined}
                    llmResult={llmResult}
                    isInterpreting={isInterpreting}
                    onInterpret={handleInterpret}
                    onShare={() => setIsShareModalOpen(true)}
                    userTokens={userState?.llm_tokens || 0}
                    isGuest={userState?.is_guest}
                    onGoogleLogin={handleGoogleLogin}
                  />
                </div>
              )}
            </div>
          )}

          {/* C. Dimensional Portal Matrix (Selector) - Shown when at Rift or when exploring */}
          {!isMoving && !userState?.current_spot_id && (
            <div className="w-full flex flex-col space-y-4 animate-fade-in">
              <MapSelector 
                selectedSpot={selectedSpot}
                setSelectedSpot={setSelectedSpot}
                onStartMove={(customSpotId) => handleMoveStart(customSpotId)}
                userState={userState}
                isCodexComplete={isCodexComplete}
                isAdmin={isAdmin}
              />
            </div>
          )}

          {/* D. Bottom World Warp Navigation (Available when at a spot) */}
          {!isMoving && userState?.current_spot_id && (
            <div className="w-full mt-4">
              <div className="p-5 sm:p-6 rounded-3xl backdrop-blur-xl bg-black/45 border border-white/10 flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                  <div className="text-left">
                    <span className="text-[11px] text-gray-400 font-bold block">멀티버스 시공간 워프</span>
                    <span className="text-xs sm:text-sm text-gray-200 font-bold">성소로 귀환하거나 새로운 차원으로 도약하세요</span>
                  </div>
                  <button
                    onClick={() => handleMoveStart(0)}
                    className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 transition shadow whitespace-nowrap active:scale-95"
                  >
                    ⛩️ 성소로 귀환 (60초)
                  </button>
                </div>

                {/* Collapsible/Direct Portal Matrix when in a spot */}
                <div className="w-full pt-4 border-t border-white/10">
                  <MapSelector 
                    selectedSpot={selectedSpot}
                    setSelectedSpot={setSelectedSpot}
                    onStartMove={(customSpotId) => handleMoveStart(customSpotId)}
                    userState={userState}
                    isCodexComplete={isCodexComplete}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* 4. Modals */}
      <CodexModal 
        isOpen={isCodexModalOpen}
        onClose={() => setIsCodexModalOpen(false)}
        collectedItems={collectedItems}
        isCodexComplete={isCodexComplete}
      />

      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={userId}
      />

      <FortuneShakeModal 
        isOpen={isShakeModalOpen}
        spotId={userState?.current_spot_id || 1}
        onComplete={handleCompleteShakeAndDraw}
      />

      {omikujiResult && (
        <ShareTicketModal 
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          result={omikujiResult}
          spot={currentSpot || undefined}
        />
      )}

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
