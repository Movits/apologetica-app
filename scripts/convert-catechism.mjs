// Converte o Catecismo da Igreja Católica em formato JSON para o app.
// Fonte recomendada: github.com/Theonecalledalan/catechism-of-the-catholic-church
// (parágrafos 1-2865 em texto plano por arquivo). Use a versão em português
// e em inglês para gerar os dois textos por parágrafo.
//
// Como rodar:
//   1. Baixe os dois conjuntos de arquivos (PT e EN). Estrutura esperada:
//      scripts/source/catechism-pt/p0001.txt ... p2865.txt
//      scripts/source/catechism-en/p0001.txt ... p2865.txt
//   2. node scripts/convert-catechism.mjs
//   3. O arquivo src/data/catechism-full.js será gerado, e a tela de Catecismo
//      passará a mostrar todos os parágrafos.

import fs from 'node:fs';
import path from 'node:path';

const SRC_PT = path.join(process.cwd(), 'scripts', 'source', 'catechism-pt');
const SRC_EN = path.join(process.cwd(), 'scripts', 'source', 'catechism-en');
const OUTPUT = path.join(process.cwd(), 'src', 'data', 'catechism-full.js');

if (!fs.existsSync(SRC_PT)) {
  console.error('Fonte PT não encontrada:', SRC_PT);
  process.exit(1);
}

// Mapeamento de cada parágrafo para a Seção do app (range-based).
// Reusa a estrutura definida em src/data/catechism.js.
import { CATECHISM_SECTIONS } from '../src/data/catechism.js';

function sectionForParagraph(n) {
  return CATECHISM_SECTIONS.find((s) => n >= s.range[0] && n <= s.range[1])?.id || null;
}

function partForSection(sectionId) {
  const s = CATECHISM_SECTIONS.find((x) => x.id === sectionId);
  return s?.partId || null;
}

function vaticanUrlFor(n) {
  // URLs do vatican.va seguem padrão. Aproximação: agrupa por capítulo de Parte.
  if (n <= 49) return 'https://www.vatican.va/archive/cathechism_po/index_new/p1s1c1_26-49_po.html';
  if (n <= 141) return 'https://www.vatican.va/archive/cathechism_po/index_new/p1s1c2_50-141_po.html';
  if (n <= 421) return 'https://www.vatican.va/archive/cathechism_po/index_new/p1s2cap1_198-421_po.html';
  if (n <= 682) return 'https://www.vatican.va/archive/cathechism_po/index_new/p1s2cap2_422-682_po.html';
  if (n <= 1065) return 'https://www.vatican.va/archive/cathechism_po/index_new/p1s2cap3_683-1065_po.html';
  if (n <= 1419) return 'https://www.vatican.va/archive/cathechism_po/index_new/p2s2cap1_1210-1419_po.html';
  if (n <= 1532) return 'https://www.vatican.va/archive/cathechism_po/index_new/p2s2cap2_1420-1532_po.html';
  if (n <= 2051) return 'https://www.vatican.va/archive/cathechism_po/index_new/p3s1cap3_1949-2051_po.html';
  if (n <= 2557) return 'https://www.vatican.va/archive/cathechism_po/index_new/p3s2cap2_2196-2557_po.html';
  return 'https://www.vatican.va/archive/cathechism_po/index_new/prima-pagina_po.html';
}

const paragraphs = [];
for (let n = 1; n <= 2865; n++) {
  const fileName = `p${String(n).padStart(4, '0')}.txt`;
  const ptPath = path.join(SRC_PT, fileName);
  const enPath = path.join(SRC_EN, fileName);

  if (!fs.existsSync(ptPath)) continue;
  const text = fs.readFileSync(ptPath, 'utf8').trim();
  const textEn = fs.existsSync(enPath) ? fs.readFileSync(enPath, 'utf8').trim() : null;

  const sectionId = sectionForParagraph(n);
  const partId = partForSection(sectionId);

  paragraphs.push({
    n,
    text,
    textEn,
    sectionId,
    partId,
    vaticanUrl: vaticanUrlFor(n),
  });
}

const content = `// Catecismo completo (gerado por scripts/convert-catechism.mjs).
// Não editar à mão. Re-gere a partir das fontes oficiais.
export const CATECHISM_FULL = ${JSON.stringify(paragraphs)};
`;

fs.writeFileSync(OUTPUT, content);
console.log(`Gerado ${OUTPUT}: ${paragraphs.length} parágrafos.`);
console.log(`Tamanho: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
console.log('Próximo passo: em src/data/catechism.js, importe CATECHISM_FULL e use no lugar de CATECHISM_PARAGRAPHS.');
