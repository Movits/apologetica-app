import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AVEMARIA } from '../src/data/bibleAveMaria.js';
import { chapterVerses } from '../src/services/bibleApi.js';

// Numeração da Ave Maria offline. A fonte (fidalgobr/bibliaAveMariaJSON)
// perdia versículos ou os grudava com o número no meio do texto, e tudo depois
// do defeito ficava com o número errado: Atos 3,1 mostrava o texto do 3,2.
// scripts/convert-avemaria.mjs conserta isso com scripts/source/avemaria-correcoes.json.
//
// tests/fixtures/avemaria-forma.json guarda a forma de cada capítulo como a
// edição publicada a imprime (bibliaonline.com.br/avm): a lista de linhas, cada
// uma [primeiro número, último número] (um bloco como Josué 19,17-23 é uma
// linha só). Só números, nenhum texto.
const FORMA = JSON.parse(readFileSync(new URL('./fixtures/avemaria-forma.json', import.meta.url), 'utf8'));

test('cada capítulo tem a numeração da edição impressa', () => {
  const erradas = [];
  for (const [ref, forma] of Object.entries(FORMA)) {
    const [id, ch] = ref.split(' ');
    const linhas = chapterVerses(AVEMARIA[id][ch - 1]).map((v) => [v.n, v.end ?? v.n]);
    if (JSON.stringify(linhas) !== JSON.stringify(forma)) erradas.push(ref);
  }
  assert.deepEqual(erradas, []);
  assert.equal(Object.keys(FORMA).length, 1334);
});

test('nenhum resto de diagramação no texto', () => {
  const sujos = [];
  for (const [id, chs] of Object.entries(AVEMARIA)) {
    chs.forEach((vs, ci) => vs.forEach((v, vi) => {
      if (/­/.test(v) || /^\s*\[\s*\]\s*$/.test(v) || /\*/.test(v)) sujos.push(`${id} ${ci + 1},${vi + 1}`);
    }));
  }
  assert.deepEqual(sujos, []);
});

test('nenhum versículo carrega o número do seguinte no meio do texto', () => {
  // "...se manchar, 30 ou quando..." era Números 5,29 com o 5,30 grudado.
  const grudados = [];
  for (const [id, chs] of Object.entries(AVEMARIA)) {
    chs.forEach((vs, ci) => vs.forEach((v, vi) => {
      const proximo = vi + 2;
      if (new RegExp(`(^|\\s)\\(?${proximo}(-\\d{1,3})?\\)?\\s+\\S`).test(v)) grudados.push(`${id} ${ci + 1},${vi + 1}`);
    }));
  }
  assert.deepEqual(grudados, []);
});

test('casos conferidos um a um', () => {
  const v = (id, ch, n) => AVEMARIA[id][ch - 1][n - 1];
  assert.match(v('at', 3, 1), /^Pedro e João iam subindo ao templo/);
  assert.match(v('at', 3, 2), /^Nisto levavam um homem que era coxo/);
  assert.match(v('nm', 5, 30), /^ou quando o espírito de ciúme/);
  assert.equal(AVEMARIA['2rs'][18].length, 37);
  const js19 = chapterVerses(AVEMARIA.js[18]);
  assert.deepEqual(js19.find((x) => x.n === 17), { n: 17, t: js19.find((x) => x.n === 17).t, end: 23 });
  assert.match(js19.find((x) => x.n === 17).t, /^A quarta sorte coube a Issacar/);
  assert.equal(AVEMARIA.js[18].length, 51);
});
