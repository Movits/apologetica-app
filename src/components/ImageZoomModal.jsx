import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ZoomableImage from './ZoomableImage';

// Visualizador simples de imagem em tela cheia: a imagem com zoom e arrasto
// (ZoomableImage), o X e a legenda. Obras de arte dos artigos abrem no
// visualizador de obras (src/components/art/ArtViewer.jsx), que cai nesta
// mesma superfície quando não há rede.
export default function ImageZoomModal({ visible, source, hdUri, caption, alt, onClose }) {
  const insets = useSafeAreaInsets();
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.root}>
          {/* A superfície de gesto não inclui o X: na web o preventDefault do
              touchstart engoliria o clique do botão no celular. */}
          {visible ? <ZoomableImage source={source} hdUri={hdUri} alt={alt} /> : null}

          <Pressable
            style={[styles.close, { top: insets.top + tokens.space.xs }]}
            onPress={onClose}
            role="button"
            aria-label={t('common.close')}
          >
            {/* O véu é escuro nos dois temas, então o X vai na cor de texto
                sobre fundo escuro da paleta. */}
            <Ionicons name="close" size={tokens.icon.lg} color={colors.onPrimary} />
          </Pressable>

          {caption ? (
            <View pointerEvents="none" style={[styles.captionWrap, { bottom: insets.bottom + tokens.space.md }]}>
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
  // Alvo de toque de 44 pelo próprio tamanho, sem área extra de toque.
  close: {
    position: 'absolute', right: 12,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  captionWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
});
