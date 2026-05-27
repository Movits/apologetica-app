import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Setinha discreta indicando que há conteúdo para scrollar.
// Use com useScrollHints. Fica posicionada absoluta dentro do container pai.
// pointerEvents="none" pra não bloquear toques na lista por baixo.
export default function ScrollHint({ direction = 'down', visible, offset = 8 }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 0.55 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  // Bounce suave pra chamar atenção sem ser invasivo.
  useEffect(() => {
    if (!visible) return;
    const dir = direction === 'down' ? 3 : -3;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: dir,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, direction, translateY]);

  const positionStyle = direction === 'up' ? { top: offset } : { bottom: offset };

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.hint, positionStyle, { opacity, transform: [{ translateY }] }]}
    >
      <Ionicons
        name={direction === 'up' ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={colors.textSubtle}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: 2,
    paddingHorizontal: 14,
  },
});
