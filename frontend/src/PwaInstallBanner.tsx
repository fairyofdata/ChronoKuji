import React, { useState, useEffect } from 'react';

interface PwaInstallBannerProps {
  onInstalled?: () => void;
}

export default function PwaInstallBanner({ onInstalled }: PwaInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      if (onInstalled) onInstalled();
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-gradient-to-r from-purple-950/95 via-gray-900/95 to-indigo-950/95 border border-purple-500/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center justify-between text-white animate-bounce-slow">
      <div className="flex items-center space-x-3 text-left">
        <span className="text-2xl">📱</span>
        <div>
          <h4 className="text-xs font-black text-amber-300">앱으로 설치하고 보너스 토큰 받기</h4>
          <p className="text-[10px] text-gray-300">홈 화면에 설치하면 1회 보너스 토큰이 지급됩니다!</p>
        </div>
      </div>
      <div className="flex space-x-1.5">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition hover:scale-105"
        >
          설치
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="px-2 py-1.5 text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
