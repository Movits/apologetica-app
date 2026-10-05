// Leitura de dados bilíngues (Onda 8, S4). Artigos, referências, diálogos,
// santos e versículos guardam o PT no campo base e o EN no campo com sufixo
// "En" (title/titleEn, summary/summaryEn...). O app repetia
// `isEn ? (a.titleEn || a.title) : a.title` em dezenas de lugares; este módulo
// concentra a regra, incluindo o fallback para PT quando a tradução falta.
// Módulo puro (sem react-native).

// Campo `field` do item no idioma pedido, caindo para o PT se o EN não existe
// ou está vazio. Item nulo ou campo inexistente devolvem undefined.
// `fallback` (opcional) recebe `(valorPt, isEn)` e é aplicado quando não há
// tradução curada: serve para os tradutores heurísticos de references.js
// (`translateAuthor`, `translateYear`...), que devolvem o próprio valor
// quando `isEn` é falso.
export function pick(item, field, isEn = false, fallback) {
  if (!item) return undefined;
  const en = item[`${field}En`];
  if (isEn && en) return en;
  return fallback ? fallback(item[field], isEn) : item[field];
}

// Vários campos de uma vez: pickAll(a, ['title', 'summary'], isEn)
// devolve { title, summary } já no idioma certo.
export function pickAll(item, fields, isEn = false) {
  const out = {};
  for (const field of fields) out[field] = pick(item, field, isEn);
  return out;
}

// Par de valores soltos (não um item com campo/campoEn): o EN quando pedido e
// existente, senão o PT. É o `isEn ? en : pt` das telas, com o fallback.
export function pickPair(pt, en, isEn = false) {
  return isEn && en ? en : pt;
}

// Tradução de `key` por `t`, ou `fallback` quando a chave não existe (o `t`
// do app devolve a própria chave nesse caso), está vazia ou não há `t`.
export function tOr(t, key, fallback) {
  const label = typeof t === 'function' ? t(key) : '';
  return label && label !== key ? label : fallback;
}

// Rótulo de categoria de artigo. As chaves em strings.js são o próprio id em
// PT ("category.Existência de Deus", "category.popular"); sem chave, o rótulo
// cai no id.
export function categoryLabel(categoryId, t) {
  return tOr(t, `category.${categoryId}`, categoryId);
}
