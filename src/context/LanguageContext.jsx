import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate, STRINGS } from '../i18n/strings';
import { setAuthLanguage } from './AuthContext';

const STORAGE_KEY = 'settings:language';
const DEFAULT_LANG = 'pt';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && STRINGS[saved]) {
          setLangState(saved);
          setAuthLanguage(saved);
        }
      } catch {}
      setHydrated(true);
    })();
  }, []);

  const setLang = (newLang) => {
    if (!STRINGS[newLang]) return;
    setLangState(newLang);
    setAuthLanguage(newLang);
    AsyncStorage.setItem(STORAGE_KEY, newLang).catch(() => {});
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, opts) => translate(lang, key, opts),
      isEn: lang === 'en',
      isPt: lang === 'pt',
      hydrated,
    }),
    [lang, hydrated]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  return ctx;
}

// Hook curto pra usar só a função de tradução.
export function useT() {
  const { t } = useLanguage();
  return t;
}
