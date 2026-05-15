import { createContext, useContext, useMemo, useState } from 'react';

const LIGHT = {
  mode: 'light',
  primary: '#1a3a5c',
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
  heroSub: '#ccd9e8',
};

const DARK = {
  mode: 'dark',
  primary: '#0f1f33',
  accent: '#d4b86a',
  bg: '#121212',
  card: '#1e1e1e',
  cardBorder: '#2a2a2a',
  text: '#ececec',
  textMuted: '#b8b8b8',
  textSubtle: '#909090',
  divider: '#333333',
  inputBg: '#1e1e1e',
  badgeBg: '#243447',
  heroSub: '#a8b8cc',
};

const FONT_SCALES = {
  pequeno: 0.85,
  normal: 1,
  grande: 1.15,
  enorme: 1.35,
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  const value = useMemo(() => {
    const colors = darkMode ? DARK : LIGHT;
    const scale = FONT_SCALES[fontSize] ?? 1;
    return {
      colors,
      darkMode,
      setDarkMode,
      fontSize,
      setFontSize,
      scale,
      fs: (n) => Math.round(n * scale),
    };
  }, [darkMode, fontSize]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
