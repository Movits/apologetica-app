import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

// Fundo translúcido do chrome (header e tab bar) no nativo: no iOS, BlurView
// do expo-blur 15.0.8 (props tint e intensity em node_modules/expo-blur/build/
// BlurView.types.d.ts) sobre a cor `material` do tema, com uma hairline na
// borda que encosta no conteúdo.
//
// Android: só a View semitransparente com `material`, SEM BlurView. É a
// decisão da Fase 0 (docs/design/pesquisa-apple.md, "BlurView no Android"):
// o único blur de verdade lá é o `dimezisBlurView`, experimental, que
// re-desfoca a tela inteira a cada pre-draw, e aqui haveria até três
// instâncias vivas ao mesmo tempo (tab bar, header do stack e barra do
// LargeTitleScreen) sobre listas rolando. O material a 72% já dá a leitura de
// "barra por cima do conteúdo" que o HIG pede onde há texto.
//
// Regras de uso:
// - Renderizar DEPOIS do conteúdo que ele desfoca na árvore (irmão seguinte
//   do ScrollView, ou dentro de uma barra que vem depois dele), para os itens
//   da barra ficarem por cima e o conteúdo passar por baixo.
// - Preenche o pai (absoluteFill); quem posiciona é a barra que o contém.
// - `edge`: onde fica a hairline. 'bottom' no header, 'top' na tab bar.
// Variante web em ChromeBackdrop.web.jsx (backdrop-filter).
export default function ChromeBackdrop({ edge = 'bottom', style }) {
  const { colors, darkMode } = useTheme();
  const fill = [StyleSheet.absoluteFill, styles.fill, { backgroundColor: colors.material }, style];
  const hairline = (
    <View
      style={[
        styles.hairline,
        edge === 'top' ? styles.top : styles.bottom,
        { backgroundColor: colors.hairline },
      ]}
    />
  );
  if (Platform.OS === 'android') {
    return <View style={fill}>{hairline}</View>;
  }
  return (
    <BlurView tint={darkMode ? 'dark' : 'light'} intensity={darkMode ? 60 : 80} style={fill}>
      {hairline}
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
