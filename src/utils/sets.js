// Dois Sets com os mesmos elementos. Para manter o estado anterior quando uma
// releitura (ao focar a tela) devolve um Set novo com o mesmo conteúdo: sem
// isso a lista inteira re-renderiza a cada visita à aba.
export function sameSet(a, b) {
  if (a === b) return true;
  if (!a || !b || a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

// setState que só troca o Set quando o conteúdo mudou.
export const keepIfSame = (next) => (prev) => (sameSet(prev, next) ? prev : next);
