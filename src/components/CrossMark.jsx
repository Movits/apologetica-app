import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Cruz latina do app desenhada com Views (sem PNG): nítida em qualquer tamanho,
// adapta ao tema e custo zero. `size` é a altura total. Usada como marca d'água
// decorativa nas laterais vazias do "Dia de hoje" no desktop.
export default function CrossMark({ size = 150, color, opacity = 0.16, style }) {
  const { colors } = useTheme();
  const c = color || colors.accent;
  const t = Math.round(size * 0.16);      // espessura das barras
  const w = Math.round(size * 0.62);      // largura do braço horizontal
  const radius = Math.round(t * 0.12);

  return (
    <View style={[{ width: w, height: size, opacity }, style]} pointerEvents="none">
      <View
        style={{
          position: 'absolute', left: (w - t) / 2, top: 0,
          width: t, height: size, backgroundColor: c, borderRadius: radius,
        }}
      />
      <View
        style={{
          position: 'absolute', left: 0, top: Math.round(size * 0.26),
          width: w, height: t, backgroundColor: c, borderRadius: radius,
        }}
      />
    </View>
  );
}
