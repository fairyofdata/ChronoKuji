import React, { useState, useEffect } from 'react';

export default function PwaInstallBanner({ onRewardBonusToken }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. 이미 독립 실행(PWA Standalone) 모드인지 확인
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // 2. 브라우저 설치 이벤트 가로채기
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 이미 닫았던 적이 없다면 배너 노출
      const isDismissed = localStorage.getItem('omikuz_pwa_banner_dismissed');
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. 앱 설치 완료 이벤트 감지 (보너스 토큰 지급!)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem('omikuz_pwa_reward_claimed', 'true');
      if (onRewardBonusToken) {
        onRewardBonusToken();
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onRewardBonusToken]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("📱 브라우저 메뉴(공유 또는 ⋮)에서 '홈 화면에 추가'를 눌러 설치할 수 있습니다!");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      if (onRewardBonusToken) {
        onRewardBonusToken();
      }
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('omikuz_pwa_banner_dismissed', 'true');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto p-3.5 bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-slate-900/90 backdrop-blur-xl border-2 border-amber-400/80 rounded-2xl shadow-2xl animate-slide-up flex items-center justify-between space-x-3">
      <div className="flex items-center space-x-3 min-w-0">
        <img 
          src="/icon-192.png" 
          alt="App Icon" 
          className="w-11 h-11 rounded-xl shadow-md border border-amber-400/50 flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-black text-amber-300">📱 홈 화면에 앱 추가</span>
            <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-extrabold">+1 토큰</span>
          </div>
          <p className="text-[11px] text-gray-200 truncate mt-0.5">
            설치하고 매일 아침 차원 운세를 확인하세요!
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 flex-shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black px-3 py-2 rounded-xl shadow-lg transition active:scale-95"
        >
          설치
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-1 text-sm transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
