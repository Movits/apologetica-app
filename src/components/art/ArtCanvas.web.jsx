import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Hospedeiro web do visualizador de obras (artViewerHtml): <iframe srcDoc>.
// Comandos -> postMessage({__art, cmd, arg}) para o iframe; eventos da página
// chegam como 'message' na janela, marcados com __artViewer e conferidos pela
// origem (o próprio iframe).
const ArtCanvas = forwardRef(function ArtCanvas({ html, onEvent }, ref) {
  const frameRef = useRef(null);
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useImperativeHandle(ref, () => ({
    send(cmd, arg) {
      frameRef.current?.contentWindow?.postMessage(JSON.stringify({ __art: true, cmd, arg: arg ?? null }), '*');
    },
  }), []);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d && d.__artViewer) onEventRef.current(d);
      } catch {
        // Mensagem que não é do visualizador.
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={frameRef}
      title="artwork"
      srcDoc={html}
      allow="fullscreen"
      style={{ border: 'none', width: '100%', height: '100%', display: 'block', background: 'transparent' }}
    />
  );
});

export default ArtCanvas;
