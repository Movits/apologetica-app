import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLiturgy, getLiturgicalColorHex } from '../services/liturgyApi';
import { useTheme } from '../context/ThemeContext';

export default function LiturgyCard({ onOpen }) {
  const { colors, fs } = useTheme();
  const [liturgy, setLiturgy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getLiturgy()
      .then((data) => mounted && setLiturgy(data))
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const styles = makeStyles(colors, fs);
  const corHex = liturgy?.cor ? getLiturgicalColorHex(liturgy.cor) : colors.accent;

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: corHex }]} onPress={onOpen}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="calendar-outline" size={20} color={colors.primaryText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Liturgia de hoje</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.accent} style={{ alignSelf: 'flex-start', marginTop: 6 }} />
          ) : error ? (
            <Text style={styles.error}>Sem conexão. Toque pra tentar.</Text>
          ) : (
            <>
              <Text style={styles.title} numberOfLines={2}>{liturgy?.liturgia}</Text>
              <View style={styles.metaRow}>
                {liturgy?.cor && (
                  <View style={styles.colorPill}>
                    <View style={[styles.colorDot, { backgroundColor: corHex }]} />
                    <Text style={styles.metaText}>{liturgy.cor}</Text>
                  </View>
                )}
                {(() => {
                  const ev = liturgy?.leituras?.evangelho;
                  const evObj = Array.isArray(ev) ? ev[0] : ev;
                  return evObj?.referencia ? (
                    <Text style={styles.metaText}>{evObj.referencia}</Text>
                  ) : null;
                })()}
              </View>
            </>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      borderLeftWidth: 3,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    icon: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    label: { fontSize: fs(10), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    title: { fontSize: fs(12), color: c.text, fontWeight: '600', marginTop: 2, lineHeight: fs(16) },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    colorPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    colorDot: { width: 9, height: 9, borderRadius: 4.5, borderWidth: 1, borderColor: c.divider },
    metaText: { fontSize: fs(10), color: c.textMuted },
    error: { fontSize: fs(11), color: c.textMuted, marginTop: 4, fontStyle: 'italic' },
  });
