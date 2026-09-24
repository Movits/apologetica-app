import { Platform } from 'react-native';

// Anel de foco dos campos de texto na web: `outline` de 2 na cor `tint` no
// próprio input quando focado, substituindo o anel do navegador sem nunca
// escondê-lo (`outlineStyle: 'none'` é proibido). No nativo não existe foco
// por teclado neste sentido, então devolve null. Usado por Field e
// SearchField, que guardam o `focused` em estado (onFocus/onBlur).
export function webFocusRing(colors, focused) {
  return Platform.OS === 'web' && focused
    ? { outlineWidth: 2, outlineColor: colors.tint, outlineStyle: 'solid', outlineOffset: 2 }
    : null;
}
