import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Helper único de vibração (haptics) do app, em cima do expo-haptics 15.0.8.
// API conferida em node_modules/expo-haptics/build/Haptics.d.ts: impactAsync,
// notificationAsync, selectionAsync e performAndroidHapticsAsync (só Android).
//
// Regras:
// - Na web tudo é no-op, por decisão de design (o expo-haptics usaria
//   navigator.vibrate, e o site não deve vibrar).
// - No nativo sem o módulo (Expo Go antigo, por exemplo) as funções lançam
//   UnavailabilityError, então toda chamada termina em .catch(() => {}).
// - Nada aqui espera resposta: dispara e segue.
//
// Uso: haptics.selection() ao trocar de item, haptics.impact('medium') num
// toque com peso, haptics.success() / warning() / error() ao concluir algo.

const WEB = Platform.OS === 'web';
const ignore = () => {};

const IMPACT = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

// Tique curto de seleção (troca de item, passo de um seletor). No Android usa
// o motor de haptics do sistema (Segment_Tick, sem permissão VIBRATE); no iOS
// vai para UISelectionFeedbackGenerator.
export function selection() {
  if (WEB) return;
  if (Platform.OS === 'android' && typeof Haptics.performAndroidHapticsAsync === 'function') {
    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick).catch(ignore);
    return;
  }
  Haptics.selectionAsync().catch(ignore);
}

// Impacto de toque. style: 'light' (padrão), 'medium' ou 'heavy'.
export function impact(style = 'light') {
  if (WEB) return;
  Haptics.impactAsync(IMPACT[style] ?? IMPACT.light).catch(ignore);
}

// Resultado de uma ação: concluiu, pede atenção ou falhou.
export function success() {
  if (WEB) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore);
}

export function warning() {
  if (WEB) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(ignore);
}

export function error() {
  if (WEB) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore);
}

export const haptics = { selection, impact, success, warning, error };
export default haptics;
