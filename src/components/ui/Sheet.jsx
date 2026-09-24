import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Folha inferior (bottom sheet) sobre um Modal transparente. Entra com mola
// (translateY da altura da tela até 0) enquanto o backdrop escurece, e fecha
// por toque no backdrop, arrasto para baixo, botão voltar do Android ou Escape
// na web (o Modal do react-native-web chama onRequestClose no keyup).
//
// Fechamento: o componente é controlado por `visible`. Qualquer pedido de
// fechar só chama `onClose`, e é o pai que zera `visible`. Quando `visible`
// cai, o Modal continua montado (`shown`) até a animação de saída terminar,
// e só então some. Se o pai ignorar o pedido, nada muda.
export default function Sheet({ visible, onClose, title, children, style }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { space, radius, motion, shadow } = tokens;

  const [shown, setShown] = useState(Boolean(visible));
  const translateY = useSharedValue(windowHeight);
  const backdrop = useSharedValue(0);
  const panelHeight = useSharedValue(0);
  const easing = useMemo(() => Easing.bezier(...motion.easing), [motion.easing]);

  const requestClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Entrada: só depende de `visible`. Fica num efeito próprio porque o
  // setShown(true) daqui muda `shown`, e um efeito único que também dependesse
  // de `shown` rodaria de novo e disparava a animação de entrada duas vezes.
  useEffect(() => {
    if (!visible) return;
    setShown(true);
    backdrop.value = withTiming(1, { duration: motion.aba, easing });
    translateY.value = withSpring(0, { duration: motion.spring, dampingRatio: 0.85 });
  }, [visible, backdrop, translateY, motion.aba, motion.spring, easing]);

  // Saída: com `visible` em falso e a folha ainda montada, anima até sumir e
  // só então desmonta o Modal. Se `visible` voltar no meio, a animação de
  // entrada cancela esta (callback com finished=false) e nada desmonta.
  useEffect(() => {
    if (visible || !shown) return;
    const target = panelHeight.value > 0 ? panelHeight.value : windowHeight;
    backdrop.value = withTiming(0, { duration: motion.aba, easing });
    translateY.value = withTiming(target, { duration: motion.aba, easing }, (finished) => {
      if (finished) scheduleOnRN(setShown, false);
    });
  }, [visible, shown, windowHeight, backdrop, translateY, panelHeight, motion.aba, easing]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .onUpdate((e) => {
          translateY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
          if (e.translationY > 120 || e.velocityY > 800) {
            scheduleOnRN(requestClose);
          } else {
            translateY.value = withSpring(0, { duration: motion.spring, dampingRatio: 0.85 });
          }
        }),
    [translateY, requestClose, motion.spring],
  );

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal
      transparent
      visible={shown}
      animationType="none"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}>
          <Pressable role="button" aria-label={t('common.close')} onPress={requestClose} style={styles.fill} />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            role="dialog"
            aria-modal
            aria-label={typeof title === 'string' ? title : undefined}
            accessibilityViewIsModal
            onLayout={(e) => {
              panelHeight.value = e.nativeEvent.layout.height;
            }}
            style={[
              {
                backgroundColor: colors.elevated,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                paddingHorizontal: space.md,
                paddingTop: space.xs,
                paddingBottom: insets.bottom + space.md,
                boxShadow: shadow.sheet.boxShadow,
              },
              panelStyle,
              style,
            ]}
          >
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: radius.full,
                backgroundColor: colors.separator,
                alignSelf: 'center',
                marginBottom: space.sm,
              }}
            />
            {title ? (
              <Text style={[text('headline'), { color: colors.text, marginBottom: space.sm }]}>{title}</Text>
            ) : null}
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  fill: { flex: 1 },
});
