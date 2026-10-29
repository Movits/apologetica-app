import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BIBLE_BOOKS } from '../src/data/bible.js';
import { AVEMARIA } from '../src/data/bibleAveMaria.js';
import { DRA } from '../src/data/bibleDouayRheims.js';

// As duas Bíblias precisam usar os ids de bible.js: um livro com chave
// diferente some sem erro (o inglês cai no português). Jó e Jonas estavam na
// Douay-Rheims como 'jó' e 'jn' em vez de 'jo_at' e 'jn_at'.
// Na Vulgata, que a Douay-Rheims segue, Joel tem 3 capítulos (o 3 hebraico
// é o 2,28-32) e Malaquias tem 4 (o 4 é o 3,19-24 hebraico).
const VULGATA = { jl: 3, ml: 4 };

test('as duas Bíblias têm os 73 livros pelos ids do app, com o número de capítulos certo', () => {
  const ids = BIBLE_BOOKS.map((b) => b.id);
  for (const [nome, biblia] of [['Ave Maria', AVEMARIA], ['Douay-Rheims', DRA]]) {
    assert.deepEqual(ids.filter((id) => !biblia[id]), [], `${nome}: livros sem chave`);
    assert.deepEqual(Object.keys(biblia).filter((k) => !ids.includes(k)), [], `${nome}: chaves fora do app`);
    for (const b of BIBLE_BOOKS) {
      const esperado = nome === 'Douay-Rheims' ? (VULGATA[b.id] ?? b.totalChapters) : b.totalChapters;
      assert.equal(biblia[b.id].length, esperado, `${nome} ${b.id}: capítulos`);
    }
  }
});

// '' é bloco da edição impressa: só a Ave Maria tem, e nunca no versículo 1
// (o bloco precisa de um texto antes). Um '' na Douay-Rheims viraria em silêncio
// um bloco "N-N+1" (era o caso de 1 Reis 17,19 em branco na fonte).
test('versículo vazio só como continuação de bloco da Ave Maria', () => {
  const vaziosDR = [];
  const vazioNo1 = [];
  for (const [nome, biblia] of [['Ave Maria', AVEMARIA], ['Douay-Rheims', DRA]]) {
    for (const [id, chs] of Object.entries(biblia)) {
      chs.forEach((vs, ci) => {
        if (vs[0] === '') vazioNo1.push(`${nome} ${id} ${ci + 1}`);
        if (nome === 'Douay-Rheims') vs.forEach((v, vi) => { if (v === '') vaziosDR.push(`${id} ${ci + 1},${vi + 1}`); });
      });
    }
  }
  assert.deepEqual(vazioNo1, []);
  assert.deepEqual(vaziosDR, []);
});
