import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Card visual do versículo, usado pra capturar como imagem.
// Dimensões pensadas pra Instagram story / quadrado.
// Renderizado fora da tela (offscreen) com `collapsable={false}` pra que
// o react-native-view-shot consiga capturar.
const ShareVerseCard = forwardRef(({ text, passageRef, variant = 'square' }, captureRef) => {
  const dims = variant === 'story' ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
  return (
    <View
      ref={captureRef}
      collapsable={false}
      style={[styles.card, dims]}
    >
      <View style={styles.inner}>
        <Text style={styles.cross}>✝</Text>
        <Text style={styles.quote}>“{text}”</Text>
        <Text style={styles.ref}>{passageRef}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.brand}>APPologética</Text>
      </View>
    </View>
  );
});

ShareVerseCard.displayName = 'ShareVerseCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a3a5c',
    padding: 80,
    justifyContent: 'space-between',
  },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cross: { fontSize: 110, color: '#c9a84c', marginBottom: 40 },
  quote: {
    fontSize: 56,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 80,
    marginBottom: 40,
  },
  ref: { fontSize: 38, color: '#c9a84c', fontWeight: 'bold', letterSpacing: 1 },
  footer: { alignItems: 'center' },
  brand: { fontSize: 28, color: '#c9a84c', fontWeight: 'bold', letterSpacing: 2 },
});

export default ShareVerseCard;
