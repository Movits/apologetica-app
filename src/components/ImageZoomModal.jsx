import { useEffect, useRef, useState } from 'react';
import { Modal, Image, Pressable, StyleSheet, useWindowDimensions, Text, View, Platform } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Visualizador de imagem em tela cheia: mostra a obra inteira (contain) e permite
// zoom NO PONTO tocado (pinça / duplo-toque / scroll do mouse) + arrastar.
//
// Detalhes que importam:
// - Gestos numa superfície NÃO transformada (coordenadas em tela => foco correto).
// - As <Image> têm pointerEvents:none (no web evita o arrasto/seleção nativos que
//   travavam o pan); a superfície usa touchAction:none + userSelect:none.
// - hdUri (alta resolução, Wikimedia via wsrv) carrega por cima da embutida e
//   aparece quando pronta; offline/erro mantém a embutida.
const MAX_SCALE = 6;
const DOUBLE_TAP_SCALE = 2.5;

export default function ImageZoomModal({ visible, source, hdUri, caption, alt, onClose }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const surfaceRef = useRef(null);
  const [hdReady, setHdReady] = useState(false);
  const [hdFailed, setHdFailed] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Reset ao abrir; recarrega a HD (cache do navegador deixa rápido).
  useEffect(() => {
    if (!visible) return;
    scale.value = 1; savedScale.value = 1;
    tx.value = 0; ty.value = 0; savedTx.value = 0; savedTy.value = 0;
    setHdReady(false); setHdFailed(false);
  }, [visible, hdUri]);

  // Zoom pelo scroll do mouse (web), centrado no cursor.
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const node = surfaceRef.current;
    if (!node || !node.addEventListener) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = node.getBoundingClientRect();
      const fx = e.clientX - rect.left;
      const fy = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const newScale = Math.max(1, Math.min(scale.value * factor, MAX_SCALE));
      const localX = (fx - W / 2 - tx.value) / scale.value;
      const localY = (fy - H / 2 - ty.value) / scale.value;
      scale.value = newScale;
      savedScale.value = newScale;
      if (newScale <= 1) { tx.value = 0; ty.value = 0; }
      else {
        tx.value = (fx - W / 2) - localX * newScale;
        ty.value = (fy - H / 2) - localY * newScale;
      }
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [visible, W, H]);

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
    .minDistance(1)
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

  const imgStyle = { width: W, height: H, pointerEvents: 'none' };
  const webSurface = Platform.OS === 'web' ? { touchAction: 'none', userSelect: 'none', cursor: 'grab' } : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View ref={surfaceRef} collapsable={false} style={[styles.root, webSurface]}>
          <GestureDetector gesture={gesture}>
            <View style={[StyleSheet.absoluteFill, webSurface]}>
              <Animated.View style={[StyleSheet.absoluteFill, styles.center, aStyle]}>
                <Image source={source} style={imgStyle} resizeMode="contain" accessibilityLabel={alt} />
                {hdUri && !hdFailed ? (
                  <Image
                    source={{ uri: hdUri }}
                    style={[imgStyle, StyleSheet.absoluteFill, { opacity: hdReady ? 1 : 0 }]}
                    resizeMode="contain"
                    onLoad={() => setHdReady(true)}
                    onError={() => setHdFailed(true)}
                  />
                ) : null}
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
        </View>
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
