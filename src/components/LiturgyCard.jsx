import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLiturgy, getLiturgicalColorHex, getLiturgicalColorMeaning } from '../services/liturgyApi';
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
              {liturgy?.cor && getLiturgicalColorMeaning(liturgy.cor) ? (
                <Text style={styles.colorMeaning} numberOfLines={3}>
                  {getLiturgicalColorMeaning(liturgy.cor)}
                </Text>
              ) : null}
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
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 4,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    icon: {
      width: 38, height: 38, borderRadius: 9,
      backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    label: { fontSize: fs(11), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    title: { fontSize: fs(13), color: c.text, fontWeight: '600', marginTop: 3, lineHeight: fs(18) },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
    colorPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    colorDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: c.divider },
    metaText: { fontSize: fs(11), color: c.textMuted },
    colorMeaning: { fontSize: fs(11), color: c.textMuted, marginTop: 6, lineHeight: fs(15), fontStyle: 'italic' },
    error: { fontSize: fs(12), color: c.textMuted, marginTop: 4, fontStyle: 'italic' },
  });
