import { useRef, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Renderizador do mapa no nativo: react-native-webview.
// step -> injectJavaScript(window.setStep); seleção de pino -> onMessage.
// O HTML muda com o tema e o idioma e a WebView recarrega: no fim do
// carregamento o mapa recebe o passo atual sem animação, para não voltar à
// parada 1. O carregando padrão da WebView tem fundo branco fixo: aqui ele
// usa o fundo do mapa, para não piscar branco no tema escuro.
function setStepJs(n, instant) {
  return `if(window.setStep){window.setStep(${n},${instant ? 'true' : 'false'});}true;`;
}

export default function MapView({ html, step, onSelectPlace, style, title }) {
  const ref = useRef(null);
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
    ref.current?.injectJavaScript(setStepJs(step, false));
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
      containerStyle={style?.backgroundColor ? { backgroundColor: style.backgroundColor } : undefined}
      accessibilityLabel={title}
      onMessage={onMessage}
      onLoadEnd={() => ref.current?.injectJavaScript(setStepJs(stepRef.current, true))}
      scalesPageToFit={false}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mixedContentMode="always"
      startInLoadingState
      renderLoading={() => (
        <View style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: style?.backgroundColor }]}>
          <ActivityIndicator />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center' },
});
