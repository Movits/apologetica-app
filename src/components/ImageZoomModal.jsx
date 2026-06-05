import { Modal, Image, Pressable, StyleSheet, useWindowDimensions, Text, View } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Visualizador de imagem em tela cheia: mostra a obra inteira (contain) e permite
// zoom NO PONTO tocado (pinça / duplo-toque) e arrastar quando ampliada.
//
// O GestureDetector envolve uma superfície NÃO transformada (coordenadas em tela);
// a Animated.View interna é que recebe scale/translate. Isso é o que faz o foco do
// zoom cair onde o dedo/mouse está, e o arrasto funcionar. O conteúdo do Modal é
// envolto em seu próprio GestureHandlerRootView (no nativo o Modal sai da raiz).
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

export default function ImageZoomModal({ visible, source, caption, alt, onClose }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      const newScale = Math.max(1, Math.min(savedScale.value * e.scale, MAX_SCALE));
      // ponto da imagem que estava sob o foco no início do gesto
      const localX = (focalX.value - W / 2 - savedTx.value) / savedScale.value;
      const localY = (focalY.value - H / 2 - savedTy.value) / savedScale.value;
      scale.value = newScale;
      tx.value = (focalX.value - W / 2) - localX * newScale;
      ty.value = (focalY.value - H / 2) - localY * newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        scale.value = withTiming(1);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedScale.value = 1;
      }
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((e) => {
      if (scale.value > 1.01) {
        scale.value = withTiming(1);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedScale.value = 1;
      } else {
        const target = DOUBLE_TAP_SCALE;
        const localX = (e.x - W / 2 - tx.value) / scale.value;
        const localY = (e.y - H / 2 - ty.value) / scale.value;
        scale.value = withTiming(target);
        tx.value = withTiming((e.x - W / 2) - localX * target);
        ty.value = withTiming((e.y - H / 2) - localY * target);
        savedScale.value = target;
      }
    });

  const gesture = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan));

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const close = () => {
    scale.value = 1; savedScale.value = 1;
    tx.value = 0; ty.value = 0; savedTx.value = 0; savedTy.value = 0;
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={gesture}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.center, aStyle]}>
              <Image source={source} style={{ width: W, height: H }} resizeMode="contain" accessibilityLabel={alt} />
            </Animated.View>
          </View>
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
