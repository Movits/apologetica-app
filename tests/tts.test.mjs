import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkText, stripMarkdownForSpeech } from '../src/utils/tts.js';

// Regra do fatiamento (ver src/utils/tts.js): os pedaços são fatias exatas do
// texto, então `chunks.join('')` reconstitui a entrada sem perder nem duplicar
// caractere. O corte prefere o fim de frase (. ! ? ou quebra de linha), depois
// um espaço, e só por último corta no tamanho. Nenhum pedaço fica em branco.

const MAX = 4000;
const SENTENCE = 'No princípio Deus criou o céu e a terra, e viu que era bom. ';

function assertChunks(chunks, text, max = MAX) {
  assert.equal(chunks.join(''), text, 'join deve reconstituir o texto');
  for (const c of chunks) {
    assert.ok(c.length <= max, `pedaço com ${c.length} > ${max}`);
    assert.ok(c.trim().length > 0, 'pedaço em branco');
  }
}

test('texto curto vira um único pedaço idêntico', () => {
  assert.deepEqual(chunkText('Olá, mundo.'), ['Olá, mundo.']);
  assert.deepEqual(chunkText('Sem pontuação nenhuma'), ['Sem pontuação nenhuma']);
  assert.deepEqual(chunkText('a'.repeat(MAX)), ['a'.repeat(MAX)]);
});

test('texto vazio ou só espaço não gera pedaço', () => {
  assert.deepEqual(chunkText(''), []);
  assert.deepEqual(chunkText(null), []);
  assert.deepEqual(chunkText(undefined), []);
  assert.deepEqual(chunkText('   \n  '), []);
});

test('9.000 caracteres com frases: pedaços de até 4000 cortados no fim de frase', () => {
  const text = SENTENCE.repeat(Math.ceil(9000 / SENTENCE.length)).slice(0, 9000);
  const chunks = chunkText(text);
  assertChunks(chunks, text);
  assert.ok(chunks.length >= 3, `esperava ao menos 3 pedaços, veio ${chunks.length}`);
  // Todo pedaço, menos o último, termina numa frase completa.
  for (const c of chunks.slice(0, -1)) {
    assert.match(c.trimEnd(), /[.!?]$/, `pedaço não termina em frase: "...${c.slice(-30)}"`);
  }
});

test('capítulo no formato da Bíblia ("1. texto 2. texto") é cortado no fim de versículo', () => {
  const verses = [];
  for (let n = 1; n <= 120; n++) verses.push(`${n}. ${SENTENCE.trim()}`);
  const text = `Gênesis 1. ${verses.join(' ')}`;
  const chunks = chunkText(text);
  assertChunks(chunks, text);
  assert.ok(chunks.length >= 2);
  for (const c of chunks.slice(0, -1)) assert.match(c.trimEnd(), /[.!?]$/);
});

test('sem pontuação e sem espaço: corta pelo tamanho', () => {
  const text = 'a'.repeat(9000);
  const chunks = chunkText(text);
  assertChunks(chunks, text);
  assert.deepEqual(chunks.map((c) => c.length), [4000, 4000, 1000]);
});

test('sem pontuação mas com espaços: corta no último espaço', () => {
  const text = 'palavra '.repeat(1200); // 9600 caracteres, nenhum ponto
  const chunks = chunkText(text);
  assertChunks(chunks, text);
  for (const c of chunks.slice(0, -1)) assert.match(c, / $/, 'corte deveria cair num espaço');
});

test('quebra de linha conta como fim de frase', () => {
  assert.deepEqual(chunkText('linha um\nlinha dois', 10), ['linha um\n', 'linha dois']);
});

test('max menor mostra a regra: frase inteira quando cabe, senão espaço, senão tamanho', () => {
  assert.deepEqual(chunkText('Um. Dois. Três.', 6), ['Um. ', 'Dois. ', 'Três.']);
  assert.deepEqual(chunkText('Um dois três', 8), ['Um dois ', 'três']);
  assert.deepEqual(chunkText('abcdefghij', 4), ['abcd', 'efgh', 'ij']);
});

test('espaço no início do texto não vira pedaço em branco', () => {
  const text = '   ' + 'x'.repeat(5000);
  const chunks = chunkText(text);
  assertChunks(chunks, text);
});

// ---------------------------------------------------------------------------
// stripMarkdownForSpeech (Fase 5): a limpeza que ArticleDetailScreen fazia
// antes de narrar. O regex é o da tela, sem mudança: o que a tela não tirava
// (marcador de lista, link [x](y), que nenhum artigo usa) continua passando.
// ---------------------------------------------------------------------------

test('stripMarkdownForSpeech tira títulos, ênfase, código e [[termo]]', () => {
  assert.equal(stripMarkdownForSpeech('## Título\n### Menor\ntexto'), 'Título\nMenor\ntexto');
  assert.equal(stripMarkdownForSpeech('**negrito** e __forte__'), 'negrito e forte');
  assert.equal(stripMarkdownForSpeech('*itálico* e _leve_'), 'itálico e leve');
  assert.equal(stripMarkdownForSpeech('use `código` aqui'), 'use código aqui');
  assert.equal(stripMarkdownForSpeech('a [[Theotokos]] é Maria'), 'a Theotokos é Maria');
  assert.equal(stripMarkdownForSpeech('# A **fé** e a *razão*'), 'A fé e a razão');
});

test('stripMarkdownForSpeech remove caracteres de largura zero', () => {
  assert.equal(stripMarkdownForSpeech('a\u200Bb\u200Cc\u200Dd\uFEFFe'), 'abcde');
});

test('stripMarkdownForSpeech preserva listas e linhas em branco', () => {
  const md = 'Intro.\n\n- primeiro **item**\n- segundo\n\nFim.';
  assert.equal(stripMarkdownForSpeech(md), 'Intro.\n\n- primeiro item\n- segundo\n\nFim.');
});

test('stripMarkdownForSpeech tolera vazio e nulo', () => {
  assert.equal(stripMarkdownForSpeech(''), '');
  assert.equal(stripMarkdownForSpeech(null), '');
  assert.equal(stripMarkdownForSpeech(undefined), '');
  assert.equal(stripMarkdownForSpeech('sem marcação'), 'sem marcação');
});
