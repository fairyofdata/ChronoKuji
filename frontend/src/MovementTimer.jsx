import { SPOTS, SYSTEM_AUDIO_TRACKS } from './constants';

export default function MovementTimer({ userState, timeLeft, isAdmin, handleArrive }) {
  const progressPercent = Math.min(100, Math.max(0, ((60 - timeLeft) / 60) * 100));
  const isTargetRift = userState?.target_spot_id === 0;
  const targetSpot = userState?.target_spot_id 
    ? SPOTS.find(s => s.id === userState.target_spot_id) 
    : null;

  return (
    <div className="animate-fade-in w-full">
      {userState?.target_spot_id !== null && userState?.target_spot_id !== undefined && !userState?.is_arrived && timeLeft > 0 && !isAdmin && (
        <div className="bg-black/40 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-cyan-500/30 flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center space-x-2 text-yellow-300 text-base font-extrabold animate-pulse">
              <span>🚀</span>
              <span>
                [{isTargetRift ? "차원의 균열" : (targetSpot?.shortName || "목적지")}] (으)로 시공간 워프 중...
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 border border-cyan-500/40 text-cyan-300 flex items-center space-x-1 backdrop-blur-sm">
              <span>⏳</span>
              <span>BGM: {SYSTEM_AUDIO_TRACKS.travel.title}</span>
            </span>
          </div>
          
          <div className="w-full h-28 rounded-xl overflow-hidden relative border border-gray-700 shadow-inner">
            <img 
              src={isTargetRift ? "/assets/worlds/lobby_rift.jpg" : (targetSpot?.bgImage || "/assets/worlds/lobby_rift.jpg")} 
              alt="목적지" 
              className="w-full h-full object-cover filter brightness-75 animate-pulse" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-xs font-bold text-gray-200">
                목적지: {isTargetRift ? "차원의 균열 (성소)" : (targetSpot?.name || "미지의 차원")}
              </span>
            </div>
          </div>

          {/* 게이지 바 (Progress Bar) */}
          <div className="w-full bg-gray-900 rounded-full h-4 border border-gray-700 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-linear relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <p className="text-3xl sm:text-4xl font-mono text-white font-black tracking-widest drop-shadow">
            {timeLeft}<span className="text-lg font-normal text-gray-400 ml-1">초</span>
          </p>
        </div>
      )}

      {userState?.target_spot_id && (userState?.is_arrived || isAdmin) && (
        <div className="bg-gray-700/90 backdrop-blur-sm p-6 rounded-2xl animate-slide-up shadow-2xl border border-green-500/40 text-center space-y-4">
          <div className="w-14 h-14 bg-green-500/20 text-green-400 text-3xl rounded-full flex items-center justify-center mx-auto border border-green-500/40 animate-bounce">
            ✨
          </div>
          <div>
            <h3 className="text-green-300 text-xl font-black">목적지에 도착했습니다!</h3>
            <p className="text-xs text-gray-300 mt-1">{targetSpot?.name || "새로운 차원"}에 진입했습니다.</p>
          </div>
          <button onClick={handleArrive} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-green-500/40">
            오미쿠지 대기열 입장하기 🚪
          </button>
        </div>
      )}
    </div>
  );
}