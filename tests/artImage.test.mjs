import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  commonsOriginalUrl,
  commonsUrl,
  commonsPyramid,
  lupaBounds,
} from '../src/utils/artImage.js';
import { ART_IMAGES } from '../src/data/artImages.js';

// Imagem de origem de exemplo (formato de src/data/artImages.js).
const BIG = { path: '0/08', file: 'Last_Supper.jpg', width: 5076, height: 2645 };
const MID = { path: '8/8c', file: 'Job.jpg', width: 1685, height: 1200 };
const TINY = { path: 'e/e0', file: 'Emmaus.jpg', width: 900, height: 750 };

test('original e miniatura apontam para os hosts certos da Wikimedia', () => {
  assert.equal(
    commonsOriginalUrl(BIG),
    'https://upload.wikimedia.org/wikipedia/commons/0/08/Last_Supper.jpg',
  );
  assert.equal(
    commonsUrl(BIG, 1280),
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Last_Supper.jpg/1280px-Last_Supper.jpg',
  );
});

test('commonsUrl escolhe o menor tamanho-padrão que cobre o pedido', () => {
  assert.match(commonsUrl(BIG, 1000), /\/1280px-/);
  assert.match(commonsUrl(BIG, 1281), /\/1920px-/);
  assert.match(commonsUrl(BIG, 1), /\/500px-/);
});

test('commonsUrl nunca pede miniatura maior ou igual ao original', () => {
  // 1685 px de largura: o tamanho-padrão 1920 não existe para ela.
  assert.equal(commonsUrl(MID, 1800), commonsOriginalUrl(MID));
  assert.match(commonsUrl(MID, 1200), /\/1280px-/);
  assert.equal(commonsUrl(TINY, 960), commonsOriginalUrl(TINY));
});

test('a pirâmide cresce até 3840 px e termina no original quando ele é menor', () => {
  const big = commonsPyramid(BIG);
  assert.deepEqual(big.map((l) => l.width), [960, 1920, 3840]);
  assert.equal(big[2].height, Math.round((2645 * 3840) / 5076));
  assert.match(big[2].url, /\/3840px-/);

  const mid = commonsPyramid(MID);
  assert.deepEqual(mid.map((l) => l.width), [960, 1685]);
  assert.equal(mid[1].url, commonsOriginalUrl(MID));
  assert.equal(mid[1].height, 1200);

  assert.deepEqual(commonsPyramid(TINY).map((l) => l.width), [900]);
});

test('PNG também tem miniatura e as 83 imagens geradas viram URL válida', () => {
  const ids = Object.keys(ART_IMAGES);
  assert.ok(ids.length >= 80);
  for (const id of ids) {
    const img = ART_IMAGES[id];
    assert.ok(img.width > 0 && img.height > 0, `dimensões do artigo ${id}`);
    assert.doesNotMatch(img.file, /[?#\s]/, `nome limpo no artigo ${id}`);
    assert.match(commonsUrl(img, 1280), /^https:\/\/(thumb|upload)\.wikimedia\.org\//);
  }
});

// Lupa de exemplo e uma tela de 400 x 800 px com barra de 100 px em cima e
// painel de 300 px embaixo: sobra uma faixa visível de 400 x 400.
const LUPA = { x: 0.4, y: 0.2, w: 0.2, h: 0.2 };
const VIEW = { viewW: 400, viewH: 800, topInset: 100, bottomInset: 300 };

test('lupaBounds devolve a proporção exata da tela (fitBounds sem sobra)', () => {
  const b = lupaBounds({ lupa: LUPA, aspect: 2, ...VIEW });
  assert.ok(Math.abs(b.width / b.height - 400 / 800) < 1e-9);
});

test('lupaBounds centra a lupa na faixa visível, não na tela inteira', () => {
  const aspect = 2; // imagem 2:1, viewport do OpenSeadragon com 0,5 de altura
  const pad = 0.18;
  const b = lupaBounds({ lupa: LUPA, aspect, pad, ...VIEW });
  const scale = b.width / 400; // unidades de viewport por pixel
  const cx = LUPA.x + LUPA.w / 2;
  const cy = (LUPA.y + LUPA.h / 2) / aspect;
  // Centro da faixa visível: x = 200 px, y = 100 + 400 / 2 = 300 px.
  assert.ok(Math.abs(b.x + 200 * scale - cx) < 1e-9);
  assert.ok(Math.abs(b.y + 300 * scale - cy) < 1e-9);
  // A lupa com folga cabe na faixa: a largura com folga ocupa no máximo 400 px.
  assert.ok((LUPA.w * (1 + 2 * pad)) / scale <= 400 + 1e-6);
  assert.ok(((LUPA.h * (1 + 2 * pad)) / aspect) / scale <= 400 + 1e-6);
});

test('lupaBounds desconta o painel lateral no desktop', () => {
  const b = lupaBounds({ lupa: LUPA, aspect: 1, viewW: 1200, viewH: 800, rightInset: 400 });
  const scale = b.width / 1200;
  // Centro horizontal da área livre: (1200 - 400) / 2 = 400 px.
  assert.ok(Math.abs(b.x + 400 * scale - (LUPA.x + LUPA.w / 2)) < 1e-9);
});
