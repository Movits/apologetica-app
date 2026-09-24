import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Variante web do ChromeBackdrop (mesma API do ChromeBackdrop.jsx): um View com
// a cor `material` e backdrop-filter. O react-native-web 0.21 repassa qualquer
// propriedade long-form e só rejeita os shorthands listados em
// node_modules/react-native-web/dist/exports/StyleSheet/validate.js:11-21
// (background, outline, borderTop...). `backdropFilter` ganha o prefixo
// -webkit- sozinho (dist/modules/prefixStyles/static.js:58); o
// WebkitBackdropFilter explícito cobre o Safari antigo que ignora o prefixador.
//
// Mesma regra do nativo: renderizar depois do conteúdo que ele desfoca, e
// posicionado pela barra que o contém (absoluteFill).
const BLUR = 'blur(16px) saturate(180%)';

export default function ChromeBackdrop({ edge = 'bottom', style }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.fill,
        { backgroundColor: colors.material },
        style,
      ]}
    >
      <View
        style={[
          styles.hairline,
          edge === 'top' ? styles.top : styles.bottom,
          { backgroundColor: colors.hairline },
        ]}
      />
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
  top: { top: 0 },
  bottom: { bottom: 0 },
});
