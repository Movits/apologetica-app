import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '../context/ThemeContext';

// Um Modal do Android abre em outra janela e volta com os ícones da navigation
// bar no padrão do sistema. Reaplica a cor dos botões conforme o tema ao abrir
// e ao fechar. API do SDK 55+: `NavigationBar.setStyle` (síncrona), com
// 'light' = botões claros sobre o tema escuro.
export function useModalNavBar(visible) {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return;
    const apply = () => {
      try {
        NavigationBar.setStyle(darkMode ? 'light' : 'dark');
      } catch {}
    };
    const t = setTimeout(apply, 50);
    return () => {
      clearTimeout(t);
      apply();
    };
  }, [visible, darkMode]);
}
