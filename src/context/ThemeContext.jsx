import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { space, radius, icon, thumb, motion, shadow, textStyle, FONT_FAMILY_BY_PLATFORM } from '../theme/tokens';
import { THEME_MODES, resolveThemeMode, isDarkFor } from '../utils/themeMode';

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
const TOKENS = { space, radius, icon, thumb, motion, shadow, fontFamily: FONT_FAMILY };

// Modo de tema escolhido: 'system' | 'light' | 'dark' (src/utils/themeMode.js).
// A chave antiga 'settings:darkMode' é IGNORADA de propósito: o código anterior
// a gravava em toda hidratação, não só na escolha, então todo aparelho já tem
// 'false' guardado sem que ninguém tenha escolhido nada, e ler essa chave
// impediria o app de seguir o sistema. Como o app está em pré-lançamento, não
// há migração: quem tinha escolhido escolhe de novo em Ajustes.
const STORAGE_THEME_MODE = 'settings:theme';
const STORAGE_FONT = 'settings:fontSize';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Tema em três estados: `themeMode` é a escolha da pessoa (hidratada abaixo;
  // nasce em 'system', então o splash já sai no tema do aparelho, que app.json
  // deixa em userInterfaceStyle "automatic") e `systemScheme` é o esquema atual
  // do sistema. O tema efetivo combina os dois: 'system' segue o aparelho e
  // acompanha a troca em tempo real pelo listener logo abaixo.
  const [themeMode, setThemeModeState] = useState('system');
  const [systemScheme, setSystemScheme] = useState(() => Appearance.getColorScheme());
  const [fontSize, setFontSizeState] = useState('normal');
  const [hydrated, setHydrated] = useState(false);
  const darkMode = isDarkFor(themeMode, systemScheme);

  // Appearance.addChangeListener recebe ({ colorScheme }) e devolve uma
  // subscription com remove(), tanto no RN 0.81 (Libraries/Utilities/
  // Appearance.d.ts: NativeEventSubscription) quanto no react-native-web
  // (dist/exports/Appearance/index.js, sobre matchMedia prefers-color-scheme).
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Na web, a escolha feita na landing fica em localStorage (appg_theme,
        // só 'light' ou 'dark'), compartilhada com o app (mesmo domínio). Ela
        // tem prioridade sobre a salva pelo app; sem nenhuma, segue o sistema.
        let landing = null;
        if (Platform.OS === 'web') {
          try { landing = window.localStorage.getItem('appg_theme'); } catch {}
        }
        const [saved, fs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_THEME_MODE),
          AsyncStorage.getItem(STORAGE_FONT),
        ]);
        setThemeModeState(resolveThemeMode({ landing, saved }));
        if (fs && FONT_SCALES[fs]) setFontSizeState(fs);
      } catch {
        // sem persistência, segue com padrão
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Grava o modo só quando a pessoa escolhe (chips em Ajustes ou o toggle no
  // topo do login); a hidratação acima nunca grava, senão o app deixaria de
  // seguir o sistema sem ninguém pedir. Na web, mantém a chave compartilhada
  // com a landing (appg_theme) em sincronia: 'light'/'dark' quando explícito, e
  // sem chave quando é 'system' (a landing só conhece os dois explícitos).
  const setThemeMode = useCallback((mode) => {
    const next = THEME_MODES.includes(mode) ? mode : 'system';
    setThemeModeState(next);
    AsyncStorage.setItem(STORAGE_THEME_MODE, next).catch(() => {});
    if (Platform.OS === 'web') {
      try {
        if (next === 'system') window.localStorage.removeItem('appg_theme');
        else window.localStorage.setItem('appg_theme', next);
      } catch {}
    }
  }, []);

  // Atalho booleano para quem só alterna claro/escuro (AuthTopToggles e
  // chamadores antigos): vira sempre uma escolha explícita.
  const setDarkMode = useCallback((next) => setThemeMode(next ? 'dark' : 'light'), [setThemeMode]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_FONT, fontSize).catch(() => {});
  }, [fontSize, hydrated]);

  // Sincroniza a navigation bar do Android (fundo + ícones) com o tema, para a
  // barra do sistema não destoar do app no build nativo. O fundo acompanha a cor
  // da tab bar (card); os ícones invertem conforme claro/escuro.
  // Com edge-to-edge (Expo Go 54 e SDK 55) setBackgroundColorAsync vira no-op
  // com aviso no console; a chamada sai quando `edgeToEdgeEnabled` for ligado
  // no app.json (onda futura, depois de todas as telas migrarem). Até lá ela
  // ainda vale no build EAS.
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
      themeMode,
      setThemeMode,
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
  }, [darkMode, themeMode, fontSize, hydrated, setDarkMode, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
