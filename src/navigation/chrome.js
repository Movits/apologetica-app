import { useMemo } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { type } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import ChromeBackdrop from './ChromeBackdrop';

// Opções de header dos stacks internos (Início, Artigos, Ferramentas, Ajustes)
// num lugar só, no lugar das seis cópias de screenOptions que App.js tinha. O
// Tab.Navigator não tem header (as cinco abas desligam com headerShown: false
// e a Bíblia tem o large title próprio).
//
// Decisão da Onda 3: o header fica OPACO por padrão, na cor do fundo
// (colors.bg), sem sombra e sem hairline. Um header transparente exige que
// cada tela compense a altura dele com useHeaderHeight(), e dezenas de telas
// ainda não fazem isso: com o header opaco elas continuam certas sem mexer em
// nada. A variante translúcida (blur sobre o conteúdo) é opt-in por tela, via
// translucentHeaderOptions(), para quem já compensa a altura (Artigo na Onda 5,
// RefDetail depois). As telas raiz das abas migram para LargeTitleScreen nas
// Ondas 4 a 9 e aí desligam o header do stack (headerShown: false).
//
// Por que duas variantes de stack:
// - Nativo: @react-navigation/native-stack 6.11 (react-native-screens). O
//   header é nativo e `animation: 'ios_from_right'` anima de verdade no
//   Android (no iOS resolve para o padrão do sistema).
// - Web: o NativeStackView web não anima, só alterna `display` entre 'flex'
//   e 'none' (node_modules/@react-navigation/native-stack/lib/module/views/
//   NativeStackView.js:115). Para o push deslizar, a web usa o stack JS
//   (@react-navigation/stack 6.4) com TransitionPresets.SlideFromRightIOS,
//   `headerMode: 'screen'` (o header viaja com a tela) e `animationEnabled:
//   true`, porque o padrão do stack JS desliga a animação na web
//   (node_modules/@react-navigation/stack/lib/module/views/Stack/
//   CardStack.js:119). O stack JS usa `cardStyle` no lugar de `contentStyle`
//   e não tem `animation`.
//
// Chaves conferidas em node_modules/@react-navigation/native-stack/lib/
// typescript/src/types.d.ts (headerBackTitleVisible :109, headerStyle
// :191, headerShadowVisible :197, headerTransparent :203, headerTintColor
// :216, headerBackground :222, headerTitleAlign :257, headerTitleStyle :265 (só
// fontFamily, fontSize, fontWeight e color), contentStyle :362, animation
// :430) e em node_modules/@react-navigation/stack/lib/typescript/src/
// types.d.ts (headerBackTitleVisible :132, headerMode :198, cardStyle :232,
// animationEnabled :256; as demais chaves de header vêm de
// @react-navigation/elements HeaderOptions, via StackHeaderOptions :92). O
// header do Tab.Navigator é o mesmo do elements: BottomTabNavigationOptions =
// HeaderOptions & {...} (node_modules/@react-navigation/bottom-tabs/lib/
// typescript/src/types.d.ts:41), então aceita as mesmas chaves.

// Parte comum a tudo: header opaco na cor do fundo, sem sombra, título inline
// no papel headline (17/600) na cor do texto, ícones e botão voltar no tint.
function headerOptions(colors) {
  return {
    headerStyle: { backgroundColor: colors.bg },
    headerShadowVisible: false,
    headerTintColor: colors.tint,
    headerTitleStyle: {
      fontSize: type.headline.size,
      fontWeight: type.headline.weight,
      color: colors.text,
    },
    headerBackTitleVisible: false,
    headerTitleAlign: 'center',
  };
}

// Variante translúcida, opt-in por tela nas `options` do Screen (ou em
// navigation.setOptions): header transparente sobre o ChromeBackdrop. A tela
// precisa compensar a altura com useHeaderHeight() no paddingTop do conteúdo.
// `headerStyle: undefined` desfaz o fundo opaco herdado do screenOptions.
export function translucentHeaderOptions() {
  return {
    headerTransparent: true,
    headerBackground: () => <ChromeBackdrop edge="bottom" />,
    headerStyle: undefined,
  };
}

