import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Barra fina no topo mostrando % lido. progress entre 0 e 1.
export default function ReadingProgressBar({ progress }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, progress || 0));
  return (
    <View style={[styles.track, { backgroundColor: colors.divider }]}>
      <View
        style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: colors.accent }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, width: '100%' },
  fill: { height: '100%' },
});
