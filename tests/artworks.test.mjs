import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS, artworkForArticle, museumUrl } from '../src/data/artworks/index.js';
import { ART_IMAGES } from '../src/data/artImages.js';

// Lições de obras (src/data/artworks): o visualizador confia nestes dados sem
// conferir nada, então os erros têm de morrer aqui.

const TEXT_FIELDS = ['title', 'technique', 'location'];

test('cada obra tem placa, aula e tradução completas', () => {
  for (const art of ARTWORKS) {
    const where = `obra ${art.slug}`;
    assert.match(art.slug, /^[a-z0-9-]+$/, where);
    assert.ok(art.articles.length > 0, `${where}: sem artigo`);
    assert.ok(art.artist && art.date, `${where}: placa incompleta`);
    for (const f of TEXT_FIELDS) {
      assert.ok(art[f], `${where}: ${f}`);
      assert.ok(art[`${f}En`], `${where}: ${f}En`);
    }
    assert.ok(art.intro.length >= 2, `${where}: aula curta demais`);
    assert.equal(art.introEn.length, art.intro.length, `${where}: introEn`);
    for (const id of art.articles) {
      assert.ok(art.notes[id] && art.notesEn[id], `${where}: ponte com o artigo ${id}`);
    }
  }
});

test('lupas ficam dentro da imagem e têm texto nos dois idiomas', () => {
  for (const art of ARTWORKS) {
    const ids = new Set();
    for (const l of art.lupas) {
      const where = `${art.slug}/${l.id}`;
      assert.ok(!ids.has(l.id), `${where}: id repetido`);
      ids.add(l.id);
      assert.ok(l.w > 0 && l.h > 0, `${where}: tamanho`);
      assert.ok(l.x >= 0 && l.y >= 0 && l.x + l.w <= 1.0001 && l.y + l.h <= 1.0001, `${where}: fora da imagem`);
      assert.ok(l.title && l.titleEn, `${where}: título`);
      assert.ok(l.text.length > 0, `${where}: texto`);
      assert.equal(l.textEn.length, l.text.length, `${where}: textEn`);
    }
  }
});

test('sem travessão nos textos das obras (convenção de conteúdo)', () => {
  const all = JSON.stringify(ARTWORKS);
  assert.doesNotMatch(all, /—/);
});

test('obra sem DZI do museu precisa da imagem da Commons do artigo', () => {
  for (const art of ARTWORKS) {
    if (art.dzi) {
      assert.match(art.dzi, /^https:\/\/movits\.github\.io\/museu-virtual[^/]*\/tiles\/.+\.dzi$/);
      continue;
    }
    for (const id of art.articles) assert.ok(ART_IMAGES[id], `${art.slug}: artigo ${id} sem ART_IMAGES`);
  }
});

test('artworkForArticle e museumUrl', () => {
  assert.equal(artworkForArticle(7)?.slug, 'ultima-ceia');
  assert.equal(artworkForArticle(-1), null);
  const ceia = artworkForArticle(7);
  assert.equal(museumUrl(ceia), 'https://movits.github.io/museu-virtual/#/obra/ultima-ceia');
  assert.equal(museumUrl(ceia, 'judas-na-sombra'), 'https://movits.github.io/museu-virtual/#/obra/ultima-ceia?lupa=judas-na-sombra');
  assert.equal(museumUrl({ slug: 'x' }), null);
});
