import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIGHT = {
  mode: 'light',
  primary: '#1a3a5c',
  primaryText: '#1a3a5c',
  accent: '#c9a84c',
  bg: '#f5f0e8',
  card: '#ffffff',
  cardBorder: '#eee',
  text: '#222222',
  textMuted: '#666666',
  textSubtle: '#888888',
  divider: '#dddddd',
  inputBg: '#ffffff',
  badgeBg: '#eef2f7',
  badgeText: '#1a3a5c',
  heroSub: '#ccd9e8',
};

const DARK = {
  mode: 'dark',
  primary: '#0f1f33',
  primaryText: '#e6c878',
  accent: '#d4b86a',
  bg: '#121212',
  card: '#1e1e1e',
  cardBorder: '#2a2a2a',
  text: '#ececec',
  textMuted: '#b8b8b8',
  textSubtle: '#909090',
  divider: '#333333',
  inputBg: '#1e1e1e',
  badgeBg: '#2a3a4f',
  badgeText: '#e6c878',
  heroSub: '#a8b8cc',
};

const FONT_SCALES = {
  pequeno: 0.85,
  normal: 1,
  grande: 1.15,
  enorme: 1.35,
};

const STORAGE_DARK = 'settings:darkMode';
const STORAGE_FONT = 'settings:fontSize';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [fontSize, setFontSizeState] = useState('normal');
  const [hydrated, setHydrated] = useState(false);

  // Carrega settings do disco no boot
  useEffect(() => {
    (async () => {
      try {
        const [dm, fs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_DARK),
          AsyncStorage.getItem(STORAGE_FONT),
        ]);
        if (dm !== null) setDarkModeState(dm === 'true');
        if (fs && FONT_SCALES[fs]) setFontSizeState(fs);
      } catch {
        // sem persistência, segue com padrão
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persiste mudanças
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_DARK, String(darkMode)).catch(() => {});
  }, [darkMode, hydrated]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_FONT, fontSize).catch(() => {});
  }, [fontSize, hydrated]);

  const value = useMemo(() => {
    const colors = darkMode ? DARK : LIGHT;
    const scale = FONT_SCALES[fontSize] ?? 1;
    return {
      colors,
      darkMode,
      setDarkMode: setDarkModeState,
      fontSize,
      setFontSize: setFontSizeState,
      scale,
      fs: (n) => Math.round(n * scale),
      hydrated,
    };
  }, [darkMode, fontSize, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
