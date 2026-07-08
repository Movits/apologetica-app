import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Card visual de uma resposta a objeção, para capturar como imagem e
// compartilhar no WhatsApp (motor de crescimento organico apontado pelo
// Conselho). Renderizado offscreen com collapsable={false} para o view-shot.
const DialogueAnswerCard = forwardRef(({ objection, answer, source }, captureRef) => {
  return (
    <View ref={captureRef} collapsable={false} style={[styles.card, { width: 1080, height: 1080 }]}>
      <View style={styles.inner}>
        <Text style={styles.label}>Objeção</Text>
        <Text style={styles.objection}>“{objection}”</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Resposta</Text>
        <Text style={styles.answer}>{answer}</Text>
        {source ? <Text style={styles.source}>{source}</Text> : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.cross}>✝</Text>
        <Text style={styles.brand}>APPologética</Text>
      </View>
    </View>
  );
});

DialogueAnswerCard.displayName = 'DialogueAnswerCard';

const styles = StyleSheet.create({
  card: { backgroundColor: '#1a3a5c', padding: 80, justifyContent: 'space-between' },
  inner: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 26, color: '#c9a84c', fontWeight: 'bold', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 },
  objection: { fontSize: 46, color: '#eaf1f8', fontStyle: 'italic', lineHeight: 62, marginBottom: 44 },
  divider: { height: 2, backgroundColor: 'rgba(201,168,76,0.4)', marginBottom: 44 },
  answer: { fontSize: 42, color: '#fff', lineHeight: 60 },
  source: { fontSize: 28, color: '#b9cadb', marginTop: 36, fontStyle: 'italic' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  cross: { fontSize: 34, color: '#c9a84c' },
  brand: { fontSize: 30, color: '#c9a84c', fontWeight: 'bold', letterSpacing: 2 },
});

export default DialogueAnswerCard;
