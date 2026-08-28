// Valida os dados de referência antes que um erro silencioso chegue ao app.
//
//   node scripts/check-refs.mjs      (ou: npm run check:refs)
//
// Por que existe: ReferencesScreen monta as seções iterando REFERENCE_SOURCES.
// Uma referência com `source` fora da lista simplesmente NÃO APARECE na tela,
// sem erro, sem warning e sem falhar no lint. É o modo de falha mais provável
// ao adicionar referências em lote, e nada o pegava.
//
// ERROS (saída != 0) são coisas que quebram o app ou a verificabilidade.
// AVISOS são dívida legada: nunca travam a execução, mas o número só pode cair.

import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(join(ROOT, p)).href);

const [refsMod, enMod, srcMod] = await Promise.all([
  load('src/data/references.js'),
  load('src/data/references-en.js'),
  load('src/data/referenceSources.js'),
]);

const references = refsMod.references;
const referencesEn = enMod.referencesEn;
const { SOURCE_IDS } = srcMod;

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

// Campos que references-en.js pode conter. Uma chave desconhecida é perigosa:
// ReferencesScreen faz spread {...r, ...en}, então um `citation` no overlay
// sobrescreveria o objeto inteiro do português.
const EN_FIELDS = new Set([
  'refEn', 'fullSourceEn', 'authorEn', 'yearEn', 'topicEn', 'textEn', 'urlEn', 'meaningEn',
]);

const CITATION_KINDS = new Set([
  'journal-article', 'preprint', 'book', 'chapter', 'report', 'proceedings', 'thesis',
]);
const MEDIA_TYPES = new Set(['photo', 'film', 'audio', 'document-scan']);
const MEDIA_LICENSES = new Set(['public-domain', 'cc-by', 'cc-by-sa', 'copyrighted']);

// Categorias novas: paridade EN e link verificável são obrigatórios desde o dia
// um, para a dívida legada não se repetir.
const STRICT_SOURCES = new Set(['Ciência', 'Mídia']);

const seen = new Set();
let noUrl = 0;
let noEn = 0;
let wikipedia = 0;

for (const r of references) {
  const id = r.id || '(sem id)';

  if (!r.id) err('(sem id)', 'referência sem campo id');
  else if (seen.has(r.id)) err(id, 'id duplicado (referenceById devolve só o primeiro)');
  else seen.add(r.id);

  if (!SOURCE_IDS.has(r.source)) {
    err(id, `source "${r.source}" fora da lista fechada. A referência ficaria INVISÍVEL na tela.`);
  }

  for (const f of ['ref', 'fullSource', 'author', 'year', 'topic', 'text']) {
    if (!r[f]) err(id, `campo obrigatório ausente: ${f}`);
  }

  const en = referencesEn[r.id];
  const isBible = r.source === 'Bíblia';

  // --- citação científica ---
  if (r.citation) {
    const c = r.citation;
    if (!CITATION_KINDS.has(c.kind)) err(id, `citation.kind inválido: "${c.kind}"`);
    if (!c.doi && !c.arxiv && !c.pmid && !c.isbn) {
      err(id, 'citation sem identificador (doi, arxiv, pmid ou isbn). Sem isso a citação não é rastreável.');
    }
  }

  // --- mídia ---
  if (r.media) {
    const m = r.media;
    if (!MEDIA_TYPES.has(m.type)) err(id, `media.type inválido: "${m.type}"`);
    if (!MEDIA_LICENSES.has(m.license)) err(id, `media.license inválida: "${m.license}"`);
    if (!m.viewUrl && !r.url) err(id, 'media sem viewUrl nem url: o registro não é verificável');
  }

  // --- URL ---
  const url = r.url || '';
  if (url) {
    if (/sci-hub/i.test(url)) err(id, 'url aponta para Sci-Hub');
    if (/web\.archive\.org\/web\/\*\//.test(url)) {
      err(id, 'snapshot do archive.org sem timestamp fixo (web/*/)');
    }
    // A reescrita PT->EN de resolveRefUrl só é segura no vaticano.
    if (!url.includes('vatican.va') && (url.includes('_po.html') || url.includes('/pt/'))) {
      err(id, 'url contém _po.html ou /pt/ fora de vatican.va (a reescrita para EN quebraria o link)');
    }
    if (url.includes('wikipedia.org')) {
      wikipedia++;
      warn(id, 'url aponta para a Wikipédia (fonte terciária, candidata a substituição)');
    }
  } else if (!isBible) {
    noUrl++;
    warn(id, 'referência não bíblica sem url verificável');
  }

  if (STRICT_SOURCES.has(r.source)) {
    if (!url && !r.citation && !(r.media && r.media.viewUrl)) {
      err(id, `source "${r.source}" exige link verificável (url, citation ou media.viewUrl)`);
    }
    if (!en || !en.textEn || !en.topicEn) {
      err(id, `source "${r.source}" exige tradução EN (textEn e topicEn) desde a criação`);
    }
  }

  if (!en || !en.textEn || !en.topicEn) {
    noEn++;
    if (!STRICT_SOURCES.has(r.source)) warn(id, 'sem tradução EN (cai para o português)');
  }

  // sanitize() de generate-brain.mjs remove : e / do nome do arquivo da nota.
  if (r.ref && /[:/]/.test(r.ref)) {
    warn(id, 'campo ref contém ":" ou "/", o que deforma o nome da nota em brain/');
  }
}

// Órfãos: tradução para um id que não existe mais.
for (const id of Object.keys(referencesEn)) {
  if (!seen.has(id)) err(id, 'existe em references-en.js mas não em references.js');
  for (const k of Object.keys(referencesEn[id])) {
    if (!EN_FIELDS.has(k)) {
      err(id, `campo "${k}" desconhecido em references-en.js (o spread {...r, ...en} sobrescreveria o dado PT)`);
    }
  }
}

const bySource = {};
for (const r of references) bySource[r.source] = (bySource[r.source] || 0) + 1;

console.log(`\nReferências: ${references.length}`);
console.log(Object.entries(bySource).map(([k, v]) => `  ${k}: ${v}`).join('\n'));
console.log(`\nDívida legada (só pode diminuir):`);
console.log(`  sem url (não bíblicas): ${noUrl}`);
console.log(`  sem tradução EN: ${noEn}`);
console.log(`  url na Wikipédia: ${wikipedia}`);

if (warnings.length) {
  console.log(`\n${warnings.length} aviso(s):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (errors.length) {
  console.error(`\n${errors.length} ERRO(S):`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}

console.log('\nOK: 0 erros.\n');
