import { useRef, useEffect } from 'react';

// Renderizador do mapa na web: <iframe srcDoc>. Sem react-native-webview.
// step -> postMessage({type:'setStep'}) para o iframe; seleção de pino ->
// window 'message' vindo do iframe (window.parent.postMessage no mapHtml).
export default function MapView({ html, step, onSelectPlace }) {
  const ref = useRef(null);

  useEffect(() => {
    const onMessage = (e) => {
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d && d.type === 'selectPlace' && typeof d.idx === 'number') onSelectPlace(d.idx);
      } catch {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onSelectPlace]);

  useEffect(() => {
    ref.current?.contentWindow?.postMessage(JSON.stringify({ type: 'setStep', n: step }), '*');
  }, [step]);

  return (
    <iframe
      ref={ref}
      title="map"
      srcDoc={html}
      style={{ border: 'none', width: '100%', height: '100%' }}
    />
  );
}
