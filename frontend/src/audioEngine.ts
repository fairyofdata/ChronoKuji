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

  isMuted: () => isMuted,

  /**
   * 차원장 스와이프 효과음 ("피우웅~")
   * 공중에 떠 있는 마법사 카드를 넘길 때 차원 에너지가 공명하듯 피치 벤드 & 밴드패스 필터가 통과하는 소리
   */
  playDimensionalSwipeSound: (direction: 'left' | 'right' | 'select' = 'right') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. 공명 신스 오실레이터 (사인파 + 삼각파 혼합 느낌의 피치 드롭/상승)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      const startFreq = direction === 'left' ? 720 : 640;
      const endFreq = direction === 'left' ? 220 : 190;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

      // 필터 스윕: 공중에 떠서 궤적을 가르는 차원장의 느낌 강화
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.18);
      filter.Q.setValueAtTime(4.0, now);

      // 볼륨 엔벨로프: 부드럽게 시작했다가 꼬리가 빠져나가는 소리
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // 2. 공기 차원 바람 서브 노이즈 ("슈웅" 쉬머링)
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
      noiseSource.start(now);
      noiseSource.stop(now + 0.16);
    } catch (e) {
      // AudioContext unallowed or muted
    }
  },

  /**
   * 차원의 균열 파열/돌파 효과음 ("슈콰앙!")
   * 차원 게이트를 선택하고 도약할 때 시공간 균열을 깨부수고 빨려 들어가는 임팩트 사운드
   */
  playDimensionalRiftSound: () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. 슈콰- 파열 크래시 노이즈 버스트
      const noiseLen = Math.floor(ctx.sampleRate * 0.65);
      const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseLen, 1.8);
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(3600, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 0.55);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. 앙- 서브 베이스 붐 (차원 균열 강타 진동)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      // 3. 차원 유리 깨짐 고주파 아티팩트
      const glassOsc = ctx.createOscillator();
      const glassGain = ctx.createGain();
      glassOsc.type = 'triangle';
      glassOsc.frequency.setValueAtTime(1200, now);
      glassOsc.frequency.exponentialRampToValueAtTime(240, now + 0.25);

      glassGain.gain.setValueAtTime(0.2, now);
      glassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      glassOsc.connect(glassGain);
      glassGain.connect(ctx.destination);

      noiseSrc.start(now);
      noiseSrc.stop(now + 0.65);
      subOsc.start(now);
      subOsc.stop(now + 0.72);
      glassOsc.start(now);
      glassOsc.stop(now + 0.26);
    } catch (e) {
      // AudioContext unallowed or muted
    }
  },

  /**
   * 오미쿠지 산통 흔들기 달그락 소리 (Bamboo cylinder rattle)
   */
  playOmikujiRattleSound: () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 4연속 대나무 막대 부딪히는 달그락 리듬
      const rattleOffsets = [0, 0.08, 0.16, 0.24, 0.32];
      rattleOffsets.forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + offset;

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        const baseFreq = 520 + (idx * 90) % 300 + (Math.random() * 80);
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);

        gain.gain.setValueAtTime(0.35 + Math.random() * 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.07);
      });
    } catch (e) {
      // ignore
    }
  },

  /**
   * 점괘 막대 톡 솟아오르는 소리 (Stick pop)
   */
  playOmikujiStickSound: () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {
      // ignore
    }
  },

  /**
   * 붉은 낙관 인장 쾅 찍히는 도장 소리 (Seal stamp thud)
   */
  playOmikujiStampSound: () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 묵직한 쿵
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.28);
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      // 종이 탁 타격감
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(800, now);
      snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      snapGain.gain.setValueAtTime(0.35, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.32);
      snapOsc.start(now);
      snapOsc.stop(now + 0.1);
    } catch (e) {
      // ignore
    }
  },

  /**
   * 차원 도약 회생제동 (Regenerative Warp Braking) 사운드
   * 차원 파동 에너지를 역위상 코일로 급속 흡수하는 고주파 전기 인버터 공명음
   */
  playWarpBrakeSound: () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. 회생 인버터 공명음 (위잉- 상승 후 안정화)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.22);

      // 저역통과 필터로 부드럽고 묵직한 SF 사운드 형성
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.linearRampToValueAtTime(2400, now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.22);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);

      // 2. 고주파 에너지 아크 펄스 (치링- 찌릿)
      const subPulse = ctx.createOscillator();
      const pulseGain = ctx.createGain();
      subPulse.type = 'sine';
      subPulse.frequency.setValueAtTime(1050, now);
      subPulse.frequency.exponentialRampToValueAtTime(1800, now + 0.06);

      pulseGain.gain.setValueAtTime(0.18, now);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      subPulse.connect(pulseGain);
      pulseGain.connect(ctx.destination);

      subPulse.start(now);
      subPulse.stop(now + 0.14);
    } catch (e) {
      // ignore
    }
  }
};

