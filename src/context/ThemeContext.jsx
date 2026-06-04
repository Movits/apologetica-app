import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

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
  deepLinkHl: '#f6e6b0',      // destaque temporário (chegada por referência) bem visível
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
  deepLinkHl: '#3a3320',      // destaque temporário (chegada por referência) bem visível
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
        // Na web, a escolha feita na landing fica em localStorage (appg_theme),
        // compartilhada com o app (mesmo domínio). Ela tem prioridade.
        let webTheme = null;
        if (Platform.OS === 'web') {
          try { webTheme = window.localStorage.getItem('appg_theme'); } catch {}
        }
        const [dm, fs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_DARK),
          AsyncStorage.getItem(STORAGE_FONT),
        ]);
        if (webTheme === 'dark' || webTheme === 'light') {
          setDarkModeState(webTheme === 'dark');
        } else if (dm !== null) {
          setDarkModeState(dm === 'true');
        }
        if (fs && FONT_SCALES[fs]) setFontSizeState(fs);
      } catch {
        // sem persistência, segue com padrão
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_DARK, String(darkMode)).catch(() => {});
    // Mantém a chave compartilhada com a landing (web) em sincronia.
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem('appg_theme', darkMode ? 'dark' : 'light'); } catch {}
    }
  }, [darkMode, hydrated]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_FONT, fontSize).catch(() => {});
  }, [fontSize, hydrated]);

  // Sincroniza a navigation bar do Android (fundo + ícones) com o tema, para a
  // barra do sistema não destoar do app no build nativo. O fundo acompanha a cor
  // da tab bar (card); os ícones invertem conforme claro/escuro.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const c = darkMode ? DARK : LIGHT;
    NavigationBar.setBackgroundColorAsync(c.card).catch(() => {});
    NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark').catch(() => {});
  }, [darkMode]);

  // Web: o autofill do navegador pinta um fundo azul/amarelo só no <input> interno,
  // destoando do card. Aqui forçamos o autofill a usar a cor do card e do texto do
  // tema, deixando o campo uniforme. Atualiza quando o tema muda.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const c = darkMode ? DARK : LIGHT;
    const id = 'appg-autofill-style';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent =
      'input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,textarea:-webkit-autofill{' +
      '-webkit-box-shadow:0 0 0 1000px ' + c.card + ' inset !important;' +
      'box-shadow:0 0 0 1000px ' + c.card + ' inset !important;' +
      '-webkit-text-fill-color:' + c.text + ' !important;' +
      'caret-color:' + c.text + ';' +
      'transition:background-color 9999s ease-in-out 0s;}';
  }, [darkMode]);

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
