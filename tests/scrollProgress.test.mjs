import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrollFraction, stepped } from '../src/utils/scrollProgress.js';

// Fração lida de um evento de scroll (Fase 5). É a fórmula que
// ArticleDetailScreen (barra de progresso) e BibleScreen (capítulo lido)
// escreviam cada uma do seu jeito: as duas são a mesma conta.

const ev = (y, content, layout) => ({
  contentOffset: { y },
  contentSize: { height: content },
  layoutMeasurement: { height: layout },
});

test('scrollFraction: conteúdo que cabe na tela vale 1', () => {
  assert.equal(scrollFraction(ev(0, 500, 500)), 1);
  assert.equal(scrollFraction(ev(0, 300, 500)), 1);
  // Folga de 4 pontos (arredondamento de layout) ainda conta como "cabe".
  assert.equal(scrollFraction(ev(0, 504, 500)), 1);
  assert.equal(scrollFraction(ev(0, 505, 500)), 0);
});

test('scrollFraction: proporção do que já rolou, entre 0 e 1', () => {
  assert.equal(scrollFraction(ev(0, 1500, 500)), 0);
  assert.equal(scrollFraction(ev(500, 1500, 500)), 0.5);
  assert.equal(scrollFraction(ev(1000, 1500, 500)), 1);
  // Bounce (iOS) fora dos limites é cortado.
  assert.equal(scrollFraction(ev(-40, 1500, 500)), 0);
  assert.equal(scrollFraction(ev(1100, 1500, 500)), 1);
});

test('scrollFraction: a folga é configurável', () => {
  assert.equal(scrollFraction(ev(0, 510, 500), 10), 1);
  assert.equal(scrollFraction(ev(0, 510, 500), 0), 0);
  assert.equal(scrollFraction(ev(5, 510, 500), 0), 0.5);
});

test('stepped: só aceita o valor novo quando andou meio por cento (ou cravou 0 ou 1)', () => {
  assert.equal(stepped(0.5, 0.501), 0.5);
  assert.equal(stepped(0.5, 0.505), 0.505);
  assert.equal(stepped(0.5, 0.4), 0.4);
  assert.equal(stepped(0.5, 0.5), 0.5);
  // Extremos sempre passam, para a barra encher e esvaziar de verdade.
  assert.equal(stepped(0.001, 0), 0);
  assert.equal(stepped(0.999, 1), 1);
  // Passo configurável.
  assert.equal(stepped(0.5, 0.52, 0.05), 0.5);
  assert.equal(stepped(0.5, 0.55, 0.05), 0.55);
});
