// Índice dos artigos. Junta todas as categorias em um único array
// e aplica traduções em inglês quando disponíveis (de translations-en.js).
// Cada artigo tem references[] apontando para IDs em references.js.

import existenciaDeus from './existencia-deus';
import igrejaCatolica from './igreja-catolica';
import sagradaEscritura from './sagrada-escritura';
import moral from './moral';
import outrasReligioes from './outras-religioes';
import historiaIgreja from './historia-igreja';
import { ARTICLES_EN } from '../articles-en';

const rawArticles = [
  ...existenciaDeus,
  ...igrejaCatolica,
  ...sagradaEscritura,
  ...moral,
  ...outrasReligioes,
  ...historiaIgreja,
];

// Mescla os campos *En da tabela de traduções quando disponíveis.
export const articles = rawArticles.map((a) => {
  const tr = ARTICLES_EN[a.id];
  if (!tr) return a;
  return {
    ...a,
    titleEn: tr.titleEn,
    summaryEn: tr.summaryEn,
    bodyEn: tr.bodyEn,
  };
});
