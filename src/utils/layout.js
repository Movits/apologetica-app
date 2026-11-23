// Regras de largura da janela, puras (testes em tests/layout.test.mjs).
// O hook useLayout (src/hooks/useLayout.js) liga isto ao useWindowDimensions.
//
// Três faixas de navegação:
// - 'bar': celular, barra de abas de ponta a ponta no rodapé;
// - 'capsule': tablet e janela média, cápsula flutuante no rodapé;
// - 'sidebar': desktop, barra lateral fixa à esquerda, o conteúdo começa
//   depois dela (sidebarWidth).
// pageMax é a largura útil das telas de navegação (Início, Artigos, Praticar,
// livros da Bíblia, Ajustes) no desktop; a leitura continua em COLUMN_MAX
// (ReadingColumn.jsx), que é a medida boa de linha.
export const LAYOUT = {
  capsuleAt: 768,
  sidebarAt: 1024,
  sidebarWidth: 248,
  pageMax: 1120,
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
