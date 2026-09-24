import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

// Fundo translúcido do chrome (header e tab bar) no nativo: BlurView do
// expo-blur 15.0.8 (props tint, intensity e experimentalBlurMethod em
// node_modules/expo-blur/build/BlurView.types.d.ts) sobre a cor `material`
// do tema, com uma hairline na borda que encosta no conteúdo.
//
// Regras de uso:
// - Renderizar DEPOIS do conteúdo que ele desfoca na árvore (irmão seguinte
//   do ScrollView, ou dentro de uma barra que vem depois dele). No Android o
//   dimezisBlurView captura o que já foi desenhado atrás; se vier antes, fica
//   um véu opaco sem desfoque.
// - Preenche o pai (absoluteFill); quem posiciona é a barra que o contém.
// - `edge`: onde fica a hairline. 'bottom' no header, 'top' na tab bar.
// - Sem experimentalBlurMethod o Android não desfoca (vira véu semitransparente).
// Variante web em ChromeBackdrop.web.jsx (backdrop-filter).
export default function ChromeBackdrop({ edge = 'bottom', style }) {
  const { colors, darkMode } = useTheme();
  return (
    <BlurView
      tint={darkMode ? 'dark' : 'light'}
      intensity={darkMode ? 60 : 80}
      experimentalBlurMethod="dimezisBlurView"
      style={[StyleSheet.absoluteFill, styles.fill, { backgroundColor: colors.material }, style]}
    >
      <View
        style={[
          styles.hairline,
          edge === 'top' ? styles.top : styles.bottom,
          { backgroundColor: colors.hairline },
        ]}
      />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  // O fundo nunca captura toques: eles seguem para os botões da barra.
  fill: { pointerEvents: 'none' },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  top: { top: 0 },
  bottom: { bottom: 0 },
});
