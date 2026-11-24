// Regras de largura da janela, puras (testes em tests/layout.test.mjs).
// O hook useLayout (src/hooks/useLayout.js) liga isto ao useWindowDimensions.
//
// Três faixas de navegação:
// - 'bar': celular, barra de abas de ponta a ponta no rodapé;
// - 'capsule': tablet e janela média, cápsula flutuante no rodapé;
// - 'sidebar': desktop, barra lateral fixa à esquerda, o conteúdo começa
//   depois dela (sidebarWidth).
// pageMax é a largura útil das telas de navegação (Início, Artigos, Praticar,
// livros da Bíblia, Ajustes, listas) no desktop: quase a tela toda, com o
// conteúdo em colunas (ui/Columns) para não sobrar buraco. A leitura continua
// em COLUMN_MAX (ReadingColumn.jsx), que é a medida boa de linha.
export const LAYOUT = {
  capsuleAt: 768,
  sidebarAt: 1024,
  sidebarWidth: 248,
  pageMax: 1600,
};

export function navModeFor(windowWidth) {
  if (windowWidth >= LAYOUT.sidebarAt) return 'sidebar';
  if (windowWidth >= LAYOUT.capsuleAt) return 'capsule';
  return 'bar';
}

// Largura que sobra para as telas (a janela menos a barra lateral, se houver).
export function contentWidthFor(windowWidth) {
  return navModeFor(windowWidth) === 'sidebar' ? windowWidth - LAYOUT.sidebarWidth : windowWidth;
}

// Margem lateral que centra uma coluna de `max` numa área de `width`, nunca
// menor que `min` (o recuo do celular).
export function sideMargin(width, max, min) {
  return Math.max(min, (width - max) / 2);
}

// Quantas colunas de pelo menos `minCell` cabem em `innerWidth` com `gap`
// entre elas, de 1 até `maxCols`.
export function gridColumns(innerWidth, minCell, gap, maxCols) {
  const fit = Math.floor((innerWidth + gap) / (minCell + gap));
  return Math.max(1, Math.min(maxCols, fit));
}

// Reparte `items` em `k` colunas, em rodízio (o 1º na coluna 1, o 2º na 2...),
// para as colunas terem alturas parecidas e a leitura seguir da esquerda para
// a direita. Colunas vazias não entram.
export function spreadColumns(items, k) {
  const cols = Array.from({ length: Math.max(1, Math.min(k, items.length)) }, () => []);
  items.forEach((item, i) => cols[i % cols.length].push(item));
  return items.length ? cols : [];
}
