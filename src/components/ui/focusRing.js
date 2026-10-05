import { Platform } from 'react-native';

// Anel de foco dos campos de texto na web (Field e SearchField, que guardam o
// `focused` em estado com onFocus/onBlur). No nativo não existe foco por
// teclado neste sentido, então devolve null.
//
// Semântica de :focus-visible: o anel (`outline` de 2 na cor `tint`) só
// aparece quando o foco chegou pelo TECLADO (Tab, ou Enter num botão que leva
// a uma tela com autoFocus). Foco por toque ou clique não desenha anel, e aí o
// anel padrão do navegador também é desligado (`outlineStyle: 'none'`), porque
// um campo de texto clicado já mostra o cursor piscando. Sem isso a Busca
// abria com um anel grosso no campo recém-focado, avançando sobre a margem.
//
// Como se sabe a origem do foco: dois ouvintes em captura no documento
// registram a última modalidade (tecla sem modificador = teclado; pointerdown
// = toque ou mouse), e o `focusin` congela essa modalidade para o elemento que
// acabou de ganhar foco. Só um elemento tem foco por vez, então um campo com
// `focused` true é o dono dessa flag. Digitar no campo depois de clicar nele
// não acende o anel: a flag só muda no próximo `focusin`.
//
// O anel é desenhado POR DENTRO do campo (`outlineOffset` negativo igual à
// espessura), então nunca passa da margem da tela nem é cortado pelo
// `overflow: 'hidden'` do Group. O outline acompanha o borderRadius do input.
const RING = 2;

let keyboardModality = false;
let focusFromKeyboard = false;

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const capture = { capture: true, passive: true };
  document.addEventListener(
    'keydown',
    (e) => {
      if (!e.metaKey && !e.altKey && !e.ctrlKey) keyboardModality = true;
    },
    capture,
  );
  document.addEventListener('pointerdown', () => { keyboardModality = false; }, capture);
  document.addEventListener('focusin', () => { focusFromKeyboard = keyboardModality; }, capture);
}

export function webFocusRing(colors, focused) {
  if (Platform.OS !== 'web' || !focused) return null;
  return focusFromKeyboard
    ? { outlineWidth: RING, outlineColor: colors.tint, outlineStyle: 'solid', outlineOffset: -RING }
    : { outlineStyle: 'none' };
}
