import { useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDecay, withTiming } from 'react-native-reanimated';

// Imagem em tela cheia com zoom no ponto tocado (pinça, toque duplo, roda do
// mouse) e arrasto. Ocupa o contêiner inteiro (absoluteFill) e não tem moldura:
// quem desenha barra, legenda e botão de fechar é o pai (ImageZoomModal ou o
// visualizador de obras, quando cai na imagem local).
//
// WEB: gestos por eventos DOM escrevendo direto nos shared values, porque o
// Pan do gesture-handler na web arrasta com atraso.
// NATIVO: gesture-handler na UI thread. A pinça mantém sob os dedos o ponto da
// imagem que estava sob eles no começo (e por isso também arrasta com dois
// dedos), o arrasto tem limite na borda da imagem e inércia ao soltar, e o
// toque duplo corre em paralelo: antes ele era exclusivo e cada gesto
// esperava ~300 ms ele falhar, o atraso que se sentia no celular.
const MAX_SCALE = 6;
const DOUBLE_TAP_SCALE = 2.5;
const isWeb = Platform.OS === 'web';
const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

// Proporção (largura / altura) de uma imagem local; 1,5 enquanto não se sabe.
function localAspect(source) {
  try {
    const r = Image.resolveAssetSource?.(source);
    if (r?.width && r?.height) return r.width / r.height;
  } catch {
    // Fonte remota ou formato desconhecido.
  }
  return 1.5;
}

