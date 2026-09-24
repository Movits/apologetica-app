import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Barra de progresso fina: trilha em `separator`, preenchimento em `accent`
// (dourado, só como preenchimento, nunca como texto). `value` vai de 0 a 1 e
// é limitado a esse intervalo. Os aria-value* valem no nativo (RN 0.81) e na
// web sem aviso de deprecação.
export default function ProgressBar({ value = 0, height = 3, accessibilityLabel, style }) {
  const { colors, tokens } = useTheme();
  const v = Math.min(1, Math.max(0, Number(value) || 0));
  const pct = Math.round(v * 100);

  return (
    <View
      role="progressbar"
      aria-label={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      style={[
        { height, borderRadius: tokens.radius.full, backgroundColor: colors.separator, overflow: 'hidden' },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${v * 100}%`,
          backgroundColor: colors.accent,
          borderRadius: tokens.radius.full,
        }}
      />
    </View>
  );
}
