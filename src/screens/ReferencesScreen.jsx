import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { references, translateRef, translateAuthor, translateYear, BOOK_PT_TO_EN } from '../data/references';
import { referencesEn } from '../data/references-en';
import { REFERENCE_SOURCES } from '../data/referenceSources';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import SectionBanner from '../components/SectionBanner';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

const SOURCES_EN = { 'Todos': 'All', 'Bíblia': 'Bible', 'Catecismo': 'Catechism', 'Documentos': 'Documents', 'Teólogos': 'Theologians', 'Outros': 'Others' };
const translateSource = (s, isEn) => (isEn ? (SOURCES_EN[s] || s) : s);

// Translate verbose Portuguese fullSource strings for Bible and Catechism entries.
const FS_GOSPEL = {
  'São Mateus': 'Matthew', 'São Marcos': 'Mark', 'São Lucas': 'Luke', 'São João': 'John',
};
const translateFullSource = (fs, isEn) => {
  if (!isEn || !fs) return fs;
  // Catechism
  if (fs.startsWith('Catecismo da Igreja Católica')) {
    return fs
      .replace('Catecismo da Igreja Católica', 'Catechism of the Catholic Church')
      .replace(/,?\s*parágrafos?\s*/gi, ' §')
      .replace(/\s+a\s+(\d)/g, '-$1');
  }
  // Gospel pattern
  for (const [ptName, enName] of Object.entries(FS_GOSPEL)) {
    if (fs.startsWith(`Evangelho segundo ${ptName}`)) {
      return fs
        .replace(`Evangelho segundo ${ptName}`, `Gospel of ${enName}`)
        .replace(/,?\s*capítulo\s*/gi, ', chapter ')
        .replace(/,?\s*versículos?\s*/gi, ', verse')
        .replace(/\s+a\s+(\d)/g, '-$1');
    }
  }
  // Other Bible books and letters
  const biblePrefixes = [
    ['Primeira Carta a Timóteo', 'First Letter to Timothy'],
    ['Segunda Carta a Timóteo', 'Second Letter to Timothy'],
    ['Primeira Carta aos Coríntios', 'First Letter to the Corinthians'],
    ['Segunda Carta aos Coríntios', 'Second Letter to the Corinthians'],
    ['Primeira Carta de São Pedro', 'First Letter of Peter'],
    ['Segunda Carta de São Pedro', 'Second Letter of Peter'],
    ['Primeira Carta de São João', 'First Letter of John'],
    ['Carta de São Tiago', 'Letter of James'],
    ['Carta aos Romanos', 'Letter to the Romans'],
    ['Carta aos Hebreus', 'Letter to the Hebrews'],
    ['Carta aos Gálatas', 'Letter to the Galatians'],
    ['Carta aos Efésios', 'Letter to the Ephesians'],
    ['Carta aos Filipenses', 'Letter to the Philippians'],
    ['Carta aos Colossenses', 'Letter to the Colossians'],
    ['Carta aos Tessalonicenses', 'Letter to the Thessalonians'],
    ['Segunda Carta aos Tessalonicenses', 'Second Letter to the Thessalonians'],
    ['Livro do Gênesis', 'Book of Genesis'],
    ['Livro do Êxodo', 'Book of Exodus'],
    ['Livro do Deuteronômio', 'Book of Deuteronomy'],
    ['Segundo Livro dos Macabeus', 'Second Book of Maccabees'],
    ['Apocalipse de São João', 'Book of Revelation'],
    ['Atos dos Apóstolos', 'Acts of the Apostles'],
  ];
  for (const [pt, en] of biblePrefixes) {
    if (fs.startsWith(pt)) {
      return fs
        .replace(pt, en)
        .replace(/,?\s*capítulo\s*/gi, ', chapter ')
        .replace(/,?\s*versículos?\s*/gi, ', verse')
        .replace(/\s+a\s+(\d)/g, '-$1');
    }
  }
  return fs;
};

