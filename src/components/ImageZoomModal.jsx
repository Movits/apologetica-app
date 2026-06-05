import { Modal, Image, Pressable, StyleSheet, useWindowDimensions, Text, View } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Visualizador de imagem em tela cheia: mostra a obra inteira (contain) e permite
// zoom por pinça (mobile/touch), duplo-toque (1x <-> 2.5x) e arrastar quando ampliada.
// Cross-platform (web + nativo). O conteúdo do Modal é envolto em seu próprio
// GestureHandlerRootView porque no nativo o Modal fica fora da árvore raiz.
export default function ImageZoomModal({ visible, source, caption, alt, onClose }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        tx.value = withTiming(0); ty.value = withTiming(0); sx.value = 0; sy.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) { tx.value = sx.value + e.translationX; ty.value = sy.value + e.translationY; }
    })
    .onEnd(() => {
      if (scale.value > 1) { sx.value = tx.value; sy.value = ty.value; }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1); savedScale.value = 1;
        tx.value = withTiming(0); ty.value = withTiming(0); sx.value = 0; sy.value = 0;
      } else {
        scale.value = withTiming(2.5); savedScale.value = 2.5;
      }
    });

  const gesture = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan));

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const close = () => {
    scale.value = 1; savedScale.value = 1; tx.value = 0; ty.value = 0; sx.value = 0; sy.value = 0;
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.center, aStyle]}>
            <Image source={source} style={{ width, height }} resizeMode="contain" accessibilityLabel={alt} />
          </Animated.View>
        </GestureDetector>

        <Pressable style={[styles.close, { top: insets.top + 8 }]} onPress={close} hitSlop={12}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>

        {caption ? (
          <View pointerEvents="none" style={[styles.captionWrap, { bottom: insets.bottom + 16 }]}>
            <Text style={styles.caption}>{caption}</Text>
          </View>
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' },
  center: { justifyContent: 'center', alignItems: 'center' },
  close: {
    position: 'absolute', right: 12,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  captionWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
});
