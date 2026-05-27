import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '../context/ThemeContext';

// Modais no Android criam uma janela nativa pr\u00f3pria que n\u00e3o herda a cor da
// navigation bar configurada pelo ThemeContext (volta pro default do sistema,
// geralmente branco). Este hook reaplica a cor enquanto o modal est\u00e1 vis\u00edvel.
//
// Funciona em builds com edgeToEdgeEnabled=false (dev build atual). No Expo Go
// gera warning benigno e fica sem cor (limita\u00e7\u00e3o do ambiente).
export function useModalNavBar(visible) {
  const { colors, darkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return;
    // Aguarda a janela do modal montar antes de pintar.
    const t = setTimeout(() => {
      NavigationBar.setBackgroundColorAsync(colors.card).catch(() => {});
      NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark').catch(() => {});
    }, 50);
    return () => {
      clearTimeout(t);
      // Quando o modal fecha, reaplica nas cores do tema (\u00e0s vezes o sistema
      // reseta a janela principal tamb\u00e9m durante a transi\u00e7\u00e3o).
      NavigationBar.setBackgroundColorAsync(colors.card).catch(() => {});
      NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark').catch(() => {});
    };
  }, [visible, colors.card, darkMode]);
}
