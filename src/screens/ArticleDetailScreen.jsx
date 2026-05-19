import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { articles } from '../data/articles';
import { referenceById } from '../data/references';
import { useTheme } from '../context/ThemeContext';
import { shareArticle } from '../utils/share';

export default function ArticleDetailScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const insets = useSafeAreaInsets();
  const article = articles.find((a) => a.id === route.params?.articleId);

  if (!article) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>Artigo não encontrado.</Text>
      </View>
    );
  }

  const openReference = (refId) => {
    navigation.navigate('Referências', { highlightId: refId });
  };

  const onShare = () => shareArticle({ title: article.title, summary: article.summary });

  const styles = makeStyles(colors, fs);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.category}>{article.category}</Text>
          <TouchableOpacity onPress={onShare}>
            <Ionicons name="share-social-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.body}>{article.body}</Text>

        {article.references?.length > 0 && (
          <View style={styles.refBox}>
            <Text style={styles.refTitle}>Referências</Text>
            <Text style={styles.refHint}>Toque em qualquer referência para abrir o texto completo.</Text>
            {article.references.map((refId) => {
              const r = referenceById(refId);
              if (!r) return null;
              return (
                <TouchableOpacity
                  key={refId}
                  style={styles.refItem}
                  onPress={() => openReference(refId)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.refItemRef}>{r.ref}</Text>
                    <Text style={styles.refItemSource}>
                      {r.fullSource} {r.author ? `(${r.author}` : ''}{r.year ? `, ${r.year})` : r.author ? ')' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    category: { fontSize: fs(12), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase' },
    title: { fontSize: fs(22), fontWeight: 'bold', color: c.primaryText, marginBottom: 16 },
    body: { fontSize: fs(16), color: c.text, lineHeight: fs(26) },
    refBox: { marginTop: 28, backgroundColor: c.card, borderRadius: 12, padding: 16 },
    refTitle: { fontWeight: 'bold', color: c.primaryText, marginBottom: 4, fontSize: fs(15) },
    refHint: { fontSize: fs(11), color: c.textSubtle, marginBottom: 10, fontStyle: 'italic' },
    refItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      gap: 8,
    },
    refItemRef: { fontSize: fs(14), color: c.primaryText, fontWeight: '600' },
    refItemSource: { fontSize: fs(11), color: c.textMuted, marginTop: 2 },
  });
