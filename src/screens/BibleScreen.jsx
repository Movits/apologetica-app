import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Platform } from 'react-native';
import { notify } from '../utils/dialog';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { shareVerse } from '../utils/share';
import { BIBLE_BOOKS, bookName, bookShort } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRequireAccount } from '../components/GuestGate';
import {
  watchChapterHighlights, watchChapterNotes,
  addHighlight, removeHighlight,
} from '../services/userData';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import { resolveVoice, getSavedRate } from '../utils/ttsVoice';

const HIGHLIGHT_COLORS = [
  { key: 'yellow', value: '#fff3a6', labelPt: 'Marcar em amarelo', labelEn: 'Highlight in yellow' },
  { key: 'green', value: '#c8f0c0', labelPt: 'Marcar em verde', labelEn: 'Highlight in green' },
  { key: 'blue', value: '#c4dffb', labelPt: 'Marcar em azul', labelEn: 'Highlight in blue' },
  { key: 'pink', value: '#f8c4d3', labelPt: 'Marcar em rosa', labelEn: 'Highlight in pink' },
  { key: 'orange', value: '#ffd9a8', labelPt: 'Marcar em laranja', labelEn: 'Highlight in orange' },
];

export default function BibleScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { user } = useAuth();
  const { lang, t, isEn } = useLanguage();
  const bn = (b) => bookName(b, isEn);
  const bs = (b) => bookShort(b, isEn);
  const requireAccount = useRequireAccount();
  const [view, setView] = useState('books');
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [highlightVerse, setHighlightVerse] = useState(null);
  // Fim do intervalo destacado (ex.: Mt 16,18-19 destaca 18 e 19). Null = só o verso inicial.
  const [highlightVerseEnd, setHighlightVerseEnd] = useState(null);
  // Marca que chegamos a um capítulo/versículo por deep link (ref, artigo, etc.),
  // para que a seta de voltar retorne à tela de origem em vez de descer na
  // hierarquia interna da Bíblia (versículos -> capítulos -> livros).
  const [fromDeepLink, setFromDeepLink] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [actionVerse, setActionVerse] = useState(null);
  const [chapterHighlights, setChapterHighlights] = useState([]);
  const [chapterNotes, setChapterNotes] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const verseListRef = useRef(null);
  const booksScrollRef = useRef(null);
  const speakingRef = useRef(false);

  // Scroll hints separados pra cada view (books / verses).
  // Só um deles está montado por vez, então não conflitam.
  const bookHints = useScrollHints();
  const verseHints = useScrollHints();

  // Deep link de uma referência
  useEffect(() => {
    const params = route?.params;
    if (params?.bookId) {
      const b = BIBLE_BOOKS.find((x) => x.id === params.bookId);
      if (b) {
        setBook(b);
        setFromDeepLink(true);
        if (params.chapter) {
          setChapter(params.chapter);
          setHighlightVerse(params.highlightVerse ?? null);
          setHighlightVerseEnd(params.highlightVerseEnd ?? null);
          setView('verses');
        } else {
          setView('chapters');
        }
        navigation?.setParams?.({ bookId: undefined, chapter: undefined, highlightVerse: undefined, highlightVerseEnd: undefined });
      }
    }
  }, [route?.params?.bookId, route?.params?.chapter, route?.params?.highlightVerse, route?.params?.highlightVerseEnd]);

  // Volta pro início da seção quando o usuário aperta o tab Bíblia de novo
  useEffect(() => {
    const unsub = navigation?.addListener?.('tabPress', () => {
      if (!navigation.isFocused?.()) return;
      if (view !== 'books') {
        setView('books');
        setBook(null);
        setChapter(null);
        setHighlightVerse(null);
        setHighlightVerseEnd(null);
        setFilterText('');
        setFromDeepLink(false);
      } else {
        // Ja esta na view de livros: scroll pro topo
        booksScrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation, view]);

  // Botão de voltar no header (navy), como no resto do app, em vez de um botão
  // dentro do conteúdo. Title reflete o nível (livro / livro+capítulo).
  useEffect(() => {
    const goBackLevel = () => {
      if (fromDeepLink && navigation.canGoBack()) { navigation.goBack(); return; }
      if (view === 'verses') { setChapter(null); setHighlightVerse(null); setHighlightVerseEnd(null); setView('chapters'); }
      else if (view === 'chapters') { setView('books'); setBook(null); }
    };
    navigation.setOptions({
      headerTitle: view === 'verses' && book && chapter ? `${bn(book)} ${chapter}`
        : view === 'chapters' && book ? bn(book)
        : t('tab.bible'),
      headerLeft: view === 'books' ? undefined : () => (
        <TouchableOpacity
          onPress={goBackLevel}
          style={{ paddingHorizontal: 12, paddingVertical: 4 }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isEn ? 'Back' : 'Voltar'}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [view, book, chapter, fromDeepLink, isEn, navigation]);

  const chapterData = useMemo(() => {
    if (view !== 'verses' || !book || !chapter) return null;
    return getChapter(book.id, chapter, lang);
  }, [view, book?.id, chapter, lang]);

  // Subscreve às marcações e notas deste capítulo
  useEffect(() => {
    if (view !== 'verses' || !book || !chapter || !user) {
      setChapterHighlights([]);
      setChapterNotes([]);
      return;
    }
    const u1 = watchChapterHighlights(book.id, chapter, setChapterHighlights);
    const u2 = watchChapterNotes(book.id, chapter, setChapterNotes);
    return () => { u1(); u2(); };
  }, [view, book?.id, chapter, user]);

  // Mapa: { verseNumber: highlight }
  const highlightsByVerse = useMemo(() => {
    const map = {};
    chapterHighlights.forEach((h) => { map[h.verse] = h; });
    return map;
  }, [chapterHighlights]);

  // Verses with notes (Set of verse numbers) + map verse -> note id (para abrir a nota)
  const versesWithNotes = useMemo(() => {
    const s = new Set();
    chapterNotes.forEach((n) => {
      for (let v = n.verseStart; v <= n.verseEnd; v++) s.add(v);
    });
    return s;
  }, [chapterNotes]);

  const noteIdByVerse = useMemo(() => {
    const m = {};
    chapterNotes.forEach((n) => {
      for (let v = n.verseStart; v <= n.verseEnd; v++) {
        if (!(v in m)) m[v] = n.id;
      }
    });
    return m;
  }, [chapterNotes]);

  const openVerseNote = (verse) => {
    const noteId = noteIdByVerse[verse];
    if (noteId) navigation.navigate('NoteEditor', { noteId });
  };

  // Scroll até versículo destacado
  useEffect(() => {
    if (!chapterData?.verses?.length || !highlightVerse) return;
    const idx = chapterData.verses.findIndex((v) => v.n === highlightVerse);
    if (idx >= 0 && verseListRef.current) {
      setTimeout(() => {
        verseListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 });
      }, 350);
    }
  }, [chapterData, highlightVerse]);

  const onLongPressVerse = (verse) => {
    requireAccount(
      () => setActionVerse(verse),
      {
        title: isEn ? 'Highlight verse?' : 'Marcar versículo?',
        message: isEn
          ? 'To highlight verses and create notes, create a free account. Your annotations stay saved and synced across devices.'
          : 'Para marcar versículos e criar notas, crie uma conta gratuita. Suas marcações ficam salvas e sincronizadas entre dispositivos.',
        icon: 'color-fill-outline',
      }
    );
  };

  const applyHighlightError = () => isEn ? 'Could not save the highlight.' : 'Não consegui salvar a marcação.';

  const applyHighlight = async (color) => {
    if (!actionVerse) return;
    const existing = highlightsByVerse[actionVerse.n];
    try {
      if (existing) await removeHighlight(existing.id);
      if (!existing || existing.color !== color) {
        await addHighlight({ bookId: book.id, chapter, verse: actionVerse.n, color });
      }
    } catch (e) {
      notify(isEn ? 'Error' : 'Erro', e.message || applyHighlightError());
    }
    setActionVerse(null);
  };

  const openNoteEditor = () => {
    if (!actionVerse) return;
    const v = actionVerse;
    setActionVerse(null);
    navigation.navigate('NoteEditor', {
      bookId: book.id,
      chapter,
      verseStart: v.n,
      verseEnd: v.n,
    });
  };

  const copyVerse = async () => {
    if (!actionVerse) return;
    const sep = isEn ? ':' : ',';
    const refText = `${bn(book)} ${chapter}${sep}${actionVerse.n}\n${actionVerse.t}`;
    await Clipboard.setStringAsync(refText);
    setActionVerse(null);
    notify(isEn ? 'Copied' : 'Copiado', isEn ? 'Verse copied to clipboard.' : 'Versículo copiado para a área de transferência.');
  };

  const shareVerseFromMenu = () => {
    if (!actionVerse) return;
    const v = actionVerse;
    setActionVerse(null);
    shareVerse({ bookName: bn(book), chapter, verse: v.n, text: v.t });
  };

  // Narra o capítulo inteiro. Usa verse-by-verse para capítulos longos
  // (Android TTS tem limite de ~4000 chars por chamada — Genesis 1 EN excede).
  const toggleChapterTts = async () => {
    const isPlaying = await Speech.isSpeakingAsync();
    if (isPlaying || speaking) {
      speakingRef.current = false;
      Speech.stop();
      setSpeaking(false);
      return;
    }
    if (!chapterData?.verses?.length) return;
    speakingRef.current = true;
    setSpeaking(true);
    const textLang = chapterData.language === 'en' ? 'en' : 'pt';
    const [voice, rate] = await Promise.all([resolveVoice(textLang), getSavedRate()]);
    const defaultLang = textLang === 'en' ? 'en-US' : 'pt-BR';
    const intro = `${bn(book)} ${chapter}. `;
    const body = chapterData.verses.map((v) => `${v.n}. ${v.t}`).join(' ');
    const fullText = intro + body;

    const onError = () => {
      speakingRef.current = false;
      setSpeaking(false);
      notify(
        isEn ? 'Narration failed' : 'Erro na narração',
        isEn
          ? 'Could not play audio. Go to Settings → Voice to configure an English voice.'
          : 'Não foi possível reproduzir. Acesse Ajustes → Voz para configurar.',
      );
    };
    const onStopped = () => { speakingRef.current = false; setSpeaking(false); };
    const opts = {
      language: voice?.language || defaultLang,
      voice: voice?.identifier,
      rate,
      pitch: 1.0,
      onStopped,
      onError,
    };

    if (fullText.length <= 4000) {
      Speech.speak(fullText, {
        ...opts,
        onDone: () => { speakingRef.current = false; setSpeaking(false); },
      });
    } else {
      // Capítulo longo: fala versículo por versículo para não exceder limite
      const utterances = [intro.trim(), ...chapterData.verses.map((v) => `${v.n}. ${v.t}`)];
      let idx = 0;
      const speakNext = () => {
        if (!speakingRef.current || idx >= utterances.length) {
          speakingRef.current = false;
          setSpeaking(false);
          return;
        }
        Speech.speak(utterances[idx++], { ...opts, onDone: speakNext });
      };
      speakNext();
    }
  };

  // Para TTS quando capítulo muda ou tela é desmontada.
  useEffect(() => {
    return () => { speakingRef.current = false; Speech.stop(); };
  }, []);
  useEffect(() => {
    if (speaking) { speakingRef.current = false; Speech.stop(); setSpeaking(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, book?.id]);

  const styles = makeStyles(colors, fs);

  // ===== LIVROS =====
  if (view === 'books') {
    const q = filterText.trim().toLowerCase();
    const filtered = q
      ? BIBLE_BOOKS.filter((b) =>
          b.name.toLowerCase().includes(q) || b.short.toLowerCase().includes(q) ||
          b.nameEn?.toLowerCase().includes(q) || b.shortEn?.toLowerCase().includes(q))
      : BIBLE_BOOKS;

    const grouped = filtered.reduce((acc, b) => {
      const key = b.testament === 'AT'
        ? (isEn ? 'Old Testament' : 'Antigo Testamento')
        : (isEn ? 'New Testament' : 'Novo Testamento');
      (acc[key] = acc[key] || []).push(b);
      return acc;
    }, {});

    return (
      <View style={styles.container}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{isEn ? 'Holy Bible' : 'Bíblia Sagrada'}</Text>
          <Text style={styles.introSub}>
            {isEn
              ? '73 books of the Catholic canon, Douay-Rheims-Challoner translation. Long-press a verse to highlight or annotate.'
              : '73 livros do cânon católico, tradução Ave Maria. Toque e segure num versículo para marcar ou anotar.'}
          </Text>
        </View>

        <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
          <Ionicons name="search-outline" size={18} color={colors.textSubtle} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={isEn ? 'Search book...' : 'Buscar livro...'}
            value={filterText}
            onChangeText={setFilterText}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholderTextColor={colors.textSubtle}
          />
        </View>

        <View style={{ flex: 1 }}>
        <ScrollView
          ref={booksScrollRef}
          contentContainerStyle={styles.content}
          onScroll={bookHints.onScroll}
          onContentSizeChange={bookHints.onContentSizeChange}
          onLayout={bookHints.onLayout}
          scrollEventThrottle={32}
        >
          {Object.entries(grouped).map(([groupName, books]) => (
            <View key={groupName}>
              <Text style={styles.groupHeader}>{groupName}</Text>
              {books.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.bookRow}
                  onPress={() => { setBook(b); setView('chapters'); setFromDeepLink(false); }}
                >
                  <View style={styles.bookAbbrev}>
                    <Text style={styles.bookAbbrevText}>{bs(b)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookName}>{bn(b)}</Text>
                    <Text style={styles.bookMeta}>
                      {b.totalChapters} {isEn ? (b.totalChapters > 1 ? 'chapters' : 'chapter') : (b.totalChapters > 1 ? 'capítulos' : 'capítulo')}
                      {b.deutero ? (isEn ? ' · deuterocanonical' : ' · deuterocanônico') : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
          <ScrollHint direction="up" visible={bookHints.showTop} />
          <ScrollHint direction="down" visible={bookHints.showBottom} />
        </View>
      </View>
    );
  }

  // ===== CAPÍTULOS =====
  if (view === 'chapters' && book) {
    const allChapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);
    return (
      <View style={styles.container}>
        <Text style={styles.bookHeader}>{bn(book)}</Text>
        <FlatList
          key="chapters-grid"
          data={allChapters}
          keyExtractor={(c) => String(c)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chapterCell}
              onPress={() => { setChapter(item); setHighlightVerse(null); setView('verses'); setFromDeepLink(false); }}
            >
              <Text style={styles.chapterCellText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ===== VERSÍCULOS =====
  if (view === 'verses' && book && chapter) {
    const hasPrev = chapter > 1;
    const hasNext = chapter < book.totalChapters;
    const isEmpty = !chapterData?.verses?.length;
    const goPrev = () => { if (hasPrev) { setHighlightVerse(null); setHighlightVerseEnd(null); setChapter(chapter - 1); setFromDeepLink(false); } };
    const goNext = () => { if (hasNext) { setHighlightVerse(null); setHighlightVerseEnd(null); setChapter(chapter + 1); setFromDeepLink(false); } };

    return (
      <View style={styles.container}>
        <View style={styles.verseHeader}>
          <Text style={styles.verseHeaderTitle}>{bn(book)} {chapter}</Text>
          <TouchableOpacity
            onPress={toggleChapterTts}
            hitSlop={10}
            style={styles.ttsBtn}
            accessibilityRole="button"
            accessibilityLabel={speaking
              ? (isEn ? 'Stop narration' : 'Parar narração')
              : (isEn ? 'Listen to chapter' : 'Ouvir capítulo')}
          >
            <Ionicons
              name={speaking ? 'stop-circle' : 'volume-high-outline'}
              size={24}
              color={speaking ? colors.accent : colors.primaryText}
            />
          </TouchableOpacity>
        </View>

        {isEmpty ? (
          <View style={styles.center}>
            <Ionicons name="time-outline" size={48} color={colors.textSubtle} />
            <Text style={styles.errorText}>{t('bible.chapterPrep')}</Text>
            <Text style={styles.errorSub}>
              {isEn
                ? 'This chapter of the deuterocanonical books has not been added to the app yet.'
                : 'Este capítulo dos livros deuterocanônicos ainda não foi adicionado ao app.'}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
          <FlatList
            key="verses-list"
            ref={verseListRef}
            data={chapterData.verses}
            keyExtractor={(v) => String(v.n)}
            contentContainerStyle={styles.verseList}
            onScrollToIndexFailed={() => {}}
            onScroll={verseHints.onScroll}
            onContentSizeChange={verseHints.onContentSizeChange}
            onLayout={verseHints.onLayout}
            scrollEventThrottle={32}
            renderItem={({ item }) => {
              const isDeepLinked = highlightVerse && item.n >= highlightVerse && item.n <= (highlightVerseEnd || highlightVerse);
              const userHighlight = highlightsByVerse[item.n];
              const hasNote = versesWithNotes.has(item.n);
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  delayLongPress={350}
                  onLongPress={() => onLongPressVerse(item)}
                  style={[
                    styles.verseRow,
                    userHighlight && { backgroundColor: userHighlight.color },
                    isDeepLinked && !userHighlight && styles.verseRowDeepLink,
                  ]}
                >
                  <Text style={[styles.verseNum, isDeepLinked && styles.verseNumHighlight]}>
                    {item.n}
                  </Text>
                  <Text style={[
                    styles.verseText,
                    userHighlight && { color: '#1a1a1a' },
                    isDeepLinked && styles.verseTextHighlight,
                  ]}>
                    {item.t}
                  </Text>
                  {hasNote && (
                    <TouchableOpacity
                      onPress={() => openVerseNote(item.n)}
                      hitSlop={10}
                      style={{ marginLeft: 6, marginTop: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={isEn ? 'Open note' : 'Abrir nota'}
                    >
                      <Ionicons name="document-text" size={14} color={colors.accent} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            }}
          />
            <ScrollHint direction="up" visible={verseHints.showTop} />
            <ScrollHint direction="down" visible={verseHints.showBottom} />
          </View>
        )}

        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navBtn, !hasPrev && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={!hasPrev}
            accessibilityRole="button"
            accessibilityLabel={isEn ? 'Previous chapter' : 'Capítulo anterior'}
          >
            <Ionicons name="chevron-back" size={20} color={hasPrev ? colors.primaryText : colors.textSubtle} />
            <Text style={[styles.navBtnText, !hasPrev && styles.navBtnTextDisabled]}>
              {hasPrev ? `${bs(book)} ${chapter - 1}` : ''}
            </Text>
          </TouchableOpacity>
          <Text style={styles.navCurrent}>{chapter}/{book.totalChapters}</Text>
          <TouchableOpacity
            style={[styles.navBtn, !hasNext && styles.navBtnDisabled, { justifyContent: 'flex-end' }]}
            onPress={goNext}
            disabled={!hasNext}
            accessibilityRole="button"
            accessibilityLabel={isEn ? 'Next chapter' : 'Próximo capítulo'}
          >
            <Text style={[styles.navBtnText, !hasNext && styles.navBtnTextDisabled]}>
              {hasNext ? `${bs(book)} ${chapter + 1}` : ''}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={hasNext ? colors.primaryText : colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Menu de ações no long-press */}
        <Modal
          visible={!!actionVerse}
          transparent
          animationType="fade"
          onRequestClose={() => setActionVerse(null)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActionVerse(null)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalRef}>
                {bn(book)} {chapter}{isEn ? ':' : ','}{actionVerse?.n}
              </Text>
              <Text style={styles.modalVerseText} numberOfLines={3}>{actionVerse?.t}</Text>

              <Text style={styles.modalSection}>{t('bible.markColor')}</Text>
              <View style={styles.colorRow}>
                {HIGHLIGHT_COLORS.map((c) => {
                  const current = actionVerse && highlightsByVerse[actionVerse.n]?.color === c.value;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.colorDot, { backgroundColor: c.value }, current && styles.colorDotActive]}
                      onPress={() => applyHighlight(c.value)}
                      accessibilityRole="button"
                      accessibilityLabel={isEn ? c.labelEn : c.labelPt}
                    >
                      {current && <Ionicons name="checkmark" size={18} color="#333" />}
                    </TouchableOpacity>
                  );
                })}
                {actionVerse && highlightsByVerse[actionVerse.n] && (
                  <TouchableOpacity
                    style={styles.removeColorBtn}
                    onPress={() => applyHighlight(highlightsByVerse[actionVerse.n].color)}
                    accessibilityRole="button"
                    accessibilityLabel={isEn ? 'Remove highlight' : 'Remover marcação'}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.modalAction} onPress={openNoteEditor}>
                <Ionicons name="document-text-outline" size={20} color={colors.primaryText} />
                <Text style={styles.modalActionText}>{t('bible.annotate')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalAction} onPress={shareVerseFromMenu}>
                <Ionicons name="share-social-outline" size={20} color={colors.primaryText} />
                <Text style={styles.modalActionText}>{t('common.share')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalAction} onPress={copyVerse}>
                <Ionicons name="copy-outline" size={20} color={colors.primaryText} />
                <Text style={styles.modalActionText}>{t('bible.copy')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return null;
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    intro: { margin: 16, marginBottom: 8, padding: 14, backgroundColor: c.card, borderRadius: 12 },
    introTitle: { fontSize: fs(18), fontWeight: 'bold', color: c.primaryText },
    introSub: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(18), marginTop: 6 },
    searchRow: {
      flexDirection: 'row', alignItems: 'center',
      marginHorizontal: 16, marginBottom: 8,
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 12,
      borderWidth: 1.5, borderColor: 'transparent',
    },
    searchRowFocused: { borderColor: c.accent },
    searchInput: { flex: 1, height: 42, fontSize: fs(15), color: c.text, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null) },
    groupHeader: {
      fontSize: fs(13), fontWeight: 'bold', color: c.textSubtle,
      textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8,
    },
    bookRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.card, borderRadius: 10, padding: 12, marginBottom: 6, gap: 12,
    },
    bookAbbrev: {
      width: 44, height: 44, borderRadius: 10, backgroundColor: c.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    bookAbbrevText: { color: '#fff', fontWeight: 'bold', fontSize: fs(13) },
    bookName: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    bookMeta: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    backRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 6 },
    backText: { fontSize: fs(15), color: c.primaryText },
    bookHeader: { fontSize: fs(22), fontWeight: 'bold', color: c.primaryText, paddingHorizontal: 16, marginBottom: 12 },
    chapterGrid: { padding: 12 },
    chapterCell: {
      flex: 1, aspectRatio: 1, margin: 4, borderRadius: 8,
      backgroundColor: c.card, justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: c.accent,
    },
    chapterCellText: { color: c.primaryText, fontWeight: 'bold', fontSize: fs(15) },
    verseHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingBottom: 8,
    },
    verseHeaderTitle: { fontSize: fs(20), fontWeight: 'bold', color: c.primaryText, flex: 1 },
    ttsBtn: { padding: 4 },
    verseList: { padding: 16, paddingBottom: 24 },
    verseRow: { flexDirection: 'row', marginBottom: 10, padding: 8, borderRadius: 8 },
    verseRowDeepLink: { backgroundColor: c.deepLinkHl, borderLeftWidth: 3, borderLeftColor: c.accent },
    verseNum: {
      fontSize: fs(11), color: c.accent, fontWeight: 'bold',
      marginRight: 8, minWidth: 24, paddingTop: 3,
    },
    verseNumHighlight: { color: c.primaryText },
    verseText: { flex: 1, fontSize: fs(15), color: c.text, lineHeight: fs(23) },
    verseTextHighlight: { fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 8 },
    errorText: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 12 },
    errorSub: { fontSize: fs(13), color: c.textMuted, textAlign: 'center', lineHeight: fs(19) },
    navBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, paddingVertical: 10,
      borderTopWidth: 1, borderTopColor: c.divider, backgroundColor: c.card,
    },
    navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, paddingVertical: 6, paddingHorizontal: 8 },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { fontSize: fs(13), color: c.primaryText, fontWeight: '600' },
    navBtnTextDisabled: { color: c.textSubtle },
    navCurrent: { fontSize: fs(12), color: c.textMuted, fontWeight: '600', minWidth: 60, textAlign: 'center' },
    // Modal de ações
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20, paddingBottom: 32,
    },
    modalRef: { fontSize: fs(15), fontWeight: 'bold', color: c.accent, marginBottom: 4 },
    modalVerseText: { fontSize: fs(14), color: c.text, lineHeight: fs(20), marginBottom: 16 },
    modalSection: { fontSize: fs(12), fontWeight: 'bold', color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    colorRow: { flexDirection: 'row', gap: 12, marginBottom: 20, alignItems: 'center' },
    colorDot: {
      width: 38, height: 38, borderRadius: 19,
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: c.divider,
    },
    colorDotActive: { borderColor: c.primaryText, borderWidth: 2 },
    removeColorBtn: { marginLeft: 4 },
    modalAction: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.divider,
    },
    modalActionText: { fontSize: fs(15), color: c.text, fontWeight: '500' },
  });
