import { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../utils/haptics';

// Pressable que encolhe ao toque (escala do token motion.press, mola curta) e
// volta ao soltar. É a base de Row, Button, Chip e do SearchField em modo botão.
// O alvo de toque vem do tamanho do próprio elemento (minHeight/minWidth 44),
// nunca de área extra de toque (hit slop), que a web descarta.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PressScale({
  haptic,
  role = 'button',
  style,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}) {
  const { tokens } = useTheme();
  const scale = useSharedValue(1);
  // `style` em função ({ pressed }) é resolvido aqui, porque o componente
  // animado do reanimated só entende objetos e arrays de estilo.
  const styleIsFn = typeof style === 'function';
  const [pressed, setPressed] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const spring = { duration: tokens.motion.touch, dampingRatio: 0.9 };

  const handlePressIn = (e) => {
    scale.value = withSpring(tokens.motion.press.scale, spring);
    if (styleIsFn) setPressed(true);
    onPressIn?.(e);
  };

  const handlePressOut = (e) => {
    scale.value = withSpring(1, spring);
    if (styleIsFn) setPressed(false);
    onPressOut?.(e);
  };

  const handlePress = (e) => {
    if (haptic === 'selection') haptics.selection();
    else if (haptic === 'impact') haptics.impact('light');
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      role={role}
      onPress={onPress ? handlePress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styleIsFn ? style({ pressed }) : style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
