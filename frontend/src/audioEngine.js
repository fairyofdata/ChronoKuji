import { SPOTS, SYSTEM_AUDIO_TRACKS } from './constants';

// =========================================================================
// 🔮 O_miku_Z 3단계 하이브리드 오디오 엔진 (Local MP3 ➔ YouTube ➔ Web Synth)
// =========================================================================

let isMuted = false;
let globalAudio = null; // 로컬 MP3 단일 싱글톤 플레이어
let ytPlayer = null;    // YouTube IFrame 백그라운드 스트리머
let ytApiReady = false;
let pendingYoutubeId = null;
let currentSynthNode = null;
let audioCtx = null;

// 1. YouTube IFrame API 동적 초기화
function initYouTubeApi() {
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }

  // 유튜브 API 스크립트 주입
  if (!document.getElementById('youtube-iframe-api-script')) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  window.onYouTubeIframeAPIReady = () => {
    // 숨겨진 컨테이너 생성
    let playerContainer = document.getElementById('yt-audio-container');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'yt-audio-container';
      playerContainer.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-999;';
      document.body.appendChild(playerContainer);
    }

    ytPlayer = new window.YT.Player('yt-audio-container', {
      height: '1',
      width: '1',
      videoId: 'p9LkWbCqZkY',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        loop: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          ytApiReady = true;
          if (ytPlayer.setVolume) ytPlayer.setVolume(35);
          if (pendingYoutubeId) {
            playYouTubeTrack(pendingYoutubeId);
            pendingYoutubeId = null;
          }
        },
        onError: () => {
          // 유튜브 재생 실패 시 Web Audio Synth로 최종 전환
          startAmbientSynth(0);
        }
      }
    });
  };
}

// 브라우저 초기 로드 시 유튜브 API 사전 대기
if (typeof window !== 'undefined') {
  initYouTubeApi();
}

function getGlobalAudio() {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
  }
  return globalAudio;
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 2. YouTube IFrame 트랙 스트리밍
function playYouTubeTrack(youtubeId) {
  if (isMuted) return;

  if (!ytPlayer || !ytApiReady) {
    pendingYoutubeId = youtubeId;
    return;
  }

  try {
    ytPlayer.loadVideoById({
      videoId: youtubeId,
      startSeconds: 0
    });
    ytPlayer.setVolume(35);
    ytPlayer.playVideo();
  } catch (e) {
    startAmbientSynth(0);
  }
}

function stopYouTubeTrack() {
  if (ytPlayer && ytPlayer.stopVideo) {
    try {
      ytPlayer.stopVideo();
    } catch (e) {}
  }
}

// 3. Web Audio Synth (무음 방지 백업)
function startAmbientSynth(spotId) {
  stopAmbientSynth();
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  try {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.03;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(spotId === 10 ? 300 : (spotId === 4 ? 1200 : 600), ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();
    currentSynthNode = { source: whiteNoise, gain: gainNode };
  } catch (e) {}
}

function stopAmbientSynth() {
  if (currentSynthNode) {
    try {
      currentSynthNode.source.stop();
      currentSynthNode.source.disconnect();
    } catch (e) {}
    currentSynthNode = null;
  }
}

// 4. [핵심] 3단계 스마트 트랙 라우터
async function playSmartTrack(mp3Path, youtubeId, fallbackSpotId = 0) {
  if (isMuted) return;

  const player = getGlobalAudio();

  // 기존 음원 정지
  try {
    player.pause();
    player.currentTime = 0;
  } catch (e) {}
  stopYouTubeTrack();
  stopAmbientSynth();

  // [1단계: 로컬 MP3 재생 시도]
  let localPlaySuccess = false;
  try {
    player.src = mp3Path;
    player.volume = 0.35;
    player.loop = true;

    const playPromise = player.play();
    if (playPromise !== undefined) {
      await playPromise;
      localPlaySuccess = true;
    }
  } catch (err) {
    localPlaySuccess = false;
  }

  // [2단계: 로컬 MP3 부재 시 YouTube 백그라운드 스트리밍 폴백]
  if (!localPlaySuccess && youtubeId) {
    playYouTubeTrack(youtubeId);
  } else if (!localPlaySuccess) {
    // [3단계: YouTube도 없을 시 Web Audio Synth 폴백]
    startAmbientSynth(fallbackSpotId);
  }
}

export const AudioEngine = {
  playSpotMusic: (spotId) => {
    const spot = SPOTS.find(s => s.id === spotId);
    const mp3Path = spot?.bgm || `/assets/audio/bgm/spot_${spotId}.mp3`;
    const youtubeId = spot?.youtubeId || 'p9LkWbCqZkY';
    playSmartTrack(mp3Path, youtubeId, spotId);
  },

  playLobbyMusic: () => {
    playSmartTrack(
      SYSTEM_AUDIO_TRACKS.lobby.bgm,
      SYSTEM_AUDIO_TRACKS.lobby.youtubeId,
      0
    );
  },

  playTravelMusic: () => {
    playSmartTrack(
      SYSTEM_AUDIO_TRACKS.travel.bgm,
      SYSTEM_AUDIO_TRACKS.travel.youtubeId,
      0
    );
  },

  playHistoryMusic: () => {
    // 기록보관소 전용 몽환적 BGM: 메이플스토리 차원의 균열
    playSmartTrack(
      SYSTEM_AUDIO_TRACKS.easterEggs.mapleRift.bgm,
      SYSTEM_AUDIO_TRACKS.easterEggs.mapleRift.youtubeId,
      0
    );
  },

  playCelebrationMusic: (spotId) => {
    if (spotId === 9) {
      playSmartTrack(
        SYSTEM_AUDIO_TRACKS.celebrationRapunzel.bgm,
        SYSTEM_AUDIO_TRACKS.celebrationRapunzel.youtubeId,
        spotId
      );
    }
  },

  stopMusic: () => {
    if (globalAudio) {
      try {
        globalAudio.pause();
        globalAudio.currentTime = 0;
      } catch (e) {}
    }
    stopYouTubeTrack();
    stopAmbientSynth();
  },

  toggleMute: () => {
    isMuted = !isMuted;
    if (isMuted) {
      AudioEngine.stopMusic();
    } else {
      if (globalAudio && globalAudio.src && !globalAudio.error) {
        globalAudio.play().catch(() => {
          if (ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
        });
      } else if (ytPlayer && ytPlayer.playVideo) {
        ytPlayer.playVideo();
      }
    }
    return isMuted;
  },

  isMuted: () => isMuted
};
