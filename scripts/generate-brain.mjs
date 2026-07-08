// Gera as notas de CONTEÚDO do second brain (brain/9-Conteúdo/) a partir dos
// dados reais do app. Rode sempre que artigos, referências, diálogos ou plano
// mudarem:
//
//   node scripts/generate-brain.mjs
//
// A pasta brain/9-Conteúdo é apagada e recriada inteira (não editar à mão:
// qualquer edição manual ali é perdida na próxima geração). As conexões vêm
// dos próprios dados: references[] dos artigos, RELATED_ARTICLES, os
// relatedArticle dos diálogos e os dias do plano de leitura.

import { mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'brain', '9-Conteúdo');
const HOJE = new Date().toISOString().slice(0, 10);

// ---------- carga dos dados ----------

// Os arquivos de artigos usam require() de imagens (coisa do Metro/React
// Native) que não roda em Node puro. Troca por null numa cópia temporária.
async function loadArticles() {
  const dir = join(ROOT, 'src', 'data', 'articles');
  const tmp = join(tmpdir(), `brain-gen-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  const all = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js') || f === 'index.js') continue;
    const src = readFileSync(join(dir, f), 'utf8')
      .replace(/image:\s*require\([^)]*\),?/g, 'image: null,');
    const tmpFile = join(tmp, f.replace(/\.js$/, '.mjs'));
    writeFileSync(tmpFile, src);
    const mod = await import(pathToFileURL(tmpFile).href);
    for (const a of mod.default) all.push({ ...a, _file: `src/data/articles/${f}` });
  }
  rmSync(tmp, { recursive: true, force: true });
  return all.sort((a, b) => a.id - b.id);
}

const [articles, refsMod, relMod, diaMod, planMod] = await Promise.all([
  loadArticles(),
  import(pathToFileURL(join(ROOT, 'src/data/references.js')).href),
  import(pathToFileURL(join(ROOT, 'src/data/articleRelations.js')).href),
  import(pathToFileURL(join(ROOT, 'src/data/dialogues.js')).href),
  import(pathToFileURL(join(ROOT, 'src/data/readingPlan.js')).href),
]);
const references = refsMod.references;
const RELATED = relMod.RELATED_ARTICLES;
const DIALOGUES = diaMod.DIALOGUES;
const TRACKS = planMod.READING_TRACKS;

// ---------- utilitários ----------

// Nome de arquivo seguro no Windows e válido como [[wiki-link]] do Obsidian.
function sanitize(s, max = 80) {
  const clean = String(s)
    .replace(/["“”]/g, '')
    .replace(/[\\/:*?<>|#^[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '');
  return clean.length > max ? clean.slice(0, max).trim() : clean;
}

function fm(tags) {
  return `---\ntags: [${tags.join(', ')}]\natualizado: ${HOJE}\ngerado: true\n---\n`;
}

const AVISO = '> Nota gerada por `node scripts/generate-brain.mjs`. Não editar à mão.\n';

function write(dirName, title, body) {
  const dir = join(OUT, dirName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${title}.md`), body);
}

// ---------- nomes canônicos (título = filename = alvo do link) ----------

const artTitle = new Map(); // id -> titulo da nota
for (const a of articles) artTitle.set(a.id, sanitize(`${String(a.id).padStart(2, '0')} - ${a.title}`));

const refTitle = new Map(); // refId -> titulo da nota
const usedRefNames = new Set();
for (const r of references) {
  let base = sanitize(r.ref, 60);
  if (usedRefNames.has(base)) base = sanitize(`${base} (${r.id})`, 80);
  usedRefNames.add(base);
  refTitle.set(r.id, base);
}

const diaTitle = new Map(); // dialogueId -> titulo
const usedDiaNames = new Set();
for (const d of DIALOGUES) {
  let base = sanitize(d.objection, 70);
  if (usedDiaNames.has(base)) base = sanitize(`${base} (${d.id})`, 80);
  usedDiaNames.add(base);
  diaTitle.set(d.id, base);
}

const trackTitle = new Map();
for (const t of TRACKS) trackTitle.set(t.id, sanitize(`Trilho - ${t.titlePt}`, 80));

// ---------- índices reversos ----------

const refUsedBy = new Map(); // refId -> [articleId]
for (const a of articles) for (const rid of a.references || []) {
  if (!refUsedBy.has(rid)) refUsedBy.set(rid, []);
  refUsedBy.get(rid).push(a.id);
}
const diasFor = new Map(); // articleId -> [dialogue]
for (const d of DIALOGUES) {
  if (d.relatedArticle == null) continue;
  if (!diasFor.has(d.relatedArticle)) diasFor.set(d.relatedArticle, []);
  diasFor.get(d.relatedArticle).push(d);
}
const planFor = new Map(); // articleId -> [{track, day, theme}]
for (const t of TRACKS) for (const d of t.days) {
  if (!planFor.has(d.articleId)) planFor.set(d.articleId, []);
  planFor.get(d.articleId).push({ track: t, day: d.day, theme: d.theme });
}

// ---------- geração ----------

rmSync(OUT, { recursive: true, force: true });

const categorias = [...new Set(articles.map((a) => a.category))];

