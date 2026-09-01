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
import './App.css';

export default function App() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('omikuz_user_id'));
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<number>(1);
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
    return () => {
      window.removeEventListener('click', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
    };
  }, []);

  // 2. Firebase Auth Listener & Profile Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Google 로그인 사용자: 백엔드와 동기화
        const guestUuid = localStorage.getItem('omikuz_guest_uuid') || undefined;
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/users/firebase-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebase_uid: fbUser.uid,
              email: fbUser.email,
              display_name: fbUser.displayName,
              photo_url: fbUser.photoURL,
              guest_uuid: guestUuid
            })
          });
          if (res.ok) {
            const data = await res.json();
            setUserId(data.user_id);
            localStorage.setItem('omikuz_user_id', data.user_id);
            fetchUserState(data.user_id);
          }
        } catch (e) {
          console.error("Firebase auth sync error:", e);
        }
      } else {
        // 게스트 유저: 로컬 UUID 기반 초기화
        let guestId = localStorage.getItem('omikuz_guest_uuid');
        if (!guestId) {
          guestId = crypto.randomUUID();
          localStorage.setItem('omikuz_guest_uuid', guestId);
        }
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/users/auth?client_uuid=${guestId}`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setUserId(data.user_id);
            localStorage.setItem('omikuz_user_id', data.user_id);
            fetchUserState(data.user_id);
          }
        } catch (e) {
          console.error("Guest auth error:", e);
          setUserId(guestId);
          fetchUserState(guestId);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserState = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: { 'x-user-id': uid }
      });
      if (res.ok) {
        const data: UserState = await res.json();
        setUserState(data);
        if (data.current_spot_id) {
          setSelectedSpot(data.current_spot_id);
        }
      }
    } catch (e) {
      console.error("fetchUserState error:", e);
    }
  };

  // Google Login Action
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        alert("구글 로그인 중 오류가 발생했습니다: " + (e?.message || e));
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
        if (userId) fetchUserState(userId);
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

  // 4. Codex Items Synchronization from History
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

  // 5. Warp Start Handler
  const handleMoveStart = async () => {
    if (!userId) return;
    hasUnlockedAudio.current = true;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/movement/start?target_spot_id=${selectedSpot}`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        setOmikujiResult(null);
        setLlmResult(null);
        await fetchUserState(userId);
        AudioEngine.playTravelMusic();
      } else {
        const err = await res.json();
        alert(err.detail || "이동 시작에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Warp Arrival Handler
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
        await fetchUserState(userId);
        if (data.current_spot_id) {
          AudioEngine.playSpotMusic(data.current_spot_id);
        } else {
          AudioEngine.playLobbyMusic();
        }
      } else {
        const err = await res.json();
        alert(err.detail || "도착 처리에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Omikuji Draw Triggers
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrawing(false);
    }
  };

  // 8. AI Counseling Interpretation Handler
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
      } else {
        const err = await res.json();
        alert(err.detail || "AI 해석 요청에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInterpreting(false);
    }
  };

  // 배경 이미지 결정
  const currentSpot = userState?.current_spot_id 
    ? SPOTS.find(s => s.id === userState.current_spot_id) 
    : null;

  const bgImageSrc = (userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.is_arrived && timeLeft > 0)
    ? '/assets/worlds/traveling_time_path.jpg'
    : (currentSpot ? currentSpot.bgImage : '/assets/worlds/lobby_rift.jpg');

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
      />

      {/* 3. Main Stage Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Zen Cinema Mode Overlay Notice */}
        {isZenMode ? (
          <div 
            onClick={() => setIsZenMode(false)}
            className="flex-1 flex flex-col items-center justify-end pb-12 cursor-pointer animate-fade-in"
          >
            <div className="bg-black/60 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-xs font-bold text-gray-200 hover:text-white transition shadow-2xl animate-pulse">
              🖼️ 감상 모드 작동 중 • 화면을 클릭하면 UI가 복귀합니다
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: World Navigation & Warp Controls (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <MapSelector 
                userState={userState}
                selectedSpot={selectedSpot}
                setSelectedSpot={setSelectedSpot}
                handleMoveStart={handleMoveStart}
                handleDrawOmikuji={handleDrawOmikuji}
                isDrawing={isDrawing}
                isCodexComplete={isCodexComplete}
              />

              <MovementTimer 
                userState={userState}
                timeLeft={timeLeft}
                isAdmin={isAdmin}
                handleArrive={handleArrive}
              />
            </div>

            {/* Right Column: Omikuji Fortune & AI Counseling Card (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              {omikujiResult ? (
                <OmikujiView 
                  result={omikujiResult}
                  spot={currentSpot || SPOTS.find(s => s.id === (userState?.current_spot_id || 1))}
                  userTokens={userState?.llm_tokens ?? 0}
                  isGuest={userState?.is_guest ?? true}
                  onGoogleLogin={handleGoogleLogin}
                  onInterpret={handleInterpret}
                  isInterpreting={isInterpreting}
                  llmResult={llmResult}
                  onShare={() => setIsShareModalOpen(true)}
                />
              ) : (
                <div className="bg-black/40 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl text-center flex flex-col items-center justify-center min-h-[360px] space-y-4">
                  <span className="text-5xl animate-bounce-slow">🥠</span>
                  <div>
                    <h3 className="text-xl font-black text-white drop-shadow">
                      {userState?.current_spot_id 
                        ? "차원에 도착했습니다! 운명의 점괘를 뽑아보세요." 
                        : "시공간의 틈새에서 여행 준비 중입니다."}
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md mx-auto mt-1 leading-relaxed">
                      {userState?.current_spot_id 
                        ? "좌측의 [이곳에서 점괘 뽑기] 버튼을 누르고 신비로운 산통을 흔들어 오늘의 운명을 확인하세요." 
                        : "좌측 메뉴에서 12개 세계관 중 한 곳을 선택하여 초월공학 시공간 워프를 시작하세요."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. Global Modals */}
      <FortuneShakeModal 
        isOpen={isShakeModalOpen}
        spotId={userState?.current_spot_id || 1}
        onComplete={handleCompleteShakeAndDraw}
      />

      <CodexModal 
        isOpen={isCodexModalOpen}
        onClose={() => setIsCodexModalOpen(false)}
        collectedItems={collectedItems}
        isComplete={isCodexComplete}
      />

      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={userId}
        currentSpotId={userState?.current_spot_id}
      />

      <ShareTicketModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={omikujiResult}
        spotId={userState?.current_spot_id || 1}
      />

      <PwaInstallBanner />
    </div>
  );
}
