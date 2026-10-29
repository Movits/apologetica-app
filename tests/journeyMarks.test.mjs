import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARKS } from '../src/data/journeyMarks.js';
import { BADGES, LEVELS } from '../src/utils/journey.js';

// Marcas vetoriais da Jornada (src/data/journeyMarks.js): toda conquista e
// todo nível têm a sua, no formato que EmblemMark desenha (caixa 64 x 64,
// até quatro elementos, sem cor escrita no dado: a cor é do tema).
const IDS = [...BADGES.map((b) => b.id), ...LEVELS.map((l) => l.id)];
const TAGS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon']);
const NUMERIC = ['cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'rx', 'x1', 'y1', 'x2', 'y2', 'strokeWidth'];

test('toda conquista e todo nível têm marca, e nenhuma marca sobra', () => {
  const missing = IDS.filter((id) => !MARKS[id]);
  const orphan = Object.keys(MARKS).filter((id) => !IDS.includes(id));
  assert.deepEqual(missing, [], 'sem marca');
  assert.deepEqual(orphan, [], 'marca sem dono');
});

test('cada marca tem de um a quatro elementos válidos, sem cor e dentro da caixa', () => {
  for (const [id, els] of Object.entries(MARKS)) {
    assert.ok(Array.isArray(els) && els.length >= 1 && els.length <= 4, `${id}: ${els?.length} elementos`);
    for (const e of els) {
      assert.ok(TAGS.has(e.tag), `${id}: tag "${e.tag}"`);
      assert.equal(e.stroke, undefined, `${id}: cor escrita no dado`);
      assert.ok(e.fill === undefined || e.fill === true, `${id}: fill só pode ser true`);
      for (const k of NUMERIC) {
        if (e[k] !== undefined) assert.ok(Number.isFinite(e[k]) && e[k] >= -8 && e[k] <= 72, `${id}: ${k}=${e[k]}`);
      }
      if (e.tag === 'path') assert.ok(typeof e.d === 'string' && /^[Mm]/.test(e.d.trim()), `${id}: path sem d`);
      if (e.tag === 'polyline' || e.tag === 'polygon') assert.ok(typeof e.points === 'string' && e.points.trim(), `${id}: sem points`);
    }
  }
});
