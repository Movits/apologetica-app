import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Variante web do ChromeBackdrop (mesma API do ChromeBackdrop.jsx: `edge`,
// `tone`, `radius`, `style`): um View com backdrop-filter e, por cima, o véu
// na cor do fundo do tema a 92%. O material antigo (72% com blur de 16 px)
// deixava o texto que rolava por baixo legível através das barras; a 92% com
// o desfoque mais forte fica só a sombra das formas, que é o que dá a
// sensação de camada sem competir com o conteúdo.
//
// O react-native-web 0.21 repassa qualquer propriedade long-form e só rejeita
// os shorthands listados em node_modules/react-native-web/dist/exports/
// StyleSheet/validate.js:11-21 (background, outline, borderTop...).
// `backdropFilter` ganha o prefixo -webkit- sozinho (dist/modules/
// prefixStyles/static.js:58); o WebkitBackdropFilter explícito cobre o Safari
// antigo que ignora o prefixador. O backdrop-filter segue o border-radius do
// próprio elemento, então `radius` basta para a forma arredondada.
//
// Mesma regra do nativo: renderizar depois do conteúdo que ele desfoca, e
// posicionado pela barra que o contém (absoluteFill).
const BLUR = 'blur(24px) saturate(180%)';
const VEIL = 0.92;

export default function ChromeBackdrop({ edge = 'bottom', tone = 'bg', radius, style }) {
  const { colors } = useTheme();
  const base = tone === 'elevated' ? colors.elevated : colors.bg;
  const round = radius != null ? { borderRadius: radius, overflow: 'hidden' } : null;
  let line = null;
  if (edge === 'all') {
    line = [StyleSheet.absoluteFill, styles.outline, { borderColor: colors.hairline }, round];
  } else if (edge === 'top' || edge === 'bottom') {
    line = [styles.hairline, edge === 'top' ? styles.top : styles.bottom, { backgroundColor: colors.hairline }];
  }
  return (
    <View style={[StyleSheet.absoluteFill, styles.fill, round, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: base, opacity: VEIL }, round]} />
      {line ? <View style={line} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    pointerEvents: 'none',
    backdropFilter: BLUR,
    WebkitBackdropFilter: BLUR,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  outline: { borderWidth: StyleSheet.hairlineWidth },
  top: { top: 0 },
  bottom: { bottom: 0 },
});
