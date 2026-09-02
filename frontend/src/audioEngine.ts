import { SYSTEM_AUDIO_TRACKS, SPOTS } from './constants';

let isMuted: boolean = false;
let globalAudio: HTMLAudioElement | null = null;
let ytPlayer: any = null;
let isYtReady: boolean = false;
let currentSynthNode: { source: AudioNode; gain: GainNode } | null = null;
let currentPlayingUrl: string | null = null;
let currentRequestId: number = 0; // 동시성 레이스 컨디션 방지용 세대 토큰

// 1. 전역 오디오 싱글톤 관리
function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
    globalAudio.volume = 0.35;
  }
  return globalAudio;
}

// 2. YouTube IFrame API 로더
function initYouTubePlayer() {
  if (typeof window === 'undefined') return;

  const existingTag = document.getElementById('youtube-iframe-api');
  if (!existingTag) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
  }

  (window as any).onYouTubeIframeAPIReady = () => {
    let container = document.getElementById('yt-audio-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-audio-container';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    try {
      ytPlayer = new (window as any).YT.Player('yt-audio-container', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0, // 초기 자동 재생 방지
          controls: 0,
          loop: 1,
          playsinline: 1,
          disablekb: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            isYtReady = true;
            ytPlayer.setVolume(35);
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT?.PlayerState?.ENDED) {
              ytPlayer.playVideo();
            }
          },
          onError: () => {
            playAmbientSynth(0);
          }
        }
      });
    } catch (e) {
      console.warn('YouTube Player Init skipped:', e);
    }
  };
}

if (typeof window !== 'undefined') {
  initYouTubePlayer();
}

function playYouTubeTrack(youtubeId: string) {
  if (!youtubeId || isMuted) return;
  if (isYtReady && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById({ videoId: youtubeId });
      ytPlayer.setVolume(isMuted ? 0 : 35);
      ytPlayer.playVideo();
    } catch (e) {
      console.warn('YouTube Play error, fallback to synth', e);
      playAmbientSynth(0);
    }
  }
}

function stopYouTubeTrack() {
  if (isYtReady && ytPlayer && typeof ytPlayer.stopVideo === 'function') {
    try {
      ytPlayer.stopVideo();
    } catch (e) {}
  }
}

// 3. Web Audio API 신디사이저 백업 (오프라인 / 무음 방지)
function playAmbientSynth(spotId: number = 0) {
  if (isMuted) return;
  stopAmbientSynth();

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

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
      (currentSynthNode.source as any).stop?.();
      currentSynthNode.source.disconnect();
    } catch (e) {}
    currentSynthNode = null;
  }
}

// 4. [핵심] 레이스 컨디션 및 중복 재생을 완벽 차단하는 스마트 트랙 라우터
async function playSmartTrack(mp3Path: string, youtubeId: string, fallbackSpotId: number = 0) {
  if (isMuted) return;

  const player = getGlobalAudio();

  // 이미 같은 트랙이 정상 재생 중인 경우 불필요한 재시작 방지
  if (currentPlayingUrl === mp3Path && !player.paused && player.currentTime > 0) {
    return;
  }

  // 요청 고유 ID 증가 (이전 비동기 요청 무효화)
  const thisRequestId = ++currentRequestId;
  currentPlayingUrl = mp3Path;

  // 1) 모든 재생 소스 완전 정지
  try {
    player.pause();
    player.currentTime = 0;
  } catch (e) {}
  stopYouTubeTrack();
  stopAmbientSynth();

  // 2) [1단계: 로컬 MP3 재생 시도]
  let localPlaySuccess = false;
  try {
    player.src = mp3Path;
    player.volume = 0.35;
    player.loop = true;

    const playPromise = player.play();
    if (playPromise !== undefined) {
      await playPromise;
      // 비동기 대기 도중 새로운 재생 요청이 발생했으면 이 요청은 폐기
      if (thisRequestId !== currentRequestId) {
        player.pause();
        return;
      }
      localPlaySuccess = true;
    }
  } catch (err: any) {
    // 새 요청에 의해 중단된 AbortError는 정상적인 취소이므로 폴백을 실행하지 않음
    if (thisRequestId !== currentRequestId || err?.name === 'AbortError') {
      return;
    }
    localPlaySuccess = false;
  }

  // 3) 만약 로컬 MP3 재생에 실패한 경우에만 YouTube/신디사이저 폴백 실행
  if (!localPlaySuccess && thisRequestId === currentRequestId && !isMuted) {
    if (youtubeId) {
      playYouTubeTrack(youtubeId);
    } else {
      playAmbientSynth(fallbackSpotId);
    }
  }
}

export const AudioEngine = {
  playSpotMusic: (spotId: number) => {
    const spot = SPOTS.find(s => s.id === spotId);
    if (!spot) return;
    playSmartTrack(spot.bgm, spot.youtubeId, spot.id);
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
    playSmartTrack(
      SYSTEM_AUDIO_TRACKS.easterEggs.mapleRift.bgm,
      SYSTEM_AUDIO_TRACKS.easterEggs.mapleRift.youtubeId,
      0
    );
  },

  playCelebrationMusic: (spotId: number) => {
    if (spotId === 9) {
      playSmartTrack(
        SYSTEM_AUDIO_TRACKS.celebrationRapunzel.bgm,
        SYSTEM_AUDIO_TRACKS.celebrationRapunzel.youtubeId,
        9
      );
    } else {
      AudioEngine.playSpotMusic(spotId);
    }
  },

  stopAll: () => {
    currentRequestId++; // 진행 중인 비동기 요청 취소
    currentPlayingUrl = null;
    try {
      const player = getGlobalAudio();
      player.pause();
      player.currentTime = 0;
      player.src = '';
    } catch (e) {}
    stopYouTubeTrack();
    stopAmbientSynth();
  },

  toggleMute: () => {
    isMuted = !isMuted;
    if (isMuted) {
      AudioEngine.stopAll();
    } else {
      if (globalAudio && globalAudio.src) {
        globalAudio.play().catch(() => {});
      }
    }
    return isMuted;
  },

  isMuted: () => isMuted
};
