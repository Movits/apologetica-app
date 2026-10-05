// Progresso de leitura a partir de um evento de scroll (Fase 5). Módulo puro
// (sem react-native), coberto por tests/scrollProgress.test.mjs.
//
// É a mesma conta que ArticleDetailScreen (barra de progresso do artigo) e
// BibleScreen (capítulo lido) faziam cada uma do seu jeito: conteúdo que cabe
// na tela conta como lido (1), senão a fração do que já rolou, cortada em
// 0..1 por causa do bounce do iOS.
//
// Atenção: no react-native-web um onScroll atrasado pode chegar depois que a
// lista saiu de cena, com tudo zerado. Zero cabe em zero e vira 1 (capítulo
// marcado como lido sozinho), então quem chama continua guardando
// `if (!layoutMeasurement.height || !contentSize.height) return;` antes.

// Folga de layout (arredondamento de altura) para "cabe na tela".
const DEFAULT_SLACK = 4;
// Abaixo disso a barra e o "continue lendo" não percebem a diferença.
const DEFAULT_STEP = 0.005;

export function scrollFraction({ contentOffset, contentSize, layoutMeasurement }, slack = DEFAULT_SLACK) {
  const fits = contentSize.height <= layoutMeasurement.height + slack;
  if (fits) return 1;
  const max = Math.max(1, contentSize.height - layoutMeasurement.height);
  return Math.max(0, Math.min(1, contentOffset.y / max));
}

// Devolve `next` só quando andou de verdade (ao menos `step`) ou cravou 0 ou
// 1; senão mantém `prev`. Evita re-renderizar a tela a cada evento de scroll.
export function stepped(prev, next, step = DEFAULT_STEP) {
  if (Math.abs(next - prev) >= step || next === 0 || next === 1) return next;
  return prev;
}
