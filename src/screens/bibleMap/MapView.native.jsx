import { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

// Renderizador do mapa no nativo: react-native-webview.
// step -> injectJavaScript(window.setStep); seleção de pino -> onMessage.
export default function MapView({ html, step, onSelectPlace, style }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.injectJavaScript(`if(window.setStep){window.setStep(${step});}true;`);
  }, [step]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selectPlace' && typeof data.idx === 'number') onSelectPlace(data.idx);
    } catch {}
  };

  return (
    <WebView
      ref={ref}
      originWhitelist={['*']}
      source={{ html }}
      style={style}
      onMessage={onMessage}
      scalesPageToFit={false}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mixedContentMode="always"
      startInLoadingState
    />
  );
}