// Título alinhado à esquerda (Artigo, que põe três ações à direita). Na web o
// header do @react-navigation/elements centra o título com dois contêineres
// laterais de `flexGrow: 1` (node_modules/@react-navigation/elements/src/
// Header/Header.tsx); com três ações de 44 ele invadiria a direita. Aqui o
// título encolhe (flexShrink) e o contêiner da direita fica com a largura do
// conteúdo. No nativo o header é do sistema e cuida disso sozinho; as chaves
// extras são ignoradas.
export function leftTitleHeaderOptions() {
  return {
    headerTitleAlign: 'left',
    ...(Platform.OS === 'web'
      ? {
          headerTitleContainerStyle: { flexGrow: 1, flexShrink: 1, flexBasis: 0, maxWidth: '100%' },
          headerRightContainerStyle: { flexGrow: 0, flexBasis: 'auto' },
        }
      : {}),
  };
}

// Fundo e recuo inferior do conteúdo de cada tela do stack. A tab bar nova é
// absoluta e translúcida (src/navigation/TabBar.jsx), então cada stack de aba
// passa `paddingBottom: useBottomTabBarHeight()` para o conteúdo não terminar
// escondido atrás dela. As telas migradas para LargeTitleScreen zeram isso nas
// próprias `options`, porque já compensam a altura por dentro.
function contentStyle(colors, { paddingBottom = 0 } = {}) {
  return { backgroundColor: colors.bg, paddingBottom };
}

// Opções do native-stack.
function stackScreenOptions(colors, extra) {
  return {
    ...headerOptions(colors),
    animation: 'ios_from_right',
    contentStyle: contentStyle(colors, extra),
  };
}

// Opções do stack JS (só web).
//
// `flex: 1` no cardStyle é obrigatório: na web o Card envolve a tela num
// CardSheet que, quando o stack preenche o body, troca `flex: 1` por
// `minHeight: '100%'` para o documento rolar (node_modules/@react-navigation/
// stack/lib/module/views/Stack/CardSheet.js:32-41). O template web do Expo
// trava o body (overflow hidden) e o react-native-screens envolve cada aba em
// absoluteFill + overflow hidden, então a folha só crescia até o conteúdo e a
// ScrollView de dentro nunca rolava (medido: Ajustes com 1760 px num viewport
// de 844). O cardStyle vem depois do estilo da folha, então `flex: 1` limita a
// altura ao contêiner e a rolagem volta a ser da ScrollView de cada tela.
function webStackScreenOptions(colors, extra) {
  return {
    ...TransitionPresets.SlideFromRightIOS,
    animationEnabled: true,
    headerMode: 'screen',
    ...headerOptions(colors),
    cardStyle: { flex: 1, ...contentStyle(colors, extra) },
  };
}

// Para telas que já compensam a tab bar por dentro (LargeTitleScreen ou
// contentContainerStyle próprio): zera o paddingBottom herdado do stack e
// mantém o fundo. Use em `options` do Screen ou em navigation.setOptions().
export function fullBleedContentOptions(colors) {
  return Platform.OS === 'web'
    ? { cardStyle: { flex: 1, backgroundColor: colors.bg, paddingBottom: 0 } }
    : { contentStyle: { backgroundColor: colors.bg, paddingBottom: 0 } };
}

// Raiz de aba desenhada com LargeTitleScreen: sem o header do stack e sem o
// paddingBottom herdado (a tela compensa a tab bar por dentro). Vai nas
// `options` do Screen raiz em App.js.
export function largeTitleRootOptions(colors) {
  return { headerShown: false, ...fullBleedContentOptions(colors) };
}

// Escolhe as opções certas para o navigator devolvido por createAppStack().
// `extra` = { paddingBottom } vai para contentStyle (nativo) ou cardStyle (web).
export function stackScreenOptionsForPlatform(colors, extra) {
  return Platform.OS === 'web'
    ? webStackScreenOptions(colors, extra)
    : stackScreenOptions(colors, extra);
}

// screenOptions dos quatro stacks de aba (Início, Artigos, Ferramentas,
// Ajustes): as opções da plataforma com o recuo da tab bar. Só vale dentro de
// uma tela do Tab.Navigator (useBottomTabBarHeight lança fora dele). O objeto
// é memoizado para o navigator não reprocessar as opções a cada render.
export function useTabStackScreenOptions() {
  const { colors } = useTheme();
  const paddingBottom = useBottomTabBarHeight();
  return useMemo(() => stackScreenOptionsForPlatform(colors, { paddingBottom }), [colors, paddingBottom]);
}

// Cria o navigator de stack da plataforma: JS na web (anima), nativo no resto.
// Os dois devolvem { Navigator, Screen, Group } com a mesma API de registro.
// O stack JS depende do react-native-gesture-handler na raiz: App.js importa
// 'react-native-gesture-handler' na primeira linha e envolve tudo num
// GestureHandlerRootView.
export function createAppStack() {
  return Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator();
}
