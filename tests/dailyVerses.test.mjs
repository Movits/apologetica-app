import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_VERSES } from '../src/data/dailyVerses.js';
import { AVEMARIA } from '../src/data/bibleAveMaria.js';
import { DRA } from '../src/data/bibleDouayRheims.js';
import { verseText } from '../src/services/bibleApi.js';

// O versículo do dia promete o texto das Bíblias do app: o PT tem de ser um
// trecho literal da Ave Maria e o EN da Douay-Rheims, no número que o card
// abre. Antes, vários textos eram de outras traduções ("O amor é paciente") e os
// Salmos vinham na numeração hebraica, abrindo outro salmo (Salmo 23,1 caía em
// "Do Senhor é a terra"). Pontuação, aspas e maiúsculas não contam.
const letras = (s) => s.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const trecho = (bible, { bookId, chapter, verse, verseEnd }) => {
  const arr = bible[bookId]?.[chapter - 1];
  const out = [];
  for (let n = verse; n <= (verseEnd ?? verse); n++) {
    const t = verseText(arr, n);
    if (t && !out.includes(t)) out.push(t);
  }
  return out.join(' ');
};

test('texto PT literal da Ave Maria no número que o card abre', () => {
  const errados = DAILY_VERSES.filter((d) => !letras(trecho(AVEMARIA, d)).includes(letras(d.text))).map((d) => d.ref);
  assert.deepEqual(errados, []);
});

test('texto EN literal da Douay-Rheims (bibleNavEn quando a numeração difere)', () => {
  const errados = DAILY_VERSES.filter((d) => !letras(trecho(DRA, d.bibleNavEn ?? d)).includes(letras(d.textEn))).map((d) => d.refEn);
  assert.deepEqual(errados, []);
});

test('Salmos com a numeração da Vulgata no link e as duas no rótulo', () => {
  for (const d of DAILY_VERSES.filter((x) => x.bookId === 'sl')) {
    assert.match(d.ref, new RegExp(`^Salmo \\d+ \\(${d.chapter}\\),`), d.ref);
    assert.match(d.refEn, new RegExp(`^Psalm \\d+ \\(${d.chapter}\\):`), d.refEn);
  }
});
