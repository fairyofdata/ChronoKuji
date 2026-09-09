export type Language = 'en' | 'ko' | 'ja';

export interface SpotTranslation {
  name: string;
  locationName: string;
  worldName: string;
  shortName: string;
  luckyItem: string;
  desc?: string;
}

export interface Translations {
  header: {
    codex: string;
    history: string;
    stats: string;
    soundOn: string;
    soundOff: string;
    streak: string;
    login: string;
    loggingIn: string;
    logout: string;
    tokens: string;
    zenMode: string;
    adminMode: string;
    restrictedTitle: string;
    restrictedMsg: string;
    returnSanctuary: string;
  };
  map: {
    selectWorld: string;
    subTitle: string;
    warpButton: string;
    lockedHidden: string;
    luckyItemLabel: string;
    bgmLabel: string;
    sanctuaryHub: string;
    sanctuaryDesc: string;
    sanctuaryButton: string;
  };
  movement: {
    travelingTitle: string;
    destination: string;
    statusPhases: {
      phase1: string;
      phase2: string;
      phase3: string;
      phase4: string;
    };
    brakeButton: string;
    brakeDesc: string;
    tapPrompt: string;
    earlyArrival: string;
    adminSkip: string;
    calibrationLog: string[];
  };
  omikuji: {
    shrineTitle: string;
    drawFortune: string;
    shakePrompt: string;
    tapToShake: string;
    luckyItem: string;
    poeticVerse: string;
    overallFortune: string;
    categories: {
      wish: string;
      love: string;
      wealth: string;
      work: string;
      travel: string;
      waiting: string;
    };
    luckyDirection: string;
    luckyNumber: string;
    downloadCard: string;
    generatingCard: string;
    copyText: string;
    copiedToast: string;
    tieFortune: string;
    tyingFortune: string;
    tiedComplete: string;
    tiedToast: string;
    aiTitle: string;
    samplePrompt: string;
    sampleClose: string;
    guestWelcomeBonus: string;
    guestTokensExhausted: string;
    remainingTokens: string;
    placeholderInput: string;
    askAiButton: string;
    interpretingButton: string;
    feedbackQuestion: string;
    feedbackHelpful: string;
    feedbackNeedsWork: string;
    feedbackHelpfulToast: string;
    feedbackNeedsWorkToast: string;
  };
  codex: {
    title: string;
    subtitle: string;
    progress: string;
    completedBadge: string;
    hiddenUnlocked: string;
    acquiredOn: string;
    undiscovered: string;
    close: string;
  };
  history: {
    title: string;
    subtitle: string;
    empty: string;
    drawnAt: string;
    viewAiInterpretation: string;
    close: string;
  };
  stats: {
    title: string;
    badge: string;
    subtitle: string;
    activeTravelers: string;
    fortunesDrawn: string;
    aiInference: string;
    aiSatisfaction: string;
    distributionTitle: string;
    distributionSubtitle: string;
    topWorldsTitle: string;
    topWorldsSubtitle: string;
    timesVisited: string;
    architectureTitle: string;
    architectureDesc: string;
    close: string;
  };
  spots: Record<number, SpotTranslation>;
}
