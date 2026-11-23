// Índice dos artigos. Junta todas as categorias em um único array
// (as traduções em inglês chegam sob demanda: src/data/english.js).
// Cada artigo tem references[] apontando para IDs em references.js.

import existenciaDeus from './existencia-deus';
import igrejaCatolica from './igreja-catolica';
import sagradaEscritura from './sagrada-escritura';
import moral from './moral';
import outrasReligioes from './outras-religioes';
import historiaIgreja from './historia-igreja';

const rawArticles = [
  ...existenciaDeus,
  ...igrejaCatolica,
  ...sagradaEscritura,
  ...moral,
  ...outrasReligioes,
  ...historiaIgreja,
];

// Cópias próprias: os campos *En (titleEn, summaryEn, bodyEn) entram nelas
// quando o inglês é carregado (src/data/english.js), sem ir no script
// principal da web.
export const articles = rawArticles.map((a) => ({ ...a }));
