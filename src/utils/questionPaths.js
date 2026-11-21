// Marcações dos roteiros de perguntas (tela QuestionPath). Puro: as marcações
// são um Set de índices de passo, vivem só no estado da tela e nada é gravado.

// Novo Set com o passo `i` marcado ou desmarcado (não muta o anterior, para o
// setState do React enxergar a mudança).
export function toggleStep(checked, i) {
  const next = new Set(checked);
  if (next.has(i)) next.delete(i);
  else next.add(i);
  return next;
}

// Quantos passos do roteiro estão marcados. Índices fora do roteiro (de outro
// roteiro, ou de uma versão com menos passos) não contam.
export function progressOf(path, checked) {
  const total = path.steps.length;
  let done = 0;
  for (const i of checked) if (Number.isInteger(i) && i >= 0 && i < total) done += 1;
  return { done, total, ratio: total ? done / total : 0 };
}
