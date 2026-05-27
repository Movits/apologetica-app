// Sincroniza o texto das refs biblicas em references.js com a Biblia Ave Maria.
// Tambem corrige URLs quebradas e ajusta a entrada de Genesis 3,15.
// Uso: node scripts/sync-bible-refs.mjs

import fs from 'fs';
import { AVEMARIA } from '../src/data/bibleAveMaria.js';

const refsFile = './src/data/references.js';
let content = fs.readFileSync(refsFile, 'utf8');

// id -> { book, chapter, startVerse, endVerse }
const bibleRefs = {
  'mt-16-18':   { book: 'mt',   ch: 16, sv: 18, ev: 19 },
  '1pd-3-15':   { book: '1pd',  ch: 3,  sv: 15, ev: 15 },
  'jo-6-53':    { book: 'jo',   ch: 6,  sv: 53, ev: 55 },
  'rm-1-20':    { book: 'rm',   ch: 1,  sv: 20, ev: 20 },
  'rm-2-14':    { book: 'rm',   ch: 2,  sv: 14, ev: 15 },
  '1cor-15-3':  { book: '1cor', ch: 15, sv: 3,  ev: 8 },
  '2ts-2-15':   { book: '2ts',  ch: 2,  sv: 15, ev: 15 },
  'jo-2-1':     { book: 'jo',   ch: 2,  sv: 1,  ev: 11 },
  'mt-22-32':   { book: 'mt',   ch: 22, sv: 32, ev: 32 },
  'ap-5-8':     { book: 'ap',   ch: 5,  sv: 8,  ev: 8 },
  '1tm-2-5':    { book: '1tm',  ch: 2,  sv: 5,  ev: 5 },
  'rm-8-28':    { book: 'rm',   ch: 8,  sv: 28, ev: 28 },
  'mt-28-19':   { book: 'mt',   ch: 28, sv: 19, ev: 20 },
  'mt-26-26':   { book: 'mt',   ch: 26, sv: 26, ev: 28 },
  '1cor-11-27': { book: '1cor', ch: 11, sv: 27, ev: 29 },
  'gn-1-27':    { book: 'gn',   ch: 1,  sv: 27, ev: 28 },
  'rm-1-26':    { book: 'rm',   ch: 1,  sv: 26, ev: 27 },
  '1cor-6-9':   { book: '1cor', ch: 6,  sv: 9,  ev: 11 },
  '2pd-1-20':   { book: '2pd',  ch: 1,  sv: 20, ev: 21 },
  'mt-28-1':    { book: 'mt',   ch: 28, sv: 1,  ev: 10 },
  'jo-17-20':   { book: 'jo',   ch: 17, sv: 20, ev: 21 },
  'jo-6-67':    { book: 'jo',   ch: 6,  sv: 67, ev: 69 },
  'lc-1-28':    { book: 'lc',   ch: 1,  sv: 28, ev: 28 },
  'lc-1-47':    { book: 'lc',   ch: 1,  sv: 46, ev: 47 },
  'gn-3-15':    { book: 'gn',   ch: 3,  sv: 15, ev: 15 },
  'lc-1-34':    { book: 'lc',   ch: 1,  sv: 34, ev: 34 },
  'lc-2-7':     { book: 'lc',   ch: 2,  sv: 7,  ev: 7 },
  'mt-13-55':   { book: 'mt',   ch: 13, sv: 55, ev: 56 },
  'mc-6-3':     { book: 'mc',   ch: 6,  sv: 3,  ev: 3 },
  'gn-14-14':   { book: 'gn',   ch: 14, sv: 14, ev: 14 },
  'gl-1-19':    { book: 'gl',   ch: 1,  sv: 19, ev: 19 },
  'jo-19-26':   { book: 'jo',   ch: 19, sv: 26, ev: 27 },
  'lc-1-43':    { book: 'lc',   ch: 1,  sv: 43, ev: 43 },
  'jo-8-58':    { book: 'jo',   ch: 8,  sv: 58, ev: 58 },
  'jo-10-30':   { book: 'jo',   ch: 10, sv: 30, ev: 33 },
  'mc-14-61':   { book: 'mc',   ch: 14, sv: 61, ev: 62 },
  'ex-3-14':    { book: 'ex',   ch: 3,  sv: 14, ev: 14 },
  'jo-1-1':     { book: 'jo',   ch: 1,  sv: 1,  ev: 3 },
  'jo-20-28':   { book: 'jo',   ch: 20, sv: 28, ev: 28 },
  'hb-9-27':    { book: 'hb',   ch: 9,  sv: 27, ev: 27 },
  'ap-22-8':    { book: 'ap',   ch: 22, sv: 8,  ev: 9 },
};

