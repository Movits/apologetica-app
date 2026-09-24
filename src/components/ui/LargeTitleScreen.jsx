import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import ChromeBackdrop from '../../navigation/ChromeBackdrop';

// Contêiner de tela com large title próprio (Cormorant), igual nas três
// plataformas, sem o large title nativo do iOS. O título grande rola com
// o conteúdo; a barra do topo fica transparente e, a partir de 40 pt de
// rolagem, ganha o backdrop translúcido e o título inline (reanimated 4:
// useSharedValue + useAnimatedScrollHandler + useAnimatedStyle + interpolate
// com Extrapolation.CLAMP; na web só onScroll dispara).
//
// Props:
// - title, subtitle: large title e linha abaixo dele.
// - back: { label?, onPress, a11yLabel? } mostra chevron + rótulo à esquerda.
// - right: nó com as ações da direita (ícones de 44 pt).
// - children: conteúdo rolável, dentro de um Animated.ScrollView.
// - renderList: alternativa a children para telas com FlatList própria.
//   Recebe { onScroll, scrollEventThrottle, contentContainerStyle, header } e
//   deve passar tudo à sua Animated.FlatList (header em ListHeaderComponent).
// - scrollProps: props extras para o Animated.ScrollView do caminho children
//   (keyboardShouldPersistTaps, refreshControl, ref...). Entram ANTES das
//   props do componente, então onScroll, scrollEventThrottle e
//   contentContainerStyle continuam os daqui (para recuo, use contentStyle).
//   Ignorado com renderList, que já recebe tudo pela função.
// - contentStyle: extra no contentContainerStyle.
//
// A tela é usada com header nativo desligado (headerShown: false).

// Altura da barra de navegação (HIG) e ponto em que o título inline aparece.
const BAR_HEIGHT = 44;
const COLLAPSE_AT = 40;

// useBottomTabBarHeight() lança quando não há tab navigator por cima
// (node_modules/@react-navigation/bottom-tabs/src/utils/
// useBottomTabBarHeight.tsx:8-12: contexto undefined vira Error). Fora das
// abas (modal, auth) a tab bar não existe, então o padding é zero.
function useTabBarHeightSafe() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}

function BackButton({ back, colors, tokens, text }) {
  return (
    <Pressable
      role="button"
      aria-label={back.a11yLabel ?? back.label}
      onPress={back.onPress}
      style={[styles.back, { paddingLeft: tokens.space.xxs, paddingRight: tokens.space.xs }]}
    >
      <Ionicons name="chevron-back" size={tokens.icon.lg} color={colors.tint} />
      {back.label ? (
        <Text numberOfLines={1} style={[text('body'), { color: colors.tint }]}>{back.label}</Text>
      ) : null}
    </Pressable>
  );
}

export default function LargeTitleScreen({
  title,
  subtitle,
  back,
  right,
  children,
  renderList,
  scrollProps,
  contentStyle,
}) {
  const { colors, tokens, text } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeightSafe();

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  // Some no topo, aparece ao rolar: vale para o backdrop e o título inline.
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, COLLAPSE_AT], [0, 1], Extrapolation.CLAMP),
  }));

  const barHeight = insets.top + BAR_HEIGHT;
  const contentContainerStyle = [
    {
      paddingTop: barHeight,
      paddingBottom: tabBarHeight + tokens.space.xl,
      paddingHorizontal: tokens.space.md,
    },
    contentStyle,
  ];

  const header = (
    <View style={[styles.heading, { paddingTop: tokens.space.xxs, marginBottom: tokens.space.lg }]}>
      <Text style={[text('largeTitle'), { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[text('subhead'), { color: colors.textSubtle, marginTop: tokens.space.xxs }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  const listProps = { onScroll, scrollEventThrottle: 16, contentContainerStyle };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {renderList ? (
        renderList({ ...listProps, header })
      ) : (
        <Animated.ScrollView {...scrollProps} {...listProps}>
          {header}
          {children}
        </Animated.ScrollView>
      )}

      {/* A barra vem depois do conteúdo na árvore: fica por cima dele e o
          ChromeBackdrop desfoca o que passa por baixo. */}
      <View style={[styles.bar, { height: barHeight, paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.passThrough, chromeStyle]}>
          <ChromeBackdrop edge="bottom" />
        </Animated.View>
        <View style={[styles.row, { paddingHorizontal: tokens.space.xs }]}>
          <View style={[styles.side, styles.passThrough]}>
            {back ? <BackButton back={back} colors={colors} tokens={tokens} text={text} /> : null}
          </View>
          <Animated.Text
            numberOfLines={1}
            style={[text('headline'), styles.inlineTitle, { color: colors.text }, chromeStyle]}
          >
            {title}
          </Animated.Text>
          <View style={[styles.side, styles.right, styles.passThrough]}>{right}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heading: { alignSelf: 'stretch' },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Toques fora dos botões seguem para o conteúdo por baixo.
    pointerEvents: 'box-none',
  },
  passThrough: { pointerEvents: 'box-none' },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Lados com o mesmo flex para o título ficar centrado na barra; 44 pt de
  // largura mínima reserva o alvo de toque mesmo sem botão.
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: BAR_HEIGHT,
    minHeight: BAR_HEIGHT,
  },
  right: { justifyContent: 'flex-end' },
  inlineTitle: {
    flexShrink: 1,
    textAlign: 'center',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: BAR_HEIGHT,
    minWidth: BAR_HEIGHT,
  },
});
