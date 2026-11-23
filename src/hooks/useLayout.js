import { useWindowDimensions } from 'react-native';
import { LAYOUT, contentWidthFor, navModeFor } from '../utils/layout';

// Largura e modo de navegação da janela atual (regras em src/utils/layout.js).
// `width` é a área das telas: a janela menos a barra lateral no desktop. Use
// `width` (e não useWindowDimensions) para centrar colunas e calcular grades,
// senão o conteúdo fica deslocado quando a barra lateral aparece.
export default function useLayout() {
  const { width: windowWidth, height } = useWindowDimensions();
  const navMode = navModeFor(windowWidth);
  return {
    windowWidth,
    height,
    width: contentWidthFor(windowWidth),
    navMode,
    isWide: navMode === 'sidebar',
    sidebarWidth: navMode === 'sidebar' ? LAYOUT.sidebarWidth : 0,
    pageMax: LAYOUT.pageMax,
  };
}