// Artigos (uma nota por artigo, com todas as conexões)
for (const a of articles) {
  const rel = (RELATED[a.id] || []).filter((id) => artTitle.has(id));
  const refs = (a.references || []).filter((id) => refTitle.has(id));
  const dias = diasFor.get(a.id) || [];
  const plano = planFor.get(a.id) || [];
  let b = fm(['artigo', 'conteudo-gerado']) + `# ${artTitle.get(a.id)}\n${AVISO}\n`;
  b += `${a.summary}\n\n`;
  b += `Categoria: [[${sanitize(a.category)}]]\nArquivo: \`${a._file}\`\n`;
  if (refs.length) b += `\n## Referências usadas\n${refs.map((id) => `- [[${refTitle.get(id)}]]`).join('\n')}\n`;
  if (rel.length) b += `\n## Artigos relacionados\n${rel.map((id) => `- [[${artTitle.get(id)}]]`).join('\n')}\n`;
  if (dias.length) b += `\n## Diálogos que levam a este artigo\n${dias.map((d) => `- [[${diaTitle.get(d.id)}]]`).join('\n')}\n`;
  if (plano.length) b += `\n## No plano de leitura\n${plano.map((p) => `- [[${trackTitle.get(p.track.id)}]], dia ${p.day}: ${p.theme}`).join('\n')}\n`;
  write('Artigos', artTitle.get(a.id), b);
}

// Categorias
for (const cat of categorias) {
  const lista = articles.filter((a) => a.category === cat);
  let b = fm(['categoria', 'conteudo-gerado']) + `# ${sanitize(cat)}\n${AVISO}\n`;
  b += `Categoria com aprox. ${lista.length} artigos (${HOJE}).\n\n## Artigos\n`;
  b += lista.map((a) => `- [[${artTitle.get(a.id)}]]`).join('\n') + '\n';
  write('Categorias', sanitize(cat), b);
}

// Referências
for (const r of references) {
  const usada = (refUsedBy.get(r.id) || []).filter((id) => artTitle.has(id));
  let b = fm(['referencia', 'conteudo-gerado', `fonte-${sanitize(r.source).toLowerCase().replace(/\s+/g, '-')}`]);
  b += `# ${refTitle.get(r.id)}\n${AVISO}\n`;
  b += `Fonte: ${r.source}${r.author ? ` | ${r.author}` : ''}${r.year ? ` (${r.year})` : ''}\n`;
  if (r.topic) b += `Tema: ${r.topic}\n`;
  if (r.text) b += `\n> ${String(r.text).slice(0, 220)}${String(r.text).length > 220 ? '...' : ''}\n`;
  if (r.bibleNav) b += `\nAbre no app em \`${r.bibleNav.bookId} ${r.bibleNav.chapter},${r.bibleNav.verse}\`.\n`;
  if (usada.length) b += `\n## Usada nos artigos\n${usada.map((id) => `- [[${artTitle.get(id)}]]`).join('\n')}\n`;
  else b += `\nNenhum artigo usa esta referência hoje (candidata a revisão editorial).\n`;
  write('Referências', refTitle.get(r.id), b);
}

// Diálogos
for (const d of DIALOGUES) {
  let b = fm(['dialogo', 'conteudo-gerado']) + `# ${diaTitle.get(d.id)}\n${AVISO}\n`;
  b += `Objeção: ${d.objection}\nCategoria: ${d.category} | Passos: ${d.steps?.length || 0}\nId: \`${d.id}\`\n`;
  if (d.relatedArticle != null && artTitle.has(d.relatedArticle)) {
    b += `\nArtigo completo: [[${artTitle.get(d.relatedArticle)}]]\n`;
  }
  write('Diálogos', diaTitle.get(d.id), b);
}

// Trilhos do plano
for (const t of TRACKS) {
  let b = fm(['plano', 'conteudo-gerado']) + `# ${trackTitle.get(t.id)}\n${AVISO}\n`;
  b += `${t.descPt}\n\n## Dias\n`;
  b += t.days.map((d) => `- Dia ${d.day}: [[${artTitle.get(d.articleId) || '?'}]] (${d.theme})`).join('\n') + '\n';
  write('Planos', trackTitle.get(t.id), b);
}

// Índice da seção gerada
{
  let b = fm(['mapa', 'conteudo-gerado']) + `# Conteúdo do App (gerado)\n${AVISO}\n`;
  b += `Grafo do conteúdo real do app em ${HOJE}: aprox. ${articles.length} artigos, ${references.length} referências, ${DIALOGUES.length} diálogos e ${TRACKS.length} trilhos de leitura, com as conexões que existem nos dados.\n\n`;
  b += `## Categorias\n${categorias.map((c) => `- [[${sanitize(c)}]]`).join('\n')}\n\n`;
  b += `## Trilhos do plano de leitura\n${TRACKS.map((t) => `- [[${trackTitle.get(t.id)}]]`).join('\n')}\n\n`;
  b += `## Como regenerar\nSempre que artigos, referências, diálogos ou plano mudarem, rode:\n\n\`\`\`\nnode scripts/generate-brain.mjs\n\`\`\`\n\nEsta pasta inteira (9-Conteúdo) é recriada do zero. Não editar as notas geradas à mão.\n`;
  writeFileSync(join(OUT, 'Conteúdo do App (gerado).md'), b);
}

console.log(`OK: ${articles.length} artigos, ${categorias.length} categorias, ${references.length} referências, ${DIALOGUES.length} diálogos, ${TRACKS.length} trilhos + índice em brain/9-Conteúdo/`);
