import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { type } from '../theme/tokens';
import ChromeBackdrop from './ChromeBackdrop';

// Opções de header dos stacks internos (Início, Artigos, Ferramentas, Ajustes)
// num lugar só, no lugar das seis cópias de screenOptions em App.js.
//
// Por que duas variantes:
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
// typescript/src/types.d.ts (headerBackTitleVisible :109, headerShadowVisible
// :197, headerTransparent :203, headerTintColor :216, headerBackground :222,
// headerTitleAlign :257, headerTitleStyle :265 (só fontFamily, fontSize,
// fontWeight e color), contentStyle :362, animation :430) e em
// node_modules/@react-navigation/stack/lib/typescript/src/types.d.ts
// (headerBackTitleVisible :132, headerMode :198, cardStyle :232,
// animationEnabled :256; as demais chaves de header vêm de
// @react-navigation/elements HeaderOptions, via StackHeaderOptions :92).

const headerBackground = () => <ChromeBackdrop edge="bottom" />;

// Parte comum às duas variantes: header transparente sobre o backdrop
// translúcido, título inline no papel headline (17/600), tint do tema.
function headerOptions(colors) {
  return {
    headerTransparent: true,
    headerBackground,
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

// Opções do native-stack. `tokens` fica na assinatura para a cor e o espaço
// de futuras opções sem mudar os chamadores.
export function stackScreenOptions(colors, _tokens) {
  return {
    ...headerOptions(colors),
    animation: 'ios_from_right',
    contentStyle: { backgroundColor: colors.bg },
  };
}

// Opções do stack JS (só web).
export function webStackScreenOptions(colors, _tokens) {
  return {
    ...TransitionPresets.SlideFromRightIOS,
    animationEnabled: true,
    headerMode: 'screen',
    ...headerOptions(colors),
    cardStyle: { backgroundColor: colors.bg },
  };
}

// Escolhe as opções certas para o navigator devolvido por createAppStack().
export function stackScreenOptionsForPlatform(colors, tokens) {
  return Platform.OS === 'web'
    ? webStackScreenOptions(colors, tokens)
    : stackScreenOptions(colors, tokens);
}

// Cria o navigator de stack da plataforma: JS na web (anima), nativo no resto.
// Os dois devolvem { Navigator, Screen, Group } com a mesma API de registro.
export function createAppStack() {
  return Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator();
}
