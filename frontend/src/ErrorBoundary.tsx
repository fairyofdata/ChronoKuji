import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    // 성소 로비로 이동 및 로컬스토리지 정리
    try {
      localStorage.removeItem('chronokuji_cached_user');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-black/80 border border-purple-500/40 shadow-2xl text-center space-y-4">
            <div className="text-4xl">🌀</div>
            <h2 className="text-lg font-black text-purple-300">
              Spacetime Anomaly Detected
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              A dimensional resonance fluctuation occurred. Please reload to synchronize world coordinates.
            </p>
            {this.state.error && (
              <div className="p-2.5 bg-gray-900/80 rounded-xl text-[10px] font-mono text-rose-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg transition active:scale-95"
            >
              🔄 Synchronize & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
