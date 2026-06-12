import { useEffect, useRef, useState } from 'react';
import { Modal, Image, Pressable, StyleSheet, useWindowDimensions, Text, View, Platform } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Visualizador de imagem em tela cheia: obra inteira (contain) + zoom no ponto
// tocado (pinça / duplo-toque / scroll) e arrastar.
//
// IMPORTANTE: na WEB os gestos são feitos por eventos DOM (mouse/touch/wheel)
// escrevendo direto nos shared values — o gesture-handler tem latência de Pan na
// web (arrasto travado). No NATIVO usamos gesture-handler (fluido na UI thread).
// A renderização (Animated.View + useAnimatedStyle) é comum e já é lisa.
const MAX_SCALE = 6;
const DOUBLE_TAP_SCALE = 2.5;
const isWeb = Platform.OS === 'web';
const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

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

  // ---- WEB: gestos por eventos DOM (escrita direta nos shared values) ----
  useEffect(() => {
    if (!isWeb || !visible) return;
    const node = surfaceRef.current;
    if (!node || !node.addEventListener) return;

    const st = { panning: false, pinching: false, sx: 0, sy: 0, baseTx: 0, baseTy: 0, startDist: 0, baseScale: 1, fx: 0, fy: 0, lastTap: 0 };
    const rectOf = () => node.getBoundingClientRect();

    const zoomTo = (fx, fy, newScaleRaw, animated) => {
      const ns = clamp(newScaleRaw, 1, MAX_SCALE);
      const localX = (fx - W / 2 - tx.value) / scale.value;
      const localY = (fy - H / 2 - ty.value) / scale.value;
      const nx = ns <= 1 ? 0 : (fx - W / 2) - localX * ns;
      const ny = ns <= 1 ? 0 : (fy - H / 2) - localY * ns;
      if (animated) { scale.value = withTiming(ns); tx.value = withTiming(nx); ty.value = withTiming(ny); }
      else { scale.value = ns; tx.value = nx; ty.value = ny; }
      savedScale.value = ns;
    };
    const toggle = (fx, fy) => {
      if (scale.value > 1.01) { scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); savedScale.value = 1; }
      else zoomTo(fx, fy, DOUBLE_TAP_SCALE, true);
    };

    const onWheel = (e) => {
      e.preventDefault();
      const r = rectOf();
      zoomTo(e.clientX - r.left, e.clientY - r.top, scale.value * Math.exp(-e.deltaY * 0.0015), false);
    };
    const onDblClick = (e) => {
      e.preventDefault();
      const r = rectOf();
      toggle(e.clientX - r.left, e.clientY - r.top);
    };
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      st.panning = true; st.sx = e.clientX; st.sy = e.clientY; st.baseTx = tx.value; st.baseTy = ty.value;
      node.style.cursor = 'grabbing';
    };
    const onMouseMove = (e) => {
      if (!st.panning || scale.value <= 1) return;
      tx.value = st.baseTx + (e.clientX - st.sx);
      ty.value = st.baseTy + (e.clientY - st.sy);
    };
    const onMouseUp = () => { st.panning = false; node.style.cursor = 'grab'; };

    const dist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const onTouchStart = (e) => {
      e.preventDefault();
      const r = rectOf();
      if (e.touches.length === 1) {
        const now = Date.now();
        const px = e.touches[0].clientX - r.left;
        const py = e.touches[0].clientY - r.top;
        if (now - st.lastTap < 300) { toggle(px, py); st.lastTap = 0; st.panning = false; return; }
        st.lastTap = now;
        st.panning = true; st.pinching = false;
        st.sx = e.touches[0].clientX; st.sy = e.touches[0].clientY; st.baseTx = tx.value; st.baseTy = ty.value;
      } else if (e.touches.length === 2) {
        st.pinching = true; st.panning = false;
        st.startDist = dist(e.touches[0], e.touches[1]);
        st.baseScale = scale.value; st.baseTx = tx.value; st.baseTy = ty.value;
        st.fx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        st.fy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (st.pinching && e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1]);
        const ns = clamp(st.baseScale * (d / (st.startDist || 1)), 1, MAX_SCALE);
        const localX = (st.fx - W / 2 - st.baseTx) / st.baseScale;
        const localY = (st.fy - H / 2 - st.baseTy) / st.baseScale;
        scale.value = ns;
        tx.value = ns <= 1 ? 0 : (st.fx - W / 2) - localX * ns;
        ty.value = ns <= 1 ? 0 : (st.fy - H / 2) - localY * ns;
        savedScale.value = ns;
      } else if (st.panning && e.touches.length === 1 && scale.value > 1) {
        tx.value = st.baseTx + (e.touches[0].clientX - st.sx);
        ty.value = st.baseTy + (e.touches[0].clientY - st.sy);
      }
    };
    const onTouchEnd = (e) => {
      if (e.touches.length === 0) {
        st.panning = false; st.pinching = false;
        if (scale.value <= 1) { scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); }
      } else if (e.touches.length === 1) {
        st.pinching = false; st.panning = true;
        st.sx = e.touches[0].clientX; st.sy = e.touches[0].clientY; st.baseTx = tx.value; st.baseTy = ty.value;
      }
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('dblclick', onDblClick);
    node.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd);
    return () => {
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('dblclick', onDblClick);
      node.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
    };
  }, [visible, W, H]);

  // ---- NATIVO: gesture-handler ----
  const pinch = Gesture.Pinch()
    .onStart((e) => { savedScale.value = scale.value; savedTx.value = tx.value; savedTy.value = ty.value; focalX.value = e.focalX; focalY.value = e.focalY; })
    .onUpdate((e) => {
      const ns = Math.max(1, Math.min(savedScale.value * e.scale, MAX_SCALE));
      const localX = (focalX.value - W / 2 - savedTx.value) / savedScale.value;
      const localY = (focalY.value - H / 2 - savedTy.value) / savedScale.value;
      scale.value = ns;
      tx.value = (focalX.value - W / 2) - localX * ns;
      ty.value = (focalY.value - H / 2) - localY * ns;
    })
    .onEnd(() => { savedScale.value = scale.value; if (scale.value <= 1) { scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); savedScale.value = 1; } });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => { savedTx.value = tx.value; savedTy.value = ty.value; })
    .onUpdate((e) => { if (scale.value > 1) { tx.value = savedTx.value + e.translationX; ty.value = savedTy.value + e.translationY; } })
    .onEnd(() => { if (scale.value <= 1) { tx.value = withTiming(0); ty.value = withTiming(0); } });

  const doubleTap = Gesture.Tap().numberOfTaps(2).maxDuration(300)
    .onEnd((e) => {
      if (scale.value > 1.01) { scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); savedScale.value = 1; }
      else {
        const t = DOUBLE_TAP_SCALE;
        const localX = (e.x - W / 2 - tx.value) / scale.value;
        const localY = (e.y - H / 2 - ty.value) / scale.value;
        scale.value = withTiming(t); tx.value = withTiming((e.x - W / 2) - localX * t); ty.value = withTiming((e.y - H / 2) - localY * t); savedScale.value = t;
      }
    });

  const gesture = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan));

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const close = () => {
    scale.value = 1; savedScale.value = 1; tx.value = 0; ty.value = 0; savedTx.value = 0; savedTy.value = 0;
    onClose?.();
  };

  const imgStyle = { width: W, height: H, pointerEvents: 'none' };
  const webSurface = isWeb ? { touchAction: 'none', userSelect: 'none', cursor: 'grab' } : null;

  const content = (
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
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.root}>
          {isWeb ? (
            // Camada de gesto separada: NÃO inclui o botão X, senão o preventDefault
            // do touchstart engole o clique do botão no celular.
            <View ref={surfaceRef} collapsable={false} style={[StyleSheet.absoluteFill, webSurface]}>
              {content}
            </View>
          ) : (
            <GestureDetector gesture={gesture}>
              <View style={StyleSheet.absoluteFill}>{content}</View>
            </GestureDetector>
          )}

          <Pressable
            style={[styles.close, { top: insets.top + 8 }]}
            onPress={close}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
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
