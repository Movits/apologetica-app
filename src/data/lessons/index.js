// Lições da Jornada: um objeto por artigo (chave = id do artigo), com a
// pergunta de previsão (hook), os três pontos do resumo (keyPoints), a
// resposta de bolso (oneLiner) e o teste rápido (check, três perguntas).
// Bilíngue PT/EN pelo padrão campo/campoEn (src/utils/i18nData.js: pick).
// Um arquivo por categoria, como src/data/articles/. Integridade testada em
// tests/lessons.test.mjs (toda lição tem artigo, todo artigo tem lição).

import existenciaDeus from './existencia-deus';
import igrejaCatolica from './igreja-catolica';
import sagradaEscritura from './sagrada-escritura';
import moral from './moral';
import outrasReligioes from './outras-religioes';
import historiaIgreja from './historia-igreja';

export const LESSONS = {
  ...existenciaDeus,
  ...igrejaCatolica,
  ...sagradaEscritura,
  ...moral,
  ...outrasReligioes,
  ...historiaIgreja,
};

export const lessonFor = (articleId) => LESSONS[articleId] || null;
