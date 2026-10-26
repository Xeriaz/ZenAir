import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, type Language, type TranslationSchema } from './translations';
import { db } from '../db/db';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'zenair_language';

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'lt') {
      return saved;
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('lt')) {
        return 'lt';
      }
    }
  } catch {
    // fallback
  }
  return 'lt'; // Default to Lithuanian as requested
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    // Sync with Dexie userProfile if saved there
    db.userProfile.toCollection().first().then((profile) => {
      if (profile && (profile as { language?: Language }).language) {
        const profileLang = (profile as { language?: Language }).language;
        if (profileLang && profileLang !== language) {
          setLanguageState(profileLang);
          localStorage.setItem(STORAGE_KEY, profileLang);
        }
      }
    }).catch(() => {
      // ignore
    });
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }

    // Persist to userProfile if possible
    db.userProfile.toCollection().first().then((profile) => {
      if (profile && profile.id) {
        db.userProfile.update(profile.id, { language: newLang });
      }
    }).catch(() => {
      // ignore
    });
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language]
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
