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

// Paleta dark mode estilo "noite na catedral": navy profundo com dourado quente.
// Tudo na mesma família de cor (azul-marinho) - cards, bg e hero coordenados.
// Texto cor de creme (não branco puro) pra dar sensação de luz de vela.
const DARK = {
  mode: 'dark',
  primary: '#142844',         // navy rico pro hero/header
  primaryText: '#e6c878',     // dourado claro pros títulos em cards
  accent: '#d4b86a',          // dourado pra botões e ícones
  bg: '#0d1722',              // navy bem escuro (mais cohesivo que black puro)
  card: '#172538',            // card visivelmente separado do bg
  cardBorder: '#243248',
  text: '#ece8d8',            // creme quente (mais agradável que branco frio)
  textMuted: '#a8a395',
  textSubtle: '#7a7568',
  divider: '#243248',
  inputBg: '#172538',
  badgeBg: '#243248',
  badgeText: '#e6c878',
  heroSub: '#b8c4d8',
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
