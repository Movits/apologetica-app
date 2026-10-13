import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { space, radius, icon, thumb, motion, shadow, textStyle, fontFamilyFor } from '../theme/tokens';
import { THEME_MODES, resolveThemeMode, isDarkFor } from '../utils/themeMode';
import { LIGHT, DARK } from '../theme/palette';

// As paletas (src/theme/palette.js) são reexportadas para quem vive fora do
// provider (o ErrorBoundary em App.js embrulha o ThemeProvider). Dentro do
// app, use useTheme().colors, que segue o tema ativo.
export { LIGHT, DARK };

// Sala escura do visualizador de obras (src/components/art/): igual nos dois
// temas, como uma galeria com a luz apagada, na família do Museu Virtual
// (preto quente, marfim e dourado). A obra é a única coisa iluminada.
export const GALLERY = {
  bg: '#0b0906',
  panel: 'rgba(20,16,10,0.94)',
  chip: 'rgba(12,10,6,0.62)',
  bar: 'rgba(11,9,6,0.55)',
  text: '#ece4d4',
  textSubtle: '#b8ac92',
  accent: '#d4b86a',
  hairline: 'rgba(212,184,106,0.26)',
  plate: 'rgba(212,184,106,0.06)',
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
const FONT_FAMILY = fontFamilyFor(Platform.OS);
const TOKENS = { space, radius, icon, thumb, motion, shadow, fontFamily: FONT_FAMILY };

// Modo de tema escolhido: 'system' | 'light' | 'dark' (src/utils/themeMode.js).
// A chave antiga 'settings:darkMode' é IGNORADA de propósito: o código anterior
// a gravava em toda hidratação, não só na escolha, então todo aparelho já tem
// 'false' guardado sem que ninguém tenha escolhido nada, e ler essa chave
// impediria o app de seguir o sistema. Como o app está em pré-lançamento, não
// há migração: quem tinha escolhido escolhe de novo em Ajustes.
const STORAGE_THEME_MODE = 'settings:theme';
const STORAGE_FONT = 'settings:fontSize';
// Chave das identidades visuais em avaliação (outubro de 2026), que saíram do
// app quando a Clássica ficou como a única. Só é apagada na hidratação, para
// não deixar lixo em quem chegou a experimentar outra.
const STORAGE_LEGACY_IDENTITY = 'settings:identity';

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
        // Fire-and-forget: apagar uma chave que não existe é no-op.
        AsyncStorage.removeItem(STORAGE_LEGACY_IDENTITY).catch(() => {});
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

  // Sincroniza os ícones da navigation bar do Android com o tema. Desde o SDK
  // 55 o edge-to-edge é obrigatório: a barra é transparente sobre o app (não
  // existe mais cor de fundo para pintar) e a API é `NavigationBar.setStyle`
  // (node_modules/expo-navigation-bar/build/NavigationBar.android.js), síncrona.
  // `style` é a cor dos botões: 'light' sobre o tema escuro, 'dark' sobre o claro.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    try {
      NavigationBar.setStyle(darkMode ? 'light' : 'dark');
    } catch {}
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
    // Cache por papel: `text('body')` devolve a MESMA referência entre renders
    // (um `useMemo` na tela que dependa dela não recalcula à toa). O cache
    // renasce com este useMemo, ou seja, quando a escala de fonte muda.
    const cache = {};
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
      text: (role) => cache[role] ?? (cache[role] = textStyle(role, fs, FONT_FAMILY)),
    };
  }, [darkMode, themeMode, fontSize, hydrated, setDarkMode, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
