import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useModalNavBar } from '../hooks/useModalNavBar';
import { articles } from '../data/articles';
import { references } from '../data/references';
import { referencesEn } from '../data/references-en';
import { BIBLE_BOOKS, bookName, bookShort } from '../data/bible';
import { getChapter, ensureBible } from '../services/bibleApi';
import { pick } from '../utils/i18nData';
import { refLabel } from '../utils/refLabel';
import { formatVerseRef } from '../utils/verseRef';
import { Button, Chip, EmptyState, Field, Group, ListSeparator, Row, SearchField } from './ui';

// Referências já mescladas com a tradução EN (refEn, topicEn...), lidas com
// `pick` e `refLabel` para caírem no PT quando a tradução falta.
const refsWithEn = references.map((r) => {
  const en = referencesEn[r.id];
  return en ? { ...r, ...en } : r;
});

const TABS = ['verse', 'ref', 'article'];

const norm = (s) => String(s ?? '').trim().toLowerCase();

// Folha para escolher uma referência. Dois modos:
// - 'token' (caderno): abas versículo / referência / artigo, e `onPick`
//   recebe o token que entra no texto:
//     versículo  -> @[Mt 16,18](v:mt/16/18)
//     referência -> @[Mt 16,18](r:refId)   (referências curadas do app)
//     artigo     -> @[Título](a:articleId)
// - 'verse' (editor de nota): só o fluxo de versículo, e `onPickVerse`
//   recebe { bookId, chapter, verse }.
// É um Modal simples, não o Sheet do design system, porque as listas rolam e
// o arrasto do Sheet capturaria o gesto.
export default function ReferencePickerModal({ visible, onClose, onPick, onPickVerse, mode = 'token' }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn, lang } = useLanguage();
  const insets = useSafeAreaInsets();
  const { space, radius, icon } = tokens;
  const verseOnly = mode === 'verse';
  useModalNavBar(visible);
  // A Bíblia aqui só valida o número máximo do versículo, e a validação já
  // aceita qualquer um se o dado não estiver lá: basta pedir o carregamento.
  useEffect(() => { ensureBible(lang).catch(() => {}); }, [lang]);

  const [tab, setTab] = useState('verse');
  const [articleQuery, setArticleQuery] = useState('');
  const [refQuery, setRefQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');

  const reset = () => {
    setTab('verse'); setArticleQuery(''); setRefQuery(''); setBookQuery('');
    setBook(null); setChapter(''); setVerse('');
  };
  const close = () => { reset(); onClose?.(); };

  const filteredArticles = useMemo(() => {
    const q = norm(articleQuery);
    return articles.filter((a) => !q || norm(pick(a, 'title', isEn)).includes(q));
  }, [articleQuery, isEn]);

  const filteredRefs = useMemo(() => {
    const q = norm(refQuery);
    if (!q) return refsWithEn;
    return refsWithEn.filter((r) => {
      const hay = `${r.ref} ${pick(r, 'topic', isEn) || ''} ${r.fullSource || ''} ${r.source || ''} ${refLabel(r, isEn)}`;
      return norm(hay).includes(q);
    });
  }, [refQuery, isEn]);

  const filteredBooks = useMemo(() => {
    const q = norm(bookQuery);
    return BIBLE_BOOKS.filter((b) => !q || norm(bookName(b, isEn)).includes(q) || b.id.includes(q));
  }, [bookQuery, isEn]);

  const pickArticle = (a) => {
    onPick?.(`@[${pick(a, 'title', isEn)}](a:${a.id})`);
    close();
  };

  const pickRef = (r) => {
    onPick?.(`@[${refLabel(r, isEn)}](r:${r.id})`);
    close();
  };

  // Valida capítulo pelo livro e versículo pela contagem do capítulo (cai
  // para "qualquer um a partir de 1" se a Bíblia ainda não carregou).
  const ch = parseInt(chapter, 10);
  const vs = parseInt(verse, 10);
  const maxVerse = useMemo(() => {
    if (!book || !ch) return Infinity;
    try {
      const data = getChapter(book.id, ch, lang);
      return data?.verses?.length || Infinity;
    } catch {
      return Infinity;
    }
  }, [book, ch, lang]);
  const canInsert = Boolean(book) && ch >= 1 && ch <= (book?.totalChapters ?? 0) && vs >= 1 && vs <= maxVerse;

  const confirmVerse = () => {
    if (!canInsert) return;
    if (verseOnly) {
      onPickVerse?.({ bookId: book.id, chapter: ch, verse: vs });
    } else {
      const label = formatVerseRef({ bookName: bookShort(book, isEn), chapter: ch, verse: vs }, isEn);
      onPick?.(`@[${label}](v:${book.id}/${ch}/${vs})`);
    }
    close();
  };

  const tabLabel = { verse: t('common.verse'), ref: t('header.reference'), article: t('header.article') };
  const title = verseOnly ? t('note.chooseVerse') : t('notebook.addReference');

  // A FlatList é o card da lista agrupada e encolhe para caber na folha
  // (maxHeight do painel), rolando por dentro.
  const listStyle = { flexShrink: 1, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' };
  const renderList = (data, keyExtractor, renderItem) => (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      keyboardShouldPersistTaps="handled"
      style={listStyle}
      ItemSeparatorComponent={ListSeparator}
      ListEmptyComponent={<EmptyState icon="search-outline" title={t('search.empty')} />}
      renderItem={renderItem}
    />
  );

  let body;
  if (!verseOnly && tab === 'article') {
    body = (
      <>
        <SearchField
          value={articleQuery}
          onChangeText={setArticleQuery}
          placeholder={isEn ? 'Search article' : 'Buscar artigo'}
          clearLabel={t('common.clear')}
          autoCorrect={false}
        />
        {renderList(filteredArticles, (a) => String(a.id), ({ item }) => (
          <Row icon="document-text-outline" title={pick(item, 'title', isEn)} onPress={() => pickArticle(item)} />
        ))}
      </>
    );
  } else if (!verseOnly && tab === 'ref') {
    body = (
      <>
        <SearchField
          value={refQuery}
          onChangeText={setRefQuery}
          placeholder={isEn ? 'Search reference (verse, Catechism, document)' : 'Buscar referência (versículo, Catecismo, documento)'}
          clearLabel={t('common.clear')}
          autoCorrect={false}
        />
        {renderList(filteredRefs, (r) => r.id, ({ item }) => (
          <Row icon="bookmark-outline" title={refLabel(item, isEn)} subtitle={pick(item, 'topic', isEn)} onPress={() => pickRef(item)} />
        ))}
      </>
    );
  } else if (!book) {
    body = (
      <>
        <SearchField
          value={bookQuery}
          onChangeText={setBookQuery}
          placeholder={t('bible.searchBook')}
          clearLabel={t('common.clear')}
          autoCorrect={false}
        />
        {renderList(filteredBooks, (b) => b.id, ({ item }) => (
          <Row icon="book-outline" title={bookName(item, isEn)} onPress={() => setBook(item)} />
        ))}
      </>
    );
  } else {
    body = (
      <>
        <Group>
          <Row
            icon="book-outline"
            title={bookName(book, isEn)}
            trailing={<Text style={[text('body'), { color: colors.tint }]}>{t('note.change')}</Text>}
            accessibilityLabel={`${bookName(book, isEn)}, ${t('note.change')}`}
            onPress={() => setBook(null)}
          />
          <Field
            label={t('bible.chapter')}
            keyboardType="number-pad"
            value={chapter}
            onChangeText={setChapter}
            placeholder={`1-${book.totalChapters}`}
            returnKeyType="next"
            autoFocus
          />
          <Field
            label={t('common.verse')}
            keyboardType="number-pad"
            value={verse}
            onChangeText={setVerse}
            placeholder="1"
            returnKeyType="done"
            onSubmitEditing={confirmVerse}
          />
        </Group>
        <Button label={isEn ? 'Insert' : 'Inserir'} onPress={confirmVerse} disabled={!canInsert} haptic="impact" />
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable role="button" aria-label={t('common.close')} onPress={close} style={StyleSheet.absoluteFill} />
        <View
          role="dialog"
          aria-modal
          aria-label={title}
          style={{
            backgroundColor: colors.elevated,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            maxHeight: '85%',
            paddingHorizontal: space.md,
            paddingTop: space.xs,
            paddingBottom: insets.bottom + space.md,
            gap: space.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[text('headline'), { color: colors.text, flex: 1 }]}>{title}</Text>
            <Pressable
              role="button"
              aria-label={t('common.close')}
              onPress={close}
              style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -space.xs }}
            >
              <Ionicons name="close" size={icon.md} color={colors.text} />
            </Pressable>
          </View>
          {verseOnly ? null : (
            <View style={{ flexDirection: 'row', gap: space.xs }}>
              {TABS.map((k) => (
                <Chip key={k} label={tabLabel[k]} selected={tab === k} onPress={() => setTab(k)} haptic />
              ))}
            </View>
          )}
          {body}
        </View>
      </View>
    </Modal>
  );
}
