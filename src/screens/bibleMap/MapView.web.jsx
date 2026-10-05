import { useRef, useEffect } from 'react';

// Renderizador do mapa na web: <iframe srcDoc>. Sem react-native-webview.
// step -> postMessage({type:'setStep'}) para o iframe; seleção de pino ->
// window 'message' vindo do iframe (window.parent.postMessage no mapHtml).
// O HTML muda com o tema e o idioma e o iframe recarrega: no `load` o mapa
// recebe o passo atual sem animação, para não voltar à parada 1.
function postStep(frame, n, instant) {
  frame?.contentWindow?.postMessage(JSON.stringify({ type: 'setStep', n, instant }), '*');
}

export default function MapView({ html, step, onSelectPlace, style, title }) {
  const ref = useRef(null);
  const stepRef = useRef(step);
  const onSelectRef = useRef(onSelectPlace);

  useEffect(() => {
    onSelectRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    const onMessage = (e) => {
      // Só mensagens do próprio iframe do mapa.
      if (e.source !== ref.current?.contentWindow) return;
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d && d.type === 'selectPlace' && typeof d.idx === 'number') onSelectRef.current?.(d.idx);
      } catch {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    stepRef.current = step;
    postStep(ref.current, step, false);
  }, [step]);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={html}
      onLoad={() => postStep(ref.current, stepRef.current, true)}
      style={{
        display: 'block',
        border: 'none',
        width: '100%',
        height: '100%',
        backgroundColor: style?.backgroundColor,
      }}
    />
  );
}
