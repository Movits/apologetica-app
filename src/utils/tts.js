// Fatiamento de texto para narração (Onda 8, S6). O TTS do Android limita cada
// chamada de Speech.speak a cerca de 4000 caracteres (BibleScreen.jsx falava
// versículo por versículo por isso; o artigo longo não tinha fila nenhuma).
// Este módulo é puro (sem expo-speech) para rodar nos testes do Node; quem
// fala os pedaços em sequência é speakLong.js.
//
// Regra do corte (nesta ordem, sempre respeitando `max`):
//   1. no último fim de frase que cabe (. ! ? ou quebra de linha, com o espaço
//      que vem depois);
//   2. senão, no último espaço em branco que cabe;
//   3. senão, no tamanho.
// Os pedaços são fatias exatas do texto: `chunks.join('') === texto`, sem perder
// nem duplicar caractere, e nenhum pedaço fica em branco. Única exceção: espaço
// em branco no fim do texto é descartado quando o último pedaço já está cheio
// (espaço não se fala). Texto vazio ou só de espaço devolve [].

const DEFAULT_MAX = 4000;

// Cada "frase": texto até a pontuação (inclusa) mais o espaço que a segue, ou o
// resto sem pontuação no fim. Concatenadas, as frases reconstituem o texto.
const SENTENCE_PIECE = /[^.!?\n]*[.!?\n]+\s*|[^.!?\n]+$/g;

// Índice do último espaço em branco entre os `max` primeiros caracteres
// (ignorando a posição 0, que não daria progresso), ou -1.
function lastSpaceWithin(s, max) {
  for (let i = Math.min(max, s.length) - 1; i > 0; i--) {
    if (/\s/.test(s[i])) return i;
  }
  return -1;
}

export function chunkText(text, max = DEFAULT_MAX) {
  const src = String(text ?? '');
  const limit = Math.max(1, Math.floor(Number(max) || 0));
  if (!src.trim()) return [];
  if (src.length <= limit) return [src];

  const pieces = src.match(SENTENCE_PIECE) || [src];
  const chunks = [];
  let cur = '';
  for (const piece of pieces) {
    if (cur.length + piece.length <= limit) {
      cur += piece;
      continue;
    }
    // A frase não cabe no pedaço atual. Fecha o pedaço se ele tem conteúdo;
    // se é só espaço (sobra de um corte anterior), vira prefixo da frase para
    // nunca sair um pedaço em branco.
    let rest;
    if (cur.trim()) {
      chunks.push(cur);
      rest = piece;
    } else {
      rest = cur + piece;
    }
    cur = '';
    // Frase maior que o limite: corta no último espaço que cabe, senão no
    // tamanho (e também no tamanho se a parte antes do espaço for só espaço).
    while (rest.length > limit) {
      let cut = lastSpaceWithin(rest, limit) + 1;
      if (cut <= 0 || !rest.slice(0, cut).trim()) cut = limit;
      chunks.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    cur = rest;
  }
  if (cur.trim()) {
    chunks.push(cur);
  } else if (cur && chunks.length && chunks[chunks.length - 1].length + cur.length <= limit) {
    // Sobra só de espaço no fim do texto: cola no último pedaço se couber.
    chunks[chunks.length - 1] += cur;
  }
  return chunks;
}
