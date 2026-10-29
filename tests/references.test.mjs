import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  references, referencesWithEn, withEn, referenceById, translateFullSource, translateYear, translateAuthor,
  resolveRefUrl,
} from '../src/data/references.js';
import { referencesEn } from '../src/data/references-en.js';
import { SOURCE_IDS } from '../src/data/referenceSources.js';

test('ids das referências são únicos', () => {
  const seen = new Set();
  const duplicated = [];
  for (const r of references) {
    if (seen.has(r.id)) duplicated.push(r.id);
    seen.add(r.id);
  }
  assert.deepEqual(duplicated, []);
});

test('toda referência usa um source da lista fechada', () => {
  const invalid = references
    .filter((r) => !SOURCE_IDS.has(r.source))
    .map((r) => `${r.id}: ${r.source}`);
  assert.deepEqual(invalid, []);
});

// withEn / referencesWithEn (Fase 5): a mescla { ...ref, ...referencesEn[id] }
// que cinco telas refaziam. O catálogo mesclado tem o mesmo tamanho e a mesma
// ordem, e cada item ganha só os campos *En da sua tradução.
test('referencesWithEn tem o mesmo tamanho e os mesmos ids, na mesma ordem', () => {
  assert.equal(referencesWithEn.length, references.length);
  assert.deepEqual(referencesWithEn.map((r) => r.id), references.map((r) => r.id));
});

test('withEn mescla a tradução campo a campo e deixa o PT intacto', () => {
  const base = referenceById('mt-16-18');
  const merged = withEn(base);
  assert.equal(merged.ref, base.ref);
  assert.equal(merged.text, base.text);
  assert.equal(merged.textEn, referencesEn['mt-16-18'].textEn);
  assert.equal(merged.topicEn, referencesEn['mt-16-18'].topicEn);
  // Não altera o objeto original nem o do catálogo.
  assert.equal(base.textEn, undefined);
  assert.deepEqual(referencesWithEn.find((r) => r.id === 'mt-16-18'), merged);
});

test('withEn sem tradução devolve cópia igual, e nulo devolve nulo', () => {
  const semEn = references.find((r) => !referencesEn[r.id]);
  assert.ok(semEn, 'a dívida legada ainda tem referência sem EN');
  assert.deepEqual(withEn(semEn), semEn);
  assert.notEqual(withEn(semEn), semEn);
  assert.equal(withEn(null), null);
  assert.equal(withEn(undefined), null);
});

// Tradução automática do fullSource bíblico para o EN (quando não há fullSourceEn).
// Antes saía "verse18-19" e "verse8 e 9".
test('translateFullSource traduz capítulo e versículos com espaço, plural e intervalo', () => {
  const en = (s) => translateFullSource(s, true);
  assert.equal(en('Evangelho segundo São Mateus, capítulo 16, versículos 18-19'), 'Gospel of Matthew, chapter 16, verses 18-19');
  assert.equal(en('Evangelho segundo São João, capítulo 3, versículo 16'), 'Gospel of John, chapter 3, verse 16');
  assert.equal(en('Apocalipse de São João, capítulo 22, versículos 8 e 9'), 'Book of Revelation, chapter 22, verses 8-9');
  assert.equal(en('Atos dos Apóstolos, capítulo 2, versículos 14 a 21'), 'Acts of the Apostles, chapter 2, verses 14-21');
  assert.equal(translateFullSource('Evangelho segundo São Mateus, capítulo 16, versículos 18-19', false), 'Evangelho segundo São Mateus, capítulo 16, versículos 18-19');
});

test('translateYear traduz intervalo de séculos e mantém o século único', () => {
  assert.equal(translateYear('séc. VIII a VI a.C.', true), '8th to 6th century BC');
  assert.equal(translateYear('séc. I d.C.', true), '1st century AD');
  assert.equal(translateYear('séc. VI a.C.', true), '6th century BC');
});

// RefDetail e a lista abrem a fonte por aqui: no EN, o Catecismo em português
// do Vaticano vira o índice inglês, e um urlEn curado tem prioridade.
test('resolveRefUrl leva o Catecismo PT para o inglês e respeita urlEn', () => {
  const cicPt = 'https://www.vatican.va/archive/cathechism_po/index_new/p1s2c1_198-421_po.html';
  assert.equal(resolveRefUrl({ url: cicPt }, {}, false), cicPt);
  assert.equal(resolveRefUrl({ url: cicPt }, {}, true), 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM');
  assert.equal(resolveRefUrl({ url: cicPt }, { urlEn: 'https://example.org/en' }, true), 'https://example.org/en');
  assert.equal(resolveRefUrl(null, null, true), null);
});

test('translateAuthor traduz evangelista e apóstolo', () => {
  assert.equal(translateAuthor('Evangelista Lucas', true), 'Luke the Evangelist');
  assert.equal(translateAuthor('Evangelista Marcos', true), 'Mark the Evangelist');
  assert.equal(translateAuthor('Apóstolo Paulo', true), 'Apostle Paul');
  assert.equal(translateAuthor('Evangelista Lucas', false), 'Evangelista Lucas');
});
