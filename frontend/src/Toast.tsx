import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'shrine';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };

    setToasts(prev => [...prev.slice(-3), newToast]); // 최대 4개 유지

    const duration = toast.duration ?? 4500;
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, [hideToast]);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/80',
          icon: '✨',
          bar: 'bg-emerald-400'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/80',
          icon: '⚠️',
          bar: 'bg-amber-400'
        };
      case 'error':
        return {
          bg: 'bg-red-950/90 border-red-500/50 text-red-100 shadow-red-950/80',
          icon: '🚨',
          bar: 'bg-red-400'
        };
      case 'shrine':
        return {
          bg: 'bg-purple-950/90 border-purple-500/60 text-purple-100 shadow-purple-950/90',
          icon: '⛩️',
          bar: 'bg-gradient-to-r from-purple-400 to-amber-300'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gray-900/90 border-cyan-500/40 text-cyan-100 shadow-cyan-950/80',
          icon: '🔮',
          bar: 'bg-cyan-400'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col space-y-2.5 w-[92%] max-w-md pointer-events-none">
        {toasts.map(toast => {
          const style = getToastStyle(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border backdrop-blur-xl p-4 shadow-2xl transition-all duration-300 transform animate-slide-down flex flex-col relative overflow-hidden ${style.bg}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl select-none">{style.icon}</span>
                  <div className="text-left">
                    {toast.title && (
                      <h4 className="text-xs font-bold tracking-wide uppercase opacity-90 mb-0.5">
                        {toast.title}
                      </h4>
                    )}
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-line">
                      {toast.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => hideToast(toast.id)}
                  className="text-gray-400 hover:text-white transition text-xs p-1 rounded-lg hover:bg-white/10 select-none"
                >
                  ✕
                </button>
              </div>

              {/* Optional Action Button */}
              {toast.actionText && toast.onAction && (
                <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      hideToast(toast.id);
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shadow-sm"
                  >
                    {toast.actionText} →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
