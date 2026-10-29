import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

// Anel de progresso (0 a 1) que preenche com animação ao montar e a cada
// mudança de `value`: trilha em `separator`, preenchimento em `accent`
// (dourado só como preenchimento, nunca como texto). O que vai no centro vem
// por `children` (número do nível, placar, emblema). Reduce motion é
// respeitado pelo reanimated (ReduceMotion.System é o default).
//
// Pintado em SVG com o traço animado por `animatedProps` (strokeDashoffset),
// que o reanimated 4 aplica igual no nativo e na web.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));

// `size` vem de tokens.seal; sem `stroke`, o traço é um doze avos do lado
// (3 no anel por tema, 11 no selo do nível).
export default function XpRing({ size, stroke, value = 0, delay = 0, color, track, children, accessibilityLabel, style }) {
  const { colors, tokens } = useTheme();
  const { motion, seal } = tokens;
  const side = size ?? seal.md;
  const width = stroke ?? Math.max(3, Math.round(side / 12));
  const r = (side - width) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  const easing = useMemo(() => Easing.bezier(...motion.easing), [motion.easing]);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(clamp01(value), { duration: motion.heavy, easing }));
  }, [value, delay, progress, motion.heavy, easing]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const pct = Math.round(clamp01(value) * 100);
  const center = side / 2;

  return (
    <View
      role="progressbar"
      aria-label={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      style={[{ width: side, height: side, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Svg width={side} height={side} style={StyleSheet.absoluteFill} aria-hidden>
        <Circle cx={center} cy={center} r={r} stroke={track ?? colors.separator} strokeWidth={width} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={r}
          stroke={color ?? colors.accent}
          strokeWidth={width}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children}
    </View>
  );
}
