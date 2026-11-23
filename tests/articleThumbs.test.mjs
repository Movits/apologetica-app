import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// src/data/articleThumbs.js faz require de imagens (não roda no node), então
// o teste lê o texto: todo artigo tem miniatura e todo arquivo existe.
// Faltou? node scripts/generate-article-thumbs.mjs
const ROOT = path.resolve(import.meta.dirname, '..');
const thumbs = fs.readFileSync(path.join(ROOT, 'src/data/articleThumbs.js'), 'utf8');
const entries = new Map([...thumbs.matchAll(/^ {2}(\d+): require\('\.\.\/\.\.\/(assets\/articles\/thumbs\/[^']+)'\)/gm)].map((m) => [Number(m[1]), m[2]]));

const ids = [];
const dir = path.join(ROOT, 'src/data/articles');
for (const f of fs.readdirSync(dir)) {
  if (f === 'index.js') continue;
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const m of src.matchAll(/\r?\n {4}id: (\d+),/g)) ids.push(Number(m[1]));
}

test('todo artigo tem miniatura', () => {
  assert.ok(ids.length > 0);
  const missing = ids.filter((id) => !entries.has(id));
  assert.deepEqual(missing, [], 'rode node scripts/generate-article-thumbs.mjs');
});

test('os arquivos das miniaturas existem e são pequenos', () => {
  for (const [id, rel] of entries) {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), `miniatura do artigo ${id} não existe: ${rel}`);
    assert.ok(fs.statSync(file).size < 150 * 1024, `miniatura do artigo ${id} passou de 150 KB`);
  }
});
