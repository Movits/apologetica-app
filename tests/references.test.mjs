import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  references, referencesWithEn, withEn, referenceById, translateYear, translateAuthor, resolveRefUrl,
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
  // Com a dívida de tradução zerada, nenhuma ref real fica sem EN: o caso
  // segue coberto por uma ref fictícia.
  const semEn = references.find((r) => !referencesEn[r.id]) ?? { id: 'teste-sem-en', ref: 'Teste', text: 'só em português' };
  assert.deepEqual(withEn(semEn), semEn);
  assert.notEqual(withEn(semEn), semEn);
  assert.equal(withEn(null), null);
  assert.equal(withEn(undefined), null);
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

test('translateFullSource: capítulo e versículo em inglês, com espaço e plural', async () => {
  const { translateFullSource } = await import('../src/data/references.js');
  assert.equal(translateFullSource('Evangelho segundo São João, capítulo 6, versículos 53-55', true), 'Gospel of John, chapter 6, verses 53-55');
  assert.equal(translateFullSource('Carta aos Hebreus, capítulo 9, versículo 27', true), 'Letter to the Hebrews, chapter 9, verse 27');
  assert.equal(translateFullSource('Livro do Gênesis, capítulo 1, versículos 27 a 28', true), 'Book of Genesis, chapter 1, verses 27-28');
  assert.equal(translateFullSource('Carta aos Hebreus, capítulo 9, versículo 27', false), 'Carta aos Hebreus, capítulo 9, versículo 27');
});

test('translateFullSource: "e" entre números vira "and" no inglês', async () => {
  const { translateFullSource } = await import('../src/data/references.js');
  assert.equal(translateFullSource('Evangelho segundo São Mateus, capítulo 5, versículos 45 e 46', true), 'Gospel of Matthew, chapter 5, verses 45 and 46');
  assert.equal(translateFullSource('Catecismo da Igreja Católica, parágrafos 2116 e 2117', true), 'Catechism of the Catholic Church §2116 and 2117');
});

// O texto de toda referência bíblica é o das Bíblias do app (PT Ave Maria, EN
// Douay-Rheims) no número que "Ler no app" abre: 44 traziam outra tradução ou
// resumo sem marca de corte. Cortes com (...) ou [...]; pontuação e
// maiúsculas não contam.
test('referências bíblicas: texto literal das Bíblias do app no número do link', async () => {
  const { AVEMARIA } = await import('../src/data/bibleAveMaria.js');
  const { DRA } = await import('../src/data/bibleDouayRheims.js');
  const { verseText } = await import('../src/services/bibleApi.js');
  const letras = (s) => String(s).normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  const trecho = (bible, b) => {
    const arr = bible[b.bookId]?.[b.chapter - 1];
    const out = [];
    for (let n = b.verse; n <= (b.verseEnd ?? b.verse); n++) { const t = verseText(arr, n); if (t && !out.includes(t)) out.push(t); }
    return out.join(' ');
  };
  const literal = (texto, biblia) => {
    const B = letras(biblia);
    let pos = 0;
    for (const parte of String(texto).split(/\[\s*(?:\.\.\.|…)\s*\]|…|\.\.\./)) {
      const p = letras(parte);
      if (!p) continue;
      const i = B.indexOf(p, pos);
      if (i < 0) return false;
      pos = i + p.length;
    }
    return true;
  };
  const errados = [];
  for (const r of references.filter((x) => x.source === 'Bíblia' && x.bibleNav)) {
    if (!literal(r.text, trecho(AVEMARIA, r.bibleNav))) errados.push(`${r.id} PT`);
    const en = referencesEn[r.id]?.textEn;
    if (en && !literal(en, trecho(DRA, r.bibleNavEn ?? r.bibleNav))) errados.push(`${r.id} EN`);
  }
  assert.deepEqual(errados, []);
});
