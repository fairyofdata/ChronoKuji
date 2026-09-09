import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, SpotTranslation } from './types';
import { TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  getSpotTranslation: (spotId: number) => SpotTranslation;
}

const LANGUAGE_KEY = 'chronokuji_lang';
const DEFAULT_LANGUAGE: Language = 'en';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (saved && (saved === 'en' || saved === 'ko' || saved === 'ja')) {
      return saved;
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    // document lang 속성 업데이트
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const getSpotTranslation = (spotId: number): SpotTranslation => {
    const spot = t.spots[spotId];
    if (spot) return spot;
    return TRANSLATIONS.en.spots[spotId] || {
      name: `Spot ${spotId}`,
      locationName: `Location ${spotId}`,
      worldName: 'Multiverse',
      shortName: `Spot ${spotId}`,
      luckyItem: 'Artifact'
    };
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getSpotTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
