import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate, STRINGS } from '../i18n/strings';
import { setAuthLanguage } from './AuthContext';
import { ensureEnglish } from '../data/english';

// As traduções EN de artigos e referências chegam sob demanda (src/data/
// english.js). O idioma só vira inglês depois delas, para as telas nunca
// mostrarem inglês pela metade. Sem rede (web, pedaço ainda não baixado) vira
// do mesmo jeito: o conteúdo cai no PT e o resto da interface fica em inglês.
const prepare = (lang) => (lang === 'en' ? ensureEnglish().catch(() => {}) : Promise.resolve());

const STORAGE_KEY = 'settings:language';
const DEFAULT_LANG = 'pt';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [hydrated, setHydrated] = useState(false);
  // Último idioma pedido: uma troca rápida (inglês e logo português) não deixa
  // o carregamento do inglês, que termina depois, passar por cima.
  const requested = useRef(DEFAULT_LANG);

  useEffect(() => {
    (async () => {
      try {
        // Na web, a escolha feita na landing fica em localStorage (appg_lang),
        // compartilhada com o app (mesmo domínio). Ela tem prioridade.
        let saved = null;
        if (Platform.OS === 'web') {
          try { saved = window.localStorage.getItem('appg_lang'); } catch {}
        }
        if (!saved || !STRINGS[saved]) {
          saved = await AsyncStorage.getItem(STORAGE_KEY);
        }
        if (saved && STRINGS[saved]) {
          requested.current = saved;
          await prepare(saved);
          if (requested.current === saved) {
            setLangState(saved);
            setAuthLanguage(saved);
          }
        }
      } catch {}
      setHydrated(true);
    })();
  }, []);

  const setLang = (newLang) => {
    if (!STRINGS[newLang]) return;
    requested.current = newLang;
    prepare(newLang).then(() => {
      if (requested.current !== newLang) return;
      setLangState(newLang);
      setAuthLanguage(newLang);
    });
    AsyncStorage.setItem(STORAGE_KEY, newLang).catch(() => {});
    // Mantém a chave compartilhada com a landing (web) em sincronia.
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem('appg_lang', newLang); } catch {}
    }
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
