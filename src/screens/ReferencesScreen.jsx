import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { references } from '../data/references';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

const SOURCES = ['Todos', 'Bíblia', 'Catecismo', 'Documentos', 'Teólogos', 'Outros'];
const SOURCES_EN = { 'Todos': 'All', 'Bíblia': 'Bible', 'Catecismo': 'Catechism', 'Documentos': 'Documents', 'Teólogos': 'Theologians', 'Outros': 'Others' };
const translateSource = (s, isEn) => (isEn ? (SOURCES_EN[s] || s) : s);

const BOOK_PT_TO_EN = {
  '1 Coríntios': '1 Corinthians', '2 Coríntios': '2 Corinthians',
  '1 Tessalonicenses': '1 Thessalonians', '2 Tessalonicenses': '2 Thessalonians',
  '1 Timóteo': '1 Timothy', '2 Timóteo': '2 Timothy',
  '1 Macabeus': '1 Maccabees', '2 Macabeus': '2 Maccabees',
  '1 Pedro': '1 Peter', '2 Pedro': '2 Peter',
  '1 João': '1 John', '2 João': '2 John', '3 João': '3 John',
  'Cântico dos Cânticos': 'Song of Songs', 'Cântico': 'Song of Songs',
  'Eclesiástico': 'Sirach', 'Sabedoria': 'Wisdom',
  'Gênesis': 'Genesis', 'Êxodo': 'Exodus', 'Levítico': 'Leviticus',
  'Números': 'Numbers', 'Deuteronômio': 'Deuteronomy', 'Josué': 'Joshua',
  'Juízes': 'Judges', 'Salmos': 'Psalms', 'Salmo': 'Psalm',
  'Provérbios': 'Proverbs', 'Eclesiastes': 'Ecclesiastes',
  'Isaías': 'Isaiah', 'Jeremias': 'Jeremiah', 'Lamentações': 'Lamentations',
  'Ezequiel': 'Ezekiel', 'Oséias': 'Hosea', 'Amós': 'Amos',
  'Obadias': 'Obadiah', 'Jonas': 'Jonah', 'Miquéias': 'Micah',
  'Naum': 'Nahum', 'Habacuc': 'Habakkuk', 'Sofonias': 'Zephaniah',
  'Ageu': 'Haggai', 'Zacarias': 'Zechariah', 'Malaquias': 'Malachi',
  'Tobias': 'Tobit', 'Judite': 'Judith', 'Baruc': 'Baruch',
  'Mateus': 'Matthew', 'Marcos': 'Mark', 'Lucas': 'Luke', 'João': 'John',
  'Atos': 'Acts', 'Romanos': 'Romans', 'Gálatas': 'Galatians',
  'Efésios': 'Ephesians', 'Filipenses': 'Philippians', 'Colossenses': 'Colossians',
  'Tito': 'Titus', 'Filemon': 'Philemon', 'Hebreus': 'Hebrews',
  'Tiago': 'James', 'Judas': 'Jude', 'Apocalipse': 'Revelation',
};

const translateRef = (ref, isEn) => {
  if (!isEn || !ref) return ref;
  let result = ref;
  for (const [pt, en] of Object.entries(BOOK_PT_TO_EN)) {
    if (result.startsWith(pt + ' ') || result.startsWith(pt + ',') || result === pt) {
      result = en + result.slice(pt.length);
      break;
    }
  }
  return result.replace(/(\d),(\d)/g, '$1:$2');
};

