import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { space, radius, icon, motion, shadow, textStyle, FONT_FAMILY_BY_PLATFORM } from '../theme/tokens';

// As paletas são exportadas para quem vive fora do provider (o ErrorBoundary
// em App.js embrulha o ThemeProvider). Dentro do app, use useTheme().colors.
export const LIGHT = {
  mode: 'light',
  primary: '#1a3a5c',
  primaryText: '#1a3a5c',
  accent: '#c9a84c',          // dourado para ícones e preenchimentos
  accentText: '#806418',      // dourado escurecido com contraste AA (>=4.5:1) sobre creme e branco, para TEXTO
  bg: '#f5f0e8',
  card: '#ffffff',
  cardBorder: '#eee',
  text: '#222222',
  textMuted: '#666666',
  textSubtle: '#6a6457',    // cinza quente com contraste AA sobre creme e branco
  divider: '#dddddd',
  inputBg: '#ffffff',
  badgeBg: '#eef2f7',
  badgeText: '#1a3a5c',
  heroSub: '#ccd9e8',
  deepLinkHl: '#f6e6b0',      // destaque temporário (chegada por referência) bem visível
  // Cor de ação (botões, links, aba ativa) e o texto que vai por cima dela.
  tint: '#1a3a5c',
  onTint: '#ffffff',
  // Texto sobre o fundo principal (primary).
  onPrimary: '#ffffff',
  // Terceiro nível de texto (legendas e metadados), abaixo de textSubtle.
  textTertiary: '#948c7c',
  // Linhas finas: separator entre linhas de lista, hairline na borda das barras.
  separator: 'rgba(26,58,92,0.14)',
  hairline: 'rgba(0,0,0,0.14)',
  // Fundo translúcido das barras (header e tab bar) por cima do conteúdo.
  material: 'rgba(245,240,232,0.72)',
  // Superfície elevada (sheets, menus) e véu escuro atrás dos modais.
  elevated: '#ffffff',
  overlay: 'rgba(0,0,0,0.4)',
  // Semânticas: ação destrutiva ou erro, e sucesso.
  danger: '#b3261e',
  success: '#2f7a4a',
  // Cores litúrgicas (tempo comum, e advento/quaresma).
  seasonGreen: '#2f7a4a',
  seasonPurple: '#5b3f8a',
};

// Paleta dark mode estilo "noite na catedral": navy profundo com dourado quente.
// Tudo na mesma família de cor (azul-marinho) - cards, bg e hero coordenados.
// Texto cor de creme (não branco puro) pra dar sensação de luz de vela.
export const DARK = {
  mode: 'dark',
  primary: '#142844',         // navy rico pro hero/header
  primaryText: '#e6c878',     // dourado claro pros títulos em cards
  accent: '#d4b86a',          // dourado pra botões e ícones
  accentText: '#d4b86a',      // no escuro o proprio accent ja passa AA sobre navy (bg e card)
  bg: '#0d1722',              // navy bem escuro (mais cohesivo que black puro)
  card: '#172538',            // card visivelmente separado do bg
  cardBorder: '#243248',
  text: '#ece8d8',            // creme quente (mais agradável que branco frio)
  textMuted: '#a8a395',
  textSubtle: '#938d7e',    // contraste AA sobre bg e card no escuro
  divider: '#243248',
  inputBg: '#172538',
  badgeBg: '#243248',
  badgeText: '#e6c878',
  heroSub: '#b8c4d8',
  deepLinkHl: '#3a3320',      // destaque temporário (chegada por referência) bem visível
  // Cor de ação (botões, links, aba ativa) e o texto que vai por cima dela.
  tint: '#d4b86a',
  onTint: '#0d1722',
  // Texto sobre o fundo principal (primary).
  onPrimary: '#ffffff',
  // Terceiro nível de texto (legendas e metadados), abaixo de textSubtle.
  textTertiary: '#7d7767',
  // Linhas finas: separator entre linhas de lista, hairline na borda das barras.
  separator: 'rgba(236,232,216,0.14)',
  hairline: 'rgba(255,255,255,0.14)',
  // Fundo translúcido das barras (header e tab bar) por cima do conteúdo.
  material: 'rgba(13,23,34,0.72)',
  // Superfície elevada (sheets, menus) e véu escuro atrás dos modais.
  elevated: '#1e2f47',
  overlay: 'rgba(0,0,0,0.4)',
  // Semânticas: ação destrutiva ou erro, e sucesso.
  danger: '#f28b82',
  success: '#8fd19e',
  // Cores litúrgicas (tempo comum, e advento/quaresma).
  seasonGreen: '#8fd19e',
  seasonPurple: '#b59ae6',
};

const FONT_SCALES = {
  pequeno: 0.85,
  normal: 1,
  grande: 1.15,
  enorme: 1.35,
  muitoGrande: 1.65,
  maximo: 2.0,
};

// Tokens puros (src/theme/tokens.js) com a família de fonte resolvida para a
// plataforma atual. Platform.OS não muda em tempo de execução, então o objeto
// é constante e mantém a mesma referência entre renders.
const FONT_FAMILY = FONT_FAMILY_BY_PLATFORM[Platform.OS] || FONT_FAMILY_BY_PLATFORM.ios;
const TOKENS = { space, radius, icon, motion, shadow, fontFamily: FONT_FAMILY };

const STORAGE_DARK = 'settings:darkMode';
const STORAGE_FONT = 'settings:fontSize';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Sem preferência salva, o app nasce no tema do sistema (app.json usa
  // userInterfaceStyle "automatic"). A hidratação abaixo sobrescreve se a
  // pessoa já escolheu. Não há listener de mudança do sistema por enquanto.
  const [darkMode, setDarkModeState] = useState(() => Appearance.getColorScheme() === 'dark');
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

  // Grava a preferência de tema só quando a pessoa escolhe (toggle em Ajustes ou
  // no topo do login). Sem escolha salva, o app segue o tema do sistema a cada
  // abertura, por isso a hidratação acima não grava nada. Na web, mantém a chave
  // compartilhada com a landing (appg_theme) em sincronia.
  const setDarkMode = useCallback((next) => {
    const on = Boolean(next);
    setDarkModeState(on);
    AsyncStorage.setItem(STORAGE_DARK, String(on)).catch(() => {});
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem('appg_theme', on ? 'dark' : 'light'); } catch {}
    }
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_FONT, fontSize).catch(() => {});
  }, [fontSize, hydrated]);

  // Sincroniza a navigation bar do Android (fundo + ícones) com o tema, para a
  // barra do sistema não destoar do app no build nativo. O fundo acompanha a cor
  // da tab bar (card); os ícones invertem conforme claro/escuro.
  // Com edge-to-edge (Expo Go 54 e SDK 55) setBackgroundColorAsync vira no-op
  // com aviso no console; a chamada sai quando o edge-to-edge for ligado na
  // onda do chrome (Onda 3). Até lá ela ainda vale no build EAS.
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
    // Piso de 11px: mesmo no menor tamanho de fonte, texto nao fica ilegivel.
    const fs = (n) => Math.max(11, Math.round(n * scale));
    return {
      colors,
      darkMode,
      setDarkMode,
      fontSize,
      setFontSize: setFontSizeState,
      scale,
      fs,
      hydrated,
      tokens: TOKENS,
      // Estilo de Text por papel (`text('body')`), já com a escala e a fonte da
      // plataforma aplicadas. Lança para papel desconhecido.
      text: (role) => textStyle(role, fs, FONT_FAMILY),
    };
  }, [darkMode, fontSize, hydrated, setDarkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