const refsWithEn = references.map((r) => {
  const en = referencesEn[r.id];
  return en ? { ...r, ...en } : r;
});

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
        <Text style={styles.cardRef}>{isEn ? (item.refEn || translateRef(item.ref, isEn)) : item.ref}</Text>
        <Text style={styles.cardFullSource}>{isEn ? (item.fullSourceEn || translateFullSource(item.fullSource, isEn)) : item.fullSource}</Text>
        {(item.author || item.year) && (() => {
          const displayAuthor = isEn ? (item.authorEn || translateAuthor(item.author, isEn)) : item.author;
          const displayYear = isEn ? (item.yearEn || translateYear(item.year, isEn)) : item.year;
          return (
            <Text style={styles.cardMeta}>
              {displayAuthor}{displayAuthor && displayYear ? ' · ' : ''}{displayYear}
            </Text>
          );
        })()}
        <Text style={styles.cardTopic}>{isEn ? (item.topicEn || item.topic) : item.topic}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.expanded}>
          <Text style={styles.cardText}>{isEn ? (item.textEn || item.text) : item.text}</Text>

          {isEn && !item.textEn && item.text && (
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
              <Text style={styles.origMeaning}>{isEn ? (item.meaningEn || item.originalLanguage.meaning) : item.originalLanguage.meaning}</Text>
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
              <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenUrl(isEn ? (item.urlEn || item.url) : item.url)}>
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
  const [expanded, setExpanded] = useState(null);
  const listRef = useRef(null);

  // Memoiza estilos pra que a ref não mude entre renders (StyleSheet.create
  // sempre retorna objeto novo). Sem isso, todos os cards re-renderizam.
  const styles = useMemo(() => makeStyles(colors, fs), [colors, fs]);

  // Seções agrupadas por fonte, na ordem de REFERENCE_SOURCES (ignora vazias).
  const sections = useMemo(
    () =>
      REFERENCE_SOURCES
        .map((s) => ({ meta: s, data: refsWithEn.filter((r) => r.source === s.id) }))
        .filter((s) => s.data.length > 0),
    []
  );

  // Abre + scrolla até a referência quando chega via deep link.
  useEffect(() => {
    const scheduledTimeouts = [];

    const handleHighlight = () => {
      const id = route?.params?.highlightId;
      if (!id) return;

      setExpanded(id);

      let sectionIndex = -1;
      let itemIndex = -1;
      for (let si = 0; si < sections.length; si++) {
        const ii = sections[si].data.findIndex((r) => r.id === id);
        if (ii >= 0) { sectionIndex = si; itemIndex = ii; break; }
      }
      if (sectionIndex < 0) return;

      const scrollTry = (animated) => {
        try {
          listRef.current?.scrollToLocation({ sectionIndex, itemIndex, viewPosition: 0.15, animated });
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
  }, [route?.params?.highlightId, navigation, sections]);

  // Volta ao topo quando o usuário aperta o tab Referências de novo
  useEffect(() => {
    const unsub = navigation.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setExpanded(null);
        try {
          listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, viewPosition: 0, animated: true });
        } catch {}
      }
    });
    return unsub;
  }, [navigation]);

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  // Callbacks estáveis pra que props do RefCard não mudem desnecessariamente
  const handleToggle = useCallback((id) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  const handleOpenUrl = useCallback((url) => {
    if (!url) return;
    let finalUrl = url;
    if (isEn) {
      if (url.includes('cathechism_po')) {
        finalUrl = 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM';
      } else if (url.includes('_po.html')) {
        finalUrl = url.replace(/_po\.html/, '_en.html');
      } else if (url.includes('/pt/')) {
        finalUrl = url.replace('/pt/', '/en/');
      } else if (url.includes('pt.wikipedia.org')) {
        finalUrl = url.replace('pt.wikipedia.org', 'en.wikipedia.org');
      }
    }
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
      <View style={styles.itemWrap}>
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
      </View>
    ),
    [expanded, colors.accent, colors.textSubtle, styles, handleToggle, handleOpenInBible, handleOpenUrl, t, isEn]
  );

  const countLabel = (n) =>
    isEn ? `${n} ${n === 1 ? 'reference' : 'references'}` : `${n} ${n === 1 ? 'referência' : 'referências'}`;

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <SectionBanner
        icon={section.meta.icon}
        title={translateSource(section.meta.id, isEn)}
        subtitle={t(`source.${section.meta.id}.desc`)}
        countLabel={countLabel(section.data.length)}
      />
    ),
    [isEn, t]
  );

  return (
    <View style={styles.container}>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(r) => r.id}
        // Sticky só no mobile: no react-native-web os cabeçalhos se sobrepõem.
        stickySectionHeadersEnabled={Platform.OS !== 'web'}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma referência encontrada.</Text>}
        // Performance: limita quantos itens são montados de uma vez
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews
        onScrollToIndexFailed={() => {}}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      />
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    itemWrap: { paddingHorizontal: 16, paddingTop: 10 },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
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