export default function ZoomableImage({ source, hdUri, alt }) {
  const { width: W, height: H } = useWindowDimensions();
  const surfaceRef = useRef(null);
  const [hdReady, setHdReady] = useState(false);
  const [hdFailed, setHdFailed] = useState(false);
  const [aspect, setAspect] = useState(() => localAspect(source));

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  useEffect(() => {
    scale.value = 1; savedScale.value = 1;
    tx.value = 0; ty.value = 0; savedTx.value = 0; savedTy.value = 0;
    setHdReady(false); setHdFailed(false);
    setAspect(localAspect(source));
  }, [source, hdUri, scale, savedScale, tx, ty, savedTx, savedTy]);

  // Tamanho da imagem com scale 1 (contain na tela): base dos limites do arrasto.
  const baseW = Math.min(W, H * aspect);
  const baseH = baseW / aspect;

  // ---- WEB: eventos DOM ----
  useEffect(() => {
    if (!isWeb) return undefined;
    const node = surfaceRef.current;
    if (!node || !node.addEventListener) return undefined;

    const st = { panning: false, pinching: false, sx: 0, sy: 0, baseTx: 0, baseTy: 0, startDist: 0, baseScale: 1, fx: 0, fy: 0, lastTap: 0 };
    const rectOf = () => node.getBoundingClientRect();
    const limitX = (s) => Math.max(0, (baseW * s - W) / 2);
    const limitY = (s) => Math.max(0, (baseH * s - H) / 2);

    const zoomTo = (fx, fy, newScaleRaw, animated) => {
      const ns = clamp(newScaleRaw, 1, MAX_SCALE);
      const localX = (fx - W / 2 - tx.value) / scale.value;
      const localY = (fy - H / 2 - ty.value) / scale.value;
      const nx = clamp((fx - W / 2) - localX * ns, -limitX(ns), limitX(ns));
      const ny = clamp((fy - H / 2) - localY * ns, -limitY(ns), limitY(ns));
      if (animated) { scale.value = withTiming(ns); tx.value = withTiming(nx); ty.value = withTiming(ny); }
      else { scale.value = ns; tx.value = nx; ty.value = ny; }
      savedScale.value = ns;
    };
    const reset = () => { scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); savedScale.value = 1; };
    const toggle = (fx, fy) => {
      if (scale.value > 1.01) reset();
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
      const s = scale.value;
      tx.value = clamp(st.baseTx + (e.clientX - st.sx), -limitX(s), limitX(s));
      ty.value = clamp(st.baseTy + (e.clientY - st.sy), -limitY(s), limitY(s));
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
      const r = rectOf();
      if (st.pinching && e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1]);
        const ns = clamp(st.baseScale * (d / (st.startDist || 1)), 1, MAX_SCALE);
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        const localX = (st.fx - W / 2 - st.baseTx) / st.baseScale;
        const localY = (st.fy - H / 2 - st.baseTy) / st.baseScale;
        scale.value = ns;
        tx.value = clamp((cx - W / 2) - localX * ns, -limitX(ns), limitX(ns));
        ty.value = clamp((cy - H / 2) - localY * ns, -limitY(ns), limitY(ns));
        savedScale.value = ns;
      } else if (st.panning && e.touches.length === 1 && scale.value > 1) {
        const s = scale.value;
        tx.value = clamp(st.baseTx + (e.touches[0].clientX - st.sx), -limitX(s), limitX(s));
        ty.value = clamp(st.baseTy + (e.touches[0].clientY - st.sy), -limitY(s), limitY(s));
      }
    };
    const onTouchEnd = (e) => {
      if (e.touches.length === 0) {
        st.panning = false; st.pinching = false;
        if (scale.value <= 1) reset();
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
  }, [W, H, baseW, baseH, scale, savedScale, tx, ty]);

  // ---- NATIVO: gesture-handler ----
  const pinch = Gesture.Pinch()
    .onStart((e) => {
      savedScale.value = scale.value; savedTx.value = tx.value; savedTy.value = ty.value;
      focalX.value = e.focalX; focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      const ns = clamp(savedScale.value * e.scale, 1, MAX_SCALE);
      // Ponto da imagem que estava sob os dedos no começo...
      const localX = (focalX.value - W / 2 - savedTx.value) / savedScale.value;
      const localY = (focalY.value - H / 2 - savedTy.value) / savedScale.value;
      // ...continua sob o ponto médio atual dos dedos.
      const limX = Math.max(0, (baseW * ns - W) / 2);
      const limY = Math.max(0, (baseH * ns - H) / 2);
      scale.value = ns;
      tx.value = clamp((e.focalX - W / 2) - localX * ns, -limX, limX);
      ty.value = clamp((e.focalY - H / 2) - localY * ns, -limY, limY);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.01) {
        scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); savedScale.value = 1;
      }
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => { savedTx.value = tx.value; savedTy.value = ty.value; })
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      const limX = Math.max(0, (baseW * scale.value - W) / 2);
      const limY = Math.max(0, (baseH * scale.value - H) / 2);
      tx.value = clamp(savedTx.value + e.translationX, -limX, limX);
      ty.value = clamp(savedTy.value + e.translationY, -limY, limY);
    })
    .onEnd((e) => {
      if (scale.value <= 1) { tx.value = withTiming(0); ty.value = withTiming(0); return; }
      const limX = Math.max(0, (baseW * scale.value - W) / 2);
      const limY = Math.max(0, (baseH * scale.value - H) / 2);
      tx.value = withDecay({ velocity: e.velocityX, clamp: [-limX, limX] });
      ty.value = withDecay({ velocity: e.velocityY, clamp: [-limY, limY] });
    });

  const doubleTap = Gesture.Tap().numberOfTaps(2).maxDuration(300)
    .onEnd((e) => {
      if (scale.value > 1.01) {
        scale.value = withTiming(1); tx.value = withTiming(0); ty.value = withTiming(0); savedScale.value = 1;
        return;
      }
      const s = DOUBLE_TAP_SCALE;
      const localX = (e.x - W / 2 - tx.value) / scale.value;
      const localY = (e.y - H / 2 - ty.value) / scale.value;
      const limX = Math.max(0, (baseW * s - W) / 2);
      const limY = Math.max(0, (baseH * s - H) / 2);
      scale.value = withTiming(s);
      tx.value = withTiming(clamp((e.x - W / 2) - localX * s, -limX, limX));
      ty.value = withTiming(clamp((e.y - H / 2) - localY * s, -limY, limY));
      savedScale.value = s;
    });

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const imgStyle = { width: W, height: H, pointerEvents: 'none' };
  const content = (
    <Animated.View style={[StyleSheet.absoluteFill, styles.center, aStyle]}>
      <Image source={source} style={imgStyle} resizeMode="contain" accessibilityLabel={alt} />
      {hdUri && !hdFailed ? (
        <Image
          source={{ uri: hdUri }}
          style={[imgStyle, StyleSheet.absoluteFill, { opacity: hdReady ? 1 : 0 }]}
          resizeMode="contain"
          onLoad={(e) => {
            const src = e?.nativeEvent?.source;
            if (src?.width && src?.height) setAspect(src.width / src.height);
            setHdReady(true);
          }}
          onError={() => setHdFailed(true)}
        />
      ) : null}
    </Animated.View>
  );

  if (isWeb) {
    return (
      <View
        ref={surfaceRef}
        collapsable={false}
        style={[StyleSheet.absoluteFill, { touchAction: 'none', userSelect: 'none', cursor: 'grab' }]}
      >
        {content}
      </View>
    );
  }
  return (
    <GestureDetector gesture={gesture}>
      <View style={StyleSheet.absoluteFill}>{content}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});
