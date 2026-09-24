import { FadeInDown } from 'react-native-reanimated';

// Entrada em cascata dos blocos de uma tela (Início, Ferramentas, Onboarding):
// FadeInDown em `motion.layout` ms, com atraso de `motion.stagger` por índice,
// travado no 8º item para uma lista longa não demorar segundos a aparecer.
// Uso: <Animated.View entering={enterStagger(i, tokens)}>. Reduce motion é
// respeitado pelo reanimated (ReduceMotion.System é o default).
export function enterStagger(i, tokens) {
  return FadeInDown.duration(tokens.motion.layout).delay(Math.min(i, 8) * tokens.motion.stagger);
}
