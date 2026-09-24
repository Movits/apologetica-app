import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Diz se o usuário pediu "reduzir movimento" no sistema, para as animações
// pularem direto ao estado final. Devolve false até a consulta inicial resolver.
//
// Funciona nas três plataformas:
// - Nativo: AccessibilityInfo.isReduceMotionEnabled() e o evento
//   'reduceMotionChanged' (node_modules/react-native/Libraries/Components/
//   AccessibilityInfo/AccessibilityInfo.d.ts:71 e :129). addEventListener
//   devolve uma subscription com .remove().
// - Web: o react-native-web implementa os dois em cima da media query
//   (prefers-reduced-motion: reduce), ver node_modules/react-native-web/dist/
//   exports/AccessibilityInfo/index.js:18-31 e :57-71. Sem matchMedia ele
//   devolve undefined em vez de subscription, daí o optional chaining abaixo.
//
// Uso:
//   const reduceMotion = useReduceMotion();
//   <Animated.View entering={reduceMotion ? undefined : FadeInDown} />
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => { if (vivo) setReduce(Boolean(on)); })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (on) => {
      if (vivo) setReduce(Boolean(on));
    });
    return () => {
      vivo = false;
      sub?.remove?.();
    };
  }, []);

  return reduce;
}