// Card de referência separado e memoizado. Sem isso, qualquer re-render
// do ReferencesScreen (typing, scroll, focus) re-renderiza todos os 60+ itens
// visíveis, causando o aviso de VirtualizedList lenta.
const RefCard = memo(function RefCard({
  item, isOpen, accent, textSubtle, styles, onToggle, onOpenInBible, onOpenUrl, t, isEn,
}) {
  return (
    <View style={[styles.card, isOpen && styles.cardOpen]}>
      <TouchableOpacity onPress={() => onToggle(item.id)}>
        <View style={styles.cardTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{translateSource(item.source, isEn)}</Text>
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={textSubtle}
          />
        </View>
        <Text style={styles.cardRef}>{translateRef(item.ref, isEn)}</Text>
        <Text style={styles.cardFullSource}>{item.fullSource}</Text>
        {(item.author || item.year) && (
          <Text style={styles.cardMeta}>
            {item.author}{item.author && item.year ? ' · ' : ''}{item.year}
          </Text>
        )}
        <Text style={styles.cardTopic}>{item.topic}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.expanded}>
          <Text style={styles.cardText}>{item.text}</Text>

          {isEn && item.text && (
            <View style={styles.ptBadge}>
              <Ionicons name="language-outline" size={12} color={textSubtle} />
              <Text style={styles.ptBadgeText}>Content available in Portuguese only</Text>
            </View>
          )}

          {item.originalLanguage && (
            <View style={styles.origBox}>
              <View style={styles.origHeader}>
                <Ionicons name="language-outline" size={14} color={accent} />
                <Text style={styles.origLabel}>
                  {isEn ? `Original in ${item.originalLanguage.language}` : `Original em ${item.originalLanguage.language}`}
                </Text>
              </View>
              <Text style={styles.origWord}>{item.originalLanguage.word}</Text>
              <Text style={styles.origTransliteration}>
                /{item.originalLanguage.transliteration}/
              </Text>
              <Text style={styles.origMeaning}>{item.originalLanguage.meaning}</Text>
              <Text style={styles.origStrongs}>
                {isEn ? 'Strong Concordance' : 'Concordância Strong'} {item.originalLanguage.strongs}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            {item.bibleNav && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => onOpenInBible(item.bibleNav)}
              >
                <Ionicons name="bookmark-outline" size={16} color="#fff" />
                <Text style={styles.actionTextPrimary}>{t('ref.readInApp')}</Text>
              </TouchableOpacity>
            )}
            {item.url && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenUrl(item.url)}>
                <Ionicons name="open-outline" size={16} color={accent} />
                <Text style={styles.actionText}>{t('ref.openSource')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
});

export default function ReferencesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [source, setSource] = useState('Todos');
  const [expanded, setExpanded] = useState(null);
  const listRef = useRef(null);

  // Memoiza estilos pra que a ref não mude entre renders (StyleSheet.create
  // sempre retorna objeto novo). Sem isso, todos os cards re-renderizam.
  const styles = useMemo(() => makeStyles(colors, fs), [colors, fs]);

  // Abre + scrolla até a referência quando chega via deep link.
  useEffect(() => {
    const scheduledTimeouts = [];

    const handleHighlight = () => {
      const id = route?.params?.highlightId;
      if (!id) return;

      setSource('Todos');
      setExpanded(id);

      const idx = references.findIndex((r) => r.id === id);
      if (idx < 0) return;

      const scrollTry = (animated) => {
        try {
          listRef.current?.scrollToIndex({ index: idx, animated, viewPosition: 0.1 });
        } catch {}
      };
      scheduledTimeouts.push(setTimeout(() => scrollTry(false), 50));
      scheduledTimeouts.push(setTimeout(() => scrollTry(true), 300));
      scheduledTimeouts.push(setTimeout(() => scrollTry(true), 600));
    };

    handleHighlight();
    const unsub = navigation.addListener('focus', handleHighlight);

    return () => {
      unsub();
      scheduledTimeouts.forEach(clearTimeout);
    };
  }, [route?.params?.highlightId, navigation]);

  // Volta ao topo quando o usuário aperta o tab Referências de novo
  useEffect(() => {
    const unsub = navigation.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setExpanded(null);
        setSource('Todos');
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  // Memoiza a lista filtrada pra que data prop não mude por referência a cada render
  const filtered = useMemo(
    () => (source === 'Todos' ? references : references.filter((r) => r.source === source)),
    [source]
  );

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  // Callbacks estáveis pra que props do RefCard não mudem desnecessariamente
  const handleToggle = useCallback((id) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  const handleOpenUrl = useCallback((url) => {
    if (!url) return;
    const finalUrl = (isEn && url.includes('_po.html'))
      ? url.replace(/_po\.html/, '_en.html')
      : url;
    Linking.openURL(finalUrl).catch(() => {});
  }, [isEn]);

  const handleOpenInBible = useCallback(
    (nav) => {
      if (!nav) return;
      navigation.navigate('Bíblia', {
        bookId: nav.bookId,
        chapter: nav.chapter,
        highlightVerse: nav.verse,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <RefCard
        item={item}
        isOpen={expanded === item.id}
        accent={colors.accent}
        textSubtle={colors.textSubtle}
        styles={styles}
        onToggle={handleToggle}
        onOpenInBible={handleOpenInBible}
        onOpenUrl={handleOpenUrl}
        t={t}
        isEn={isEn}
      />
    ),
    [expanded, colors.accent, colors.textSubtle, styles, handleToggle, handleOpenInBible, handleOpenUrl, t, isEn]
  );

  const renderChip = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.chip, source === item && styles.chipActive]}
        onPress={() => setSource(item)}
      >
        <Text style={[styles.chipText, source === item && styles.chipTextActive]}>
          {isEn ? SOURCES_EN[item] : item}
        </Text>
      </TouchableOpacity>
    ),
    [source, styles, isEn]
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={SOURCES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.sourceList}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={renderChip}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma referência encontrada.</Text>}
          // Performance: limita quantos itens são montados de uma vez
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: (info.averageItemLength || 120) * info.index,
              animated: false,
            });
            setTimeout(() => {
              try {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.1,
                });
              } catch {}
            }, 120);
          }}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
        />
        <ScrollHint direction="up" visible={showTop} />
        <ScrollHint direction="down" visible={showBottom} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    sourceList: { maxHeight: 60, paddingLeft: 16, paddingTop: 14, marginBottom: 4 },
    chip: {
      borderWidth: 1,
      borderColor: c.divider,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginRight: 8,
      backgroundColor: c.card,
    },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { fontSize: fs(13), color: c.textMuted },
    chipTextActive: { color: '#fff', fontWeight: 'bold' },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    cardOpen: { borderWidth: 1, borderColor: c.accent },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    badge: { backgroundColor: c.badgeBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
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
      color: c.accent,
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
    actionText: { color: c.accent, fontSize: fs(13), fontWeight: '600' },
    actionTextPrimary: { color: '#fff', fontSize: fs(13), fontWeight: '600' },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
    ptBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
    ptBadgeText: { fontSize: fs(11), color: c.textSubtle, fontStyle: 'italic' },
  });
