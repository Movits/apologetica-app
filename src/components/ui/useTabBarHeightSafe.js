import { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

// useBottomTabBarHeight() lança quando não há tab navigator por cima
// (node_modules/@react-navigation/bottom-tabs/src/utils/
// useBottomTabBarHeight.tsx:8-12: contexto undefined vira Error). Fora das
// abas (modal, auth, 'ArticleFromSearch' num stack sem tab bar) ela não
// existe, então o recuo é zero. Lê o mesmo contexto (exportado em
// node_modules/@react-navigation/bottom-tabs/lib/module/index.js:16) sem o
// try/catch: `undefined` fora das abas vira 0.
export default function useTabBarHeightSafe() {
  return useContext(BottomTabBarHeightContext) ?? 0;
}
