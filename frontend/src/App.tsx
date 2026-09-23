import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import MapSelector from './MapSelector';
import MovementTimer from './MovementTimer';
import OmikujiView from './OmikujiView';
import CodexModal from './CodexModal';
import HistoryModal from './HistoryModal';
import FortuneShakeModal from './FortuneShakeModal';
import ShareTicketModal from './ShareTicketModal';
import ObservatoryStatsModal from './ObservatoryStatsModal';
import PwaInstallBanner from './PwaInstallBanner';
import { SPOTS, CODEX_ITEMS, getLocalizedLuckDisplay } from './constants';
import { AudioEngine } from './audioEngine';
import { auth, loginWithGoogle, logoutFirebase, onAuthStateChanged, FirebaseUser } from './firebase';
import { UserState, OmikujiResult, LlmInterpretationResult, CollectedCodexItem } from './types';
import { parseUtcDate } from './utils/date';
import { API_BASE_URL } from './config';
import { LocalGameService } from './services/localGameService';
import { ToastProvider, useToast } from './Toast';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import './App.css';

function AppContent() {
  const { language, getSpotTranslation } = useLanguage();
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
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
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
    const checkStateAndSync = (state: UserState) => {
      // 이미 도착 시간이 지난 이동 중 상태라면 즉시 도착 해결
      if (state.target_spot_id !== null && state.target_spot_id !== undefined && !state.current_spot_id) {
        const arrMs = state.arrival_time ? parseUtcDate(state.arrival_time) : 0;
        if (!arrMs || arrMs <= Date.now() || state.is_arrived) {
          setTimeout(() => handleArrive(), 100);
        }
      }
    };

    try {
      if (API_BASE_URL) {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/state`, {
          headers: { 'x-user-id': uid }
        });
        if (res.ok) {
          const state: UserState = await res.json();
          setUserState(state);
          checkStateAndSync(state);

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
          return;
        }
      }
    } catch (e) {
      console.warn("Backend not available, using local standalone game service:", e);
    }

    // Client-First Standalone Fallback
    const localState = LocalGameService.getUserState(uid);
    setUserState(localState);
    checkStateAndSync(localState);

    if (hasUnlockedAudio.current) {
      if (localState.target_spot_id !== null && localState.target_spot_id !== undefined && !localState.is_arrived) {
        AudioEngine.playTravelMusic();
      } else if (localState.current_spot_id) {
        AudioEngine.playSpotMusic(localState.current_spot_id);
      } else {
        AudioEngine.playLobbyMusic();
      }
    }
  };

  // Auth Initialization & Firebase Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);

      try {
        if (fUser) {
          // Google Authenticated User Login (게스트 기록 연동 지원)
          const currentGuestId = localStorage.getItem('omikuz_user_id');
          const res = await fetch(`${API_BASE_URL}/api/v1/users/firebase-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              firebase_uid: fUser.uid,
              email: fUser.email,
              display_name: fUser.displayName,
              photo_url: fUser.photoURL,
              guest_uuid: currentGuestId || undefined
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
          title: language === 'en' ? '🔑 Login Successful' : language === 'ja' ? '🔑 ログイン成功' : '🔑 로그인 성공',
          message: language === 'en'
            ? `Welcome ${user.displayName || 'Traveler'}!\n1 free AI deep interpretation refills every 20 hours.`
            : language === 'ja'
            ? `ようこそ ${user.displayName || '旅人'}様！\n20時間ごとに1回無料のAI深層解読がチャージされます。`
            : `${user.displayName || '여행자'}님 환영합니다!\n20시간마다 1회 무료 AI 심층 풀이가 충전됩니다.`
        });
      }
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        showToast({
          type: 'error',
          title: language === 'en' ? 'Login Failed' : language === 'ja' ? 'ログイン失敗' : '로그인 실패',
          message: e?.message || (language === 'en' ? "An error occurred during Google login." : language === 'ja' ? "Googleログイン中にエラーが発生しました。" : "구글 로그인 중 오류가 발생했습니다.")
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
      localStorage.removeItem('omikuz_user_id');

      // 신규 게스트 세션 생성
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

      showToast({
        type: 'info',
        title: language === 'en' ? 'Logged Out' : language === 'ja' ? 'ログアウト完了' : '로그아웃 완료',
        message: language === 'en' ? 'Switched to guest mode.' : language === 'ja' ? 'ゲストモードに切り替わりました。' : '게스트 모드로 전환되었습니다.'
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Spacetime Warp Timer (60s Countdown)
  useEffect(() => {
    // 이동 중이 아닌 경우 타이머 초기화
    const isActuallyMoving = userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.current_spot_id;
    if (!isActuallyMoving) {
      setTimeLeft(0);
      return;
    }

    const arrivalMs = userState?.arrival_time ? parseUtcDate(userState.arrival_time) : 0;
    const now = Date.now();

    // 이미 도착 시간이 지났거나 is_arrived 상태인데 current_spot_id가 아직 null인 경우 즉시 도착 확정
    if (!arrivalMs || now >= arrivalMs || userState?.is_arrived) {
      setTimeLeft(0);
      handleArrive();
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
  }, [userState?.arrival_time, userState?.is_arrived, userState?.target_spot_id, userState?.current_spot_id, userId]);

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
      if (API_BASE_URL) {
        fetch(`${API_BASE_URL}/api/v1/omikuji/history`, { headers: { 'x-user-id': userId } })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.histories) {
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
              return;
            }
            // 폴백
            setCollectedItems(LocalGameService.getCollectedCodex());
          })
          .catch(() => {
            setCollectedItems(LocalGameService.getCollectedCodex());
          });
      } else {
        setCollectedItems(LocalGameService.getCollectedCodex());
      }
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
      // 차원의 균열을 깨부수고 들어가는 '슈콰앙!' 사운드 즉각 재생
      AudioEngine.playDimensionalRiftSound();

      let startData: any = null;
      if (API_BASE_URL) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/movement/start?target_spot_id=${targetId}`, {
            method: 'POST',
            headers: { 'x-user-id': userId }
          });
          if (res.ok) startData = await res.json();
        } catch {}
      }

      // Standalone Fallback
      if (!startData) {
        startData = LocalGameService.startMovement(targetId);
      }

      setOmikujiResult(null);
      setLlmResult(null);

      // 실시간 워프 시간 설정 및 상태 즉각 낙관적 갱신
      const arrivalIso = startData.arrival_time || new Date(Date.now() + 60000).toISOString();
      const arrivalMs = parseUtcDate(arrivalIso);
      const initialSeconds = arrivalMs ? Math.max(1, Math.ceil((arrivalMs - Date.now()) / 1000)) : 60;
      setTimeLeft(initialSeconds);

      setUserState(prev => {
        if (prev) {
          return {
            ...prev,
            current_spot_id: null,
            target_spot_id: targetId,
            arrival_time: arrivalIso,
            is_arrived: false
          };
        }
        return startData;
      });

      AudioEngine.playTravelMusic();

      const targetSpotInfo = targetId === 0 ? null : getSpotTranslation(targetId);
      const destName = targetId === 0 
        ? (language === 'en' ? "Dimensional Rift (Sanctuary)" : language === 'ja' ? "次元の狭間 (聖所)" : "차원의 균열 (성소)") 
        : (targetSpotInfo ? `${targetSpotInfo.locationName} (${targetSpotInfo.worldName})` : (language === 'en' ? "Destination" : language === 'ja' ? "目的地" : "목적지"));

      showToast({
        type: 'info',
        title: language === 'en' ? '⏳ Spacetime Warp Initiated' : language === 'ja' ? '⏳ 時空ワープ開始' : '⏳ 시공간 워프 개시',
        message: language === 'en'
          ? `Initiating warp towards [${destName}]. (Takes 60s)`
          : language === 'ja'
          ? `[${destName}]へ向けて跳躍を開始します。(所要時間 60秒)`
          : `[${destName}]을(를) 향해 도약을 시작합니다. (60초 소요)`
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Warp Arrival Handler
  const isArrivingRef = useRef<boolean>(false);
  const handleArrive = async () => {
    if (!userId || isArrivingRef.current) return;
    isArrivingRef.current = true;
    try {
      let data: any = null;
      if (API_BASE_URL) {
        try {
          const headers: Record<string, string> = { 'x-user-id': userId };
          if (isAdmin) headers['x-admin-bypass'] = '486';
          const res = await fetch(`${API_BASE_URL}/api/v1/movement/arrive`, {
            method: 'POST',
            headers
          });
          if (res.ok) data = await res.json();
        } catch {}
      }

      // Standalone Fallback
      if (!data) {
        data = LocalGameService.arriveMovement();
      }

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
      } : data);

      if (arrivedSpotId) {
        AudioEngine.playSpotMusic(arrivedSpotId);
        const arrivedSpotInfo = getSpotTranslation(arrivedSpotId);
        showToast({
          type: 'success',
          title: language === 'en' ? '🎉 Dimensional Entry Complete' : language === 'ja' ? '🎉 次元突入完了' : '🎉 차원 진입 성공',
          message: language === 'en'
            ? `Safely arrived at [${arrivedSpotInfo.locationName}] (${arrivedSpotInfo.worldName})!`
            : language === 'ja'
            ? `[${arrivedSpotInfo.locationName}] (${arrivedSpotInfo.worldName})に無事到着しました！`
            : `[${arrivedSpotInfo.locationName}] (${arrivedSpotInfo.worldName})에 무사히 도착했습니다!`
        });
      } else {
        AudioEngine.playLobbyMusic();
        showToast({
          type: 'shrine',
          title: language === 'en' ? '⛩️ Returned to Sanctuary' : language === 'ja' ? '⛩️ 聖所帰還完了' : '⛩️ 성소 귀환 완료',
          message: language === 'en' ? 'Safely returned to the Dimensional Rift Sanctuary.' : language === 'ja' ? '次元の狭間の聖所に無事帰還しました。' : '차원의 균열 성소로 안전하게 귀환했습니다.'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      isArrivingRef.current = false;
    }
  };

  // 7-0. Regenerative Warp Braking Handler (차원 도약 회생제동)
  const handleWarpBrake = (seconds: number = 3) => {
    if (!userState?.arrival_time || userState.is_arrived) return;

    // 회생제동 인버터 공명 SFX 재생
    AudioEngine.playWarpBrakeSound();

    // LocalGameService 상태 갱신
    LocalGameService.brakeMovement(seconds);

    // React 상태 및 남은 시간 갱신
    const currentArrivalMs = parseUtcDate(userState.arrival_time);
    const newArrivalMs = Math.max(Date.now(), currentArrivalMs - (seconds * 1000));
    const newArrivalIso = new Date(newArrivalMs).toISOString();
    const remainingSec = Math.max(0, Math.ceil((newArrivalMs - Date.now()) / 1000));

    setTimeLeft(remainingSec);
    setUserState(prev => prev ? {
      ...prev,
      arrival_time: newArrivalIso
    } : null);

    // 회생제동으로 남은 시간이 0초에 도달하면 즉시 자동 안착
    if (remainingSec <= 0) {
      handleArrive();
    }
  };

  // 7-1. Admin Instant Teleport Handler (0s Bypass)
  const handleAdminTeleport = async (spotId: number) => {
    if (!userId) return;
    try {
      hasUnlockedAudio.current = true;
      let data: any = null;

      if (API_BASE_URL) {
        try {
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
          if (res.ok) data = await res.json();
        } catch {}
      }

      // Standalone Fallback
      if (!data) {
        LocalGameService.startMovement(spotId);
        data = LocalGameService.arriveMovement();
      }

      setOmikujiResult(null);
      setLlmResult(null);
      await fetchUserState(userId);

      if (data.current_spot_id) {
        AudioEngine.playSpotMusic(data.current_spot_id);
        const adminSpotInfo = getSpotTranslation(data.current_spot_id);
        showToast({
          type: 'success',
          title: language === 'en' ? '⚡ Admin Teleport Success' : language === 'ja' ? '⚡ 管理者テレポート成功' : '⚡ 관리자 텔레포트 성공',
          message: language === 'en'
            ? `Instantly jumped to [${adminSpotInfo.locationName}] (${adminSpotInfo.worldName})!`
            : language === 'ja'
            ? `[${adminSpotInfo.locationName}] (${adminSpotInfo.worldName})へ即時跳躍しました！`
            : `[${adminSpotInfo.locationName}] (${adminSpotInfo.worldName})로 대기 없이 즉시 도약했습니다!`
        });
      } else {
        AudioEngine.playLobbyMusic();
        showToast({
          type: 'shrine',
          title: language === 'en' ? '⛩️ Instant Sanctuary Return' : language === 'ja' ? '⛩️ 聖所即時帰還' : '⛩️ 성소 즉시 귀환',
          message: language === 'en' ? 'Instantly returned to the Dimensional Rift Sanctuary.' : language === 'ja' ? '次元の狭間の聖所へ即時帰還しました。' : '차원의 균열 성소로 즉시 귀환했습니다.'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Omikuji Draw Triggers
  const handleDrawOmikuji = () => {
    setIsShakeModalOpen(true);
  };

  const handleCompleteShakeAndDraw = async (forcedLuck?: string) => {
    setIsShakeModalOpen(false);
    if (!userId || !userState?.current_spot_id) return;
    setIsDrawing(true);

    try {
      let data: OmikujiResult | null = null;
      if (API_BASE_URL && !forcedLuck) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/omikuji/draw?spot_id=${userState.current_spot_id}`, {
            method: 'POST',
            headers: { 'x-user-id': userId }
          });
          if (res.ok) data = await res.json();
        } catch {}
      }

      // Standalone Fallback / Forced Luck
      if (!data) {
        data = LocalGameService.drawOmikuji(userState.current_spot_id, language, forcedLuck);
      }

      setOmikujiResult(data);
      setLlmResult(null);

      // 대흉(大凶) 릭롤링 음악 전환 (Never Gonna Give You Up - dQw4w9WgXcQ)
      if (data.luck_level === '大凶') {
        AudioEngine.playRickroll();
      } else if (userState.current_spot_id === 9 && data.luck_level === '大吉') {
        // 라푼젤 대길 축제 음악 전환
        AudioEngine.playCelebrationMusic(9);
      }

      showToast({
        type: data.luck_level === '大吉' ? 'success' : data.luck_level === '凶' || data.luck_level === '大凶' ? 'warning' : 'info',
        title: language === 'en' 
          ? `🥠 Fortune [${getLocalizedLuckDisplay(data.luck_level, 'en')}] Revealed` 
          : language === 'ja' 
          ? `🥠 おみくじ [${data.luck_level}] 出現` 
          : `🥠 점괘 [${getLocalizedLuckDisplay(data.luck_level, 'ko')}] 출현`,
        message: language === 'en' ? 'The tapestry of your destiny unfolds.' : language === 'ja' ? '運命のおみくじが開かれました。' : '운명의 점괘가 펼쳐졌습니다.'
      });
      // 도감 갱신
      setCollectedItems(LocalGameService.getCollectedCodex());
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrawing(false);
    }
  };

  // 9. AI Counseling Interpretation Handler
  const handleInterpret = async (context: string) => {
    if (!userId || !omikujiResult) return;
    setIsInterpreting(true);
    try {
      let data: any = null;
      if (API_BASE_URL && !userState?.is_guest) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/interpret/${omikujiResult.history_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId
            },
            body: JSON.stringify({
              user_context: context,
              language
            })
          });
          if (res.ok) data = await res.json();
        } catch {}
      }

      // Standalone Fallback (오프라인 룰베이스/감성 AI 해석 - 다국어 지원)
      if (!data) {
        data = await LocalGameService.interpretOmikuji(omikujiResult.history_id, context, language);
      }

      setLlmResult(data);
      showToast({
        type: 'success',
        title: language === 'en' ? '🔮 AI Deep Interpretation Ready' : language === 'ja' ? '🔮 AI深層解読完了' : '🔮 AI 심층 해석 완료',
        message: language === 'en' ? 'Personalized cosmic advice crafted by the world persona.' : language === 'ja' ? '世界観ペルソナの特製助言が完成しました。' : '세계관 페르소나의 맞춤 조언이 완성되었습니다.'
      });
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
  const currentSpotInfo = currentSpot ? getSpotTranslation(currentSpot.id) : null;

  const isMoving = userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.current_spot_id;

  const bgImageSrc = isMoving
    ? '/assets/worlds/traveling_time_path.jpg?v=2'
    : (currentSpot ? currentSpot.bgImage : '/assets/worlds/lobby_rift.jpg?v=2');

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-white flex flex-col font-sans select-none">
      {/* 1. Fullscreen Cinematic Vivid Artwork Canvas */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105 filter brightness-75 contrast-105"
        style={{ backgroundImage: `url(${bgImageSrc})` }}
      />
      
      {/* Dynamic Ambient Color Mesh Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* 2. Top Glassmorphic Navigation Header */}
      <Header 
        userState={userState}
        tokenTimeLeft={tokenTimeLeft}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        isZenMode={isZenMode}
        setIsZenMode={setIsZenMode}
        onOpenCodex={() => setIsCodexModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        codexCount={collectedItems.length}
        isCodexComplete={isCodexComplete}
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
                onBrake={handleWarpBrake}
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
                    {currentSpotInfo?.worldName || currentSpot?.worldName} • {language === 'en' ? 'Shrine' : language === 'ja' ? '神社' : '신사'}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow">
                    {currentSpotInfo?.locationName || currentSpot?.locationName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                    {language === 'en' 
                      ? 'The spacetime energy here is deeply condensed. Shake the sacred cylinder to reveal your dimensional fortune!'
                      : language === 'ja'
                      ? 'この地の時空エネルギーが凝縮されています。神籤筒を振って本日の次元おみくじを引きましょう！'
                      : '이곳의 시공간 에너지가 응축되어 있습니다. 운명의 산통을 흔들어 오늘의 차원 점괘를 확인하세요!'}
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
                    <span>
                      {isDrawing 
                        ? (language === 'en' ? "Revealing Fortune..." : language === 'ja' ? "神籤を引いています..." : "점괘 뽑는 중...")
                        : (language === 'en' ? "Shake Sacred Cylinder (Draw Fortune)" : language === 'ja' ? "神籤筒を振る (おみくじを引く)" : "운명의 산통 흔들기 (점괘 뽑기)")
                      }
                    </span>
                  </button>

                  {isAdmin && (
                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleCompleteShakeAndDraw('大凶')}
                        disabled={isDrawing}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-400/50 shadow transition flex items-center space-x-1 active:scale-95"
                      >
                        <span>🕺</span>
                        <span>[Admin] ⚡ 대흉 (Rickroll) 즉시 뽑기</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Drawn Fortune Details */}
              {omikujiResult && (
                <div className="w-full max-w-2xl mx-auto">
                  <OmikujiView 
                    key={omikujiResult.history_id}
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
                    <span className="text-[11px] text-gray-400 font-bold block">
                      {language === 'en' ? 'Multiverse Spacetime Warp' : language === 'ja' ? 'マルチバース時空ワープ' : '멀티버스 시공간 워프'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-200 font-bold">
                      {language === 'en' ? 'Return to the sanctuary or warp to a new dimension' : language === 'ja' ? '聖所に帰還するか、新たな次元へ跳躍しましょう' : '성소로 귀환하거나 새로운 차원으로 도약하세요'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleMoveStart(0)}
                    className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 transition shadow whitespace-nowrap active:scale-95"
                  >
                    {language === 'en' ? '⛩️ Return to Sanctuary (60s)' : language === 'ja' ? '⛩️ 聖所に帰還 (60秒)' : '⛩️ 성소로 귀환 (60초)'}
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
        isComplete={isCodexComplete}
      />

      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        userId={userId}
      />

      <ObservatoryStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
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
          spotId={currentSpot?.id || 1}
        />
      )}

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  );
}
