import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Hospedeiro nativo do visualizador de obras (artViewerHtml): react-native-webview.
// Comandos -> injectJavaScript(window.__art); eventos da página -> onMessage.
// O baseUrl dá à página uma origem https, para os pedidos de ladrilho saírem
// com cabeçalho Origin normal (o acervo e a Commons respondem CORS *).
const ArtCanvas = forwardRef(function ArtCanvas({ html, onEvent, title }, ref) {
  const webRef = useRef(null);

  useImperativeHandle(ref, () => ({
    send(cmd, arg) {
      const payload = JSON.stringify(arg ?? null);
      webRef.current?.injectJavaScript(`window.__art && window.__art(${JSON.stringify(cmd)}, ${payload}); true;`);
    },
  }), []);

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      accessibilityLabel={title}
      source={{ html, baseUrl: 'https://movits.github.io/' }}
      style={styles.web}
      containerStyle={styles.web}
      onMessage={(e) => {
        try {
          onEvent(JSON.parse(e.nativeEvent.data));
        } catch {
          // Mensagem que não é do visualizador.
        }
      }}
      onError={() => onEvent({ type: 'error' })}
      javaScriptEnabled
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setBuiltInZoomControls={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      allowsInlineMediaPlayback
    />
  );
});

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: 'transparent' },
});

export default ArtCanvas;
