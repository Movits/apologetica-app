import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import ChromeBackdrop from '../navigation/ChromeBackdrop';
import { PressScale } from './ui';

// Pílula flutuante de capítulo da Bíblia (Onda 6): anterior, "3 de 21" e
// próximo, centrada logo acima da tab bar, com o fundo translúcido do chrome
// e a sombra `floating` só no tema claro. Quem decide se ela aparece é a
// lista de versículos, pelo shared value `visible` (1 visível, 0 escondida):
// ao esconder, além da opacidade ela desce até sair da tela, para não ficar
// tocável onde não se vê. Sem `visible` (undefined) fica sempre à vista: é o
// caso dos estados sem lista (carregando, capítulo em preparação), de onde a
// pessoa ainda precisa poder avançar de capítulo. Usa useBottomTabBarHeight()
// direto porque a tela da Bíblia é filha direta do Tab.
const TARGET = 44;

export default function ChapterPill({ label, hasPrev, hasNext, onPrev, onNext, prevLabel, nextLabel, visible }) {
  const { colors, tokens, text, darkMode } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { space, radius, icon, shadow } = tokens;

  const bottom = tabBarHeight + space.md;
  const hideDistance = bottom + TARGET;
  const motionStyle = useAnimatedStyle(() => {
    const v = visible ? visible.value : 1;
    return {
      opacity: v,
      transform: [{ translateY: (1 - v) * hideDistance }],
    };
  });

  const button = (name, a11y, enabled, onPress) => (
    <PressScale
      role="button"
      aria-label={a11y}
      aria-disabled={!enabled || undefined}
      disabled={!enabled}
      onPress={onPress}
      style={[styles.button, !enabled ? styles.disabled : null]}
    >
      <Ionicons name={name} size={icon.md} color={colors.tint} />
    </PressScale>
  );

  return (
    <View style={[styles.host, { bottom }]}>
      <Animated.View
        style={[
          styles.pill,
          { borderRadius: radius.full },
          darkMode ? null : { boxShadow: shadow.floating.boxShadow },
          motionStyle,
        ]}
      >
        <View style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius.full }]}>
          <ChromeBackdrop />
        </View>
        {button('chevron-back', prevLabel, hasPrev, onPrev)}
        <Text style={[text('subhead'), styles.label, { color: colors.text, paddingHorizontal: space.xs }]}>
          {label}
        </Text>
        {button('chevron-forward', nextLabel, hasNext, onNext)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    // Só a pílula recebe toques; o resto da faixa passa para a lista.
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TARGET,
  },
  clip: { overflow: 'hidden' },
  button: {
    width: TARGET,
    height: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  label: { fontWeight: '600', textAlign: 'center' },
});
