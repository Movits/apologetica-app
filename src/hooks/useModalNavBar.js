import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '../context/ThemeContext';

export function useModalNavBar(visible) {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return;
    const t = setTimeout(() => {
      NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark').catch(() => {});
    }, 50);
    return () => {
      clearTimeout(t);
      NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark').catch(() => {});
    };
  }, [visible, darkMode]);
}
