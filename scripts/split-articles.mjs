// Script para dividir src/data/articles.js em arquivos por categoria.
// Executar: node scripts/split-articles.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, 'src/data/articles.js');
const outDir = path.join(root, 'src/data/articles');

const src = fs.readFileSync(srcPath, 'utf8');

// Cada artigo: bloco que começa com "  {\n    id:" e termina com "    references: [...],\n  },"
const articleRegex = /  \{\n    id: \d+,[\s\S]*?references: \[[^\]]*\],\n  \},/g;
const blocks = src.match(articleRegex) || [];

console.log(`Encontrados ${blocks.length} artigos`);

const categoryToFile = {
  'Existência de Deus': 'existencia-deus',
  'Igreja Católica': 'igreja-catolica',
  'Sagrada Escritura': 'sagrada-escritura',
  'Moral': 'moral',
  'Outras Religiões': 'outras-religioes',
  'História da Igreja': 'historia-igreja',
};

const grouped = {};
const categoryOfFile = {};
for (const block of blocks) {
  const m = block.match(/category: '([^']+)'/);
  if (!m) {
    console.warn('Bloco sem category:', block.slice(0, 100));
    continue;
  }
  const cat = m[1];
  const fileName = categoryToFile[cat];
  if (!fileName) {
    console.warn('Categoria desconhecida:', cat);
    continue;
  }
  grouped[fileName] = grouped[fileName] || [];
  grouped[fileName].push(block);
  categoryOfFile[fileName] = cat;
}

fs.mkdirSync(outDir, { recursive: true });

for (const fileName of Object.keys(grouped)) {
  const cat = categoryOfFile[fileName];
  const content = `// Artigos da categoria: ${cat}.
// O campo references[] em cada artigo aponta para IDs em src/data/references.js.

const articles = [
${grouped[fileName].join('\n')}
];

export default articles;
`;
  fs.writeFileSync(path.join(outDir, `${fileName}.js`), content);
  console.log(`Escrito ${fileName}.js com ${grouped[fileName].length} artigos`);
}

const indexContent = `// Índice dos artigos. Junta todas as categorias em um único array.
// Cada artigo tem references[] apontando para IDs em references.js.

import existenciaDeus from './existencia-deus';
import igrejaCatolica from './igreja-catolica';
import sagradaEscritura from './sagrada-escritura';
import moral from './moral';
import outrasReligioes from './outras-religioes';
import historiaIgreja from './historia-igreja';

export const articles = [
  ...existenciaDeus,
  ...igrejaCatolica,
  ...sagradaEscritura,
  ...moral,
  ...outrasReligioes,
  ...historiaIgreja,
];
`;
fs.writeFileSync(path.join(outDir, 'index.js'), indexContent);
console.log('Escrito index.js');
console.log('Pronto.');
