import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// useBottomTabBarHeight() lança quando não há tab navigator por cima
// (node_modules/@react-navigation/bottom-tabs/src/utils/
// useBottomTabBarHeight.tsx:8-12: contexto undefined vira Error). Fora das
// abas (modal, auth, 'ArticleFromSearch' num stack sem tab bar) ela não
// existe, então o recuo é zero. A ordem dos hooks fica estável porque o
// useBottomTabBarHeight é sempre chamado; só o lançamento é engolido.
export default function useTabBarHeightSafe() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}