function getText(info) {
  const verses = [];
  for (let v = info.sv; v <= info.ev; v++) {
    const t = AVEMARIA[info.book]?.[info.ch - 1]?.[v - 1];
    if (t) verses.push(t);
  }
  return verses.join(' ').trim();
}

// Para cada ref, faz replace do campo `text:` com o texto Ave Maria.
// Estrategia: encontra o bloco da ref pelo id, depois substitui o text seguinte.
let updated = 0;
for (const [id, info] of Object.entries(bibleRefs)) {
  const newText = getText(info);
  if (!newText) {
    console.warn(`[WARN] Sem texto para ${id}`);
    continue;
  }
  // Escapa caracteres especiais no texto novo para usar em uma string JS
  // Usa template literal pra simplificar (sem aspas internas problematicas)
  const escapedText = newText
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  // Procura o bloco da ref e o campo text dentro dele.
  // Pattern: id: 'xxx', ... text: 'qualquer coisa',
  // O text pode ter aspas simples escapadas. Mais robusto: aceitar template literal tambem.
  const blockStart = content.indexOf(`id: '${id}'`);
  if (blockStart === -1) {
    console.warn(`[WARN] Ref nao encontrada: ${id}`);
    continue;
  }
  // Encontra o "text:" dentro dos proximos 3000 chars
  const window = content.slice(blockStart, blockStart + 3000);
  const textMatch = window.match(/text: '((?:[^'\\]|\\.)*)'/);
  if (!textMatch) {
    console.warn(`[WARN] Campo text nao encontrado em ${id}`);
    continue;
  }
  const oldFullField = textMatch[0];
  // Substitui usando template literal (`...`) para escapar menos caracteres
  const newFullField = `text: \`${escapedText}\``;
  content = content.slice(0, blockStart) + window.replace(oldFullField, newFullField) + content.slice(blockStart + 3000);
  updated++;
}

// Corrige URLs quebradas
const urlFixes = {
  'ineffabilis-deus':
    'https://pt.wikipedia.org/wiki/Ineffabilis_Deus',
  'efeso-anatema':
    'https://pt.wikipedia.org/wiki/Conc%C3%ADlio_de_%C3%89feso',
  'milagre-lanciano':
    'https://pt.wikipedia.org/wiki/Milagre_eucar%C3%ADstico_de_Lanciano',
  'acutis-milagres':
    'https://pt.wikipedia.org/wiki/Carlo_Acutis',
};

for (const [id, newUrl] of Object.entries(urlFixes)) {
  const blockStart = content.indexOf(`id: '${id}'`);
  if (blockStart === -1) {
    console.warn(`[WARN] Ref nao encontrada para URL: ${id}`);
    continue;
  }
  const window = content.slice(blockStart, blockStart + 4000);
  const urlMatch = window.match(/url: '[^']*'/);
  if (urlMatch) {
    const newField = `url: '${newUrl}'`;
    content = content.slice(0, blockStart) + window.replace(urlMatch[0], newField) + content.slice(blockStart + 4000);
    console.log(`URL atualizada: ${id}`);
  }
}

fs.writeFileSync(refsFile, content);
console.log(`\nAtualizadas ${updated} refs biblicas com texto Ave Maria.`);
console.log('URLs corrigidas: ', Object.keys(urlFixes).join(', '));
