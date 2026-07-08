import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { references, translateRef, translateAuthor, translateYear } from '../data/references';
import { referencesEn } from '../data/references-en';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

const VATICAN_BASE_PT = 'https://www.vatican.va/archive/cathechism_po/index_new/prima-pagina-cic_po.html';
const VATICAN_BASE_EN = 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM';

// Tela dedicada para abrir UMA referencia especifica vindo da Search.
// Em vez de renderizar a lista inteira de refs e fazer scroll animado ate a buscada
// (que causa pulo/travada visivel), mostra direto a referencia expandida.
export default function SearchedRefScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const refId = route?.params?.highlightId;
  const item = references.find((r) => r.id === refId);
  // Traduções EN (mesmo padrão da lista de Referências): campo a campo com
  // fallback pro português quando a tradução não existe.
  const en = (item && referencesEn[item.id]) || {};

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{isEn ? 'Reference not found.' : 'Referência não encontrada.'}</Text>
      </View>
    );
  }

  const openInBible = () => {
    // Algumas referências divergem de capítulo/versículo entre a Bíblia PT
    // (Ave Maria) e EN (Douay-Rheims), ex.: Joel 3,4 (PT) = Joel 2,31 (EN).
    const nav = (isEn && item.bibleNavEn) || item.bibleNav;
    if (!nav) return;
    navigation.navigate('Bíblia', {
      bookId: nav.bookId,
      chapter: nav.chapter,
      highlightVerse: nav.verse,
      highlightVerseEnd: nav.verseEnd,
    });
  };

  const openUrl = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  // Catecismo: agora redireciona pro site do Vaticano (PT ou EN conforme idioma).
  const isCatechismRef = item.id?.startsWith('cic-');
  const openInCatechism = () => {
    const url = item.url || (isEn ? VATICAN_BASE_EN : VATICAN_BASE_PT);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{(() => {
              const m = { 'Bíblia': 'Bible', 'Catecismo': 'Catechism', 'Documentos': 'Documents', 'Teólogos': 'Theologians', 'Outros': 'Others' };
              return isEn ? (m[item.source] || item.source) : item.source;
            })()}</Text>
          </View>
          <Text style={styles.cardRef}>{isEn ? (en.refEn || translateRef(item.ref, isEn)) : item.ref}</Text>
          <Text style={styles.cardFullSource}>{isEn ? (en.fullSourceEn || item.fullSource) : item.fullSource}</Text>
          {(item.author || item.year) && (() => {
            const displayAuthor = isEn ? (en.authorEn || translateAuthor(item.author, isEn)) : item.author;
            const displayYear = isEn ? (en.yearEn || translateYear(item.year, isEn)) : item.year;
            return (
              <Text style={styles.cardMeta}>
                {displayAuthor}{displayAuthor && displayYear ? ' · ' : ''}{displayYear}
              </Text>
            );
          })()}
          <Text style={styles.cardTopic}>{isEn ? (en.topicEn || item.topic) : item.topic}</Text>

          <View style={styles.expanded}>
            <Text style={styles.cardText}>{isEn ? (en.textEn || item.text) : item.text}</Text>

            {item.originalLanguage && (
              <View style={styles.origBox}>
                <View style={styles.origHeader}>
                  <Ionicons name="language-outline" size={14} color={colors.accent} />
                  <Text style={styles.origLabel}>
                    {isEn ? `Original in ${item.originalLanguage.language}` : `Original em ${item.originalLanguage.language}`}
                  </Text>
                </View>
                <Text style={styles.origWord}>{item.originalLanguage.word}</Text>
                <Text style={styles.origTransliteration}>
                  /{item.originalLanguage.transliteration}/
                </Text>
                <Text style={styles.origMeaning}>{isEn ? (en.meaningEn || item.originalLanguage.meaning) : item.originalLanguage.meaning}</Text>
                <Text style={styles.origStrongs}>
                  {isEn ? `Strong's ${item.originalLanguage.strongs}` : `Concordância Strong ${item.originalLanguage.strongs}`}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              {item.bibleNav && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={openInBible}
                >
                  <Ionicons name="bookmark-outline" size={16} color="#fff" />
                  <Text style={styles.actionTextPrimary}>{t('ref.readInApp')}</Text>
                </TouchableOpacity>
              )}
              {isCatechismRef && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={openInCatechism}
                >
                  <Ionicons name="open-outline" size={16} color="#fff" />
                  <Text style={styles.actionTextPrimary}>{t('ref.openCatechism')}</Text>
                </TouchableOpacity>
              )}
              {item.url && !isCatechismRef && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => openUrl(item.url)}>
                  <Ionicons name="open-outline" size={16} color={colors.accent} />
                  <Text style={styles.actionText}>{t('ref.openSource')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: c.bg },
    muted: { fontSize: fs(13), color: c.textMuted, textAlign: 'center' },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: c.accent,
    },
    badge: {
      backgroundColor: c.badgeBg,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    badgeText: { fontSize: fs(11), color: c.badgeText, fontWeight: 'bold' },
    cardRef: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText },
    cardFullSource: { fontSize: fs(12), color: c.textMuted, marginTop: 2 },
    cardMeta: { fontSize: fs(11), color: c.textSubtle, marginTop: 2, fontStyle: 'italic' },
    cardTopic: { fontSize: fs(12), color: c.textSubtle, marginTop: 4 },
    expanded: { marginTop: 10, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 10 },
    cardText: { fontSize: fs(15), color: c.text, lineHeight: fs(24) },
    origBox: {
      marginTop: 14,
      padding: 14,
      borderRadius: 10,
      backgroundColor: c.badgeBg,
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
    },
    origHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    origLabel: {
      fontSize: fs(10),
      color: c.accentText,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    origWord: { fontSize: fs(22), color: c.primaryText, fontWeight: 'bold', marginBottom: 2 },
    origTransliteration: { fontSize: fs(13), color: c.textMuted, fontStyle: 'italic', marginBottom: 8 },
    origMeaning: { fontSize: fs(13), color: c.text, lineHeight: fs(20), marginBottom: 8 },
    origStrongs: { fontSize: fs(11), color: c.textSubtle, fontWeight: '600' },
    actions: { marginTop: 12, gap: 8 },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.accent,
      alignSelf: 'flex-start',
    },
    actionBtnPrimary: { backgroundColor: c.accent, borderColor: c.accent },
    actionText: { color: c.accentText, fontSize: fs(13), fontWeight: '600' },
    actionTextPrimary: { color: '#fff', fontSize: fs(13), fontWeight: '600' },
  });
