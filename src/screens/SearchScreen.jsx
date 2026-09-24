import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fuse from 'fuse.js';
import { articles } from '../data/articles';
import { references } from '../data/references';
import { referencesEn } from '../data/references-en';
import { translateSource } from '../data/referenceSources';
import { DAILY_VERSES } from '../data/dailyVerses';
import { getBook, bookName } from '../data/bible';
import { searchBible } from '../services/bibleApi';
import { useBibleReady } from '../hooks/useBibleReady';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { pick, categoryLabel } from '../utils/i18nData';
import { formatVerseRef } from '../utils/verseRef';
import { refLabel } from '../utils/refLabel';
import { openBible, openArticle } from '../navigation/links';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
} from '../utils/searchHistory';
import { Chip, EmptyState, Group, PressScale, Row, SearchField, SectionTitle } from '../components/ui';

// Busca (Onda 9c): campo com foco automático, filtros em chips, histórico e
// resultados em grupos por tipo. O motor é o mesmo de antes: Fuse.js para
// artigos, referências e versículos curados, e a varredura full-text da
// Bíblia offline no idioma ativo.

// Threshold mais estrito (0.35) pra evitar matches absurdos.
// Fuse.js: 0.0 = match exato, 1.0 = qualquer coisa.
const articleIndex = new Fuse(articles, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'summary', weight: 2 },
    { name: 'body', weight: 1.5 },
    { name: 'category', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

const referenceIndex = new Fuse(references, {
  keys: [
    { name: 'ref', weight: 3 },
    { name: 'topic', weight: 2 },
    { name: 'text', weight: 2 },
    { name: 'fullSource', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

// Versículos populares (mesmos do "Versículo do dia") - inclui Jo 3,16 e clássicos
const verseIndex = new Fuse(DAILY_VERSES, {
  keys: [
    { name: 'text', weight: 3 },
    { name: 'ref', weight: 2 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

// Índices "Você quis dizer" criados uma única vez no escopo do módulo
// (antes eram recriados a cada keystroke).
const looseArticleIndex = new Fuse(articles, {
  keys: ['title', 'summary'],
  threshold: 0.55,
  includeScore: true,
});
const looseVerseIndex = new Fuse(DAILY_VERSES, {
  keys: ['text', 'ref'],
  threshold: 0.55,
  includeScore: true,
});

// Filtros dos chips e as seções de resultado que cada um mostra.
const FILTERS = [
  { id: 'all', key: 'search.filter.all', sections: ['articles', 'verses', 'bible', 'references'] },
  { id: 'articles', key: 'search.filter.articles', sections: ['articles'] },
  { id: 'references', key: 'search.filter.references', sections: ['references'] },
  { id: 'bible', key: 'search.filter.bible', sections: ['verses', 'bible'] },
];

const MIN_QUERY = 3;
const DEBOUNCE_MS = 400;

// Referência de um versículo no formato do idioma, a partir de bookId/chapter/verse.
const verseLabel = (v, isEn) => formatVerseRef({ bookName: bookName(getBook(v.bookId), isEn), chapter: v.chapter, verse: v.verse }, isEn);

// Linha do histórico: a busca à esquerda (PressScale) e o "x" de 44 à direita
// como irmão, não como filho, para não aninhar toques dentro de uma Row.
function HistoryRow({ query, onPick, onRemove, removeLabel }) {
  const { colors, tokens, text } = useTheme();
  const { space, icon } = tokens;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <PressScale
        role="button"
        onPress={onPick}
        style={({ pressed }) => [
          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, paddingLeft: space.md, paddingVertical: space.sm },
          pressed ? { backgroundColor: colors.separator } : null,
        ]}
      >
        <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="time-outline" size={icon.md} color={colors.tint} />
        </View>
        <Text style={[text('body'), { color: colors.text, flex: 1 }]} numberOfLines={1}>{query}</Text>
      </PressScale>
      <Pressable
        role="button"
        aria-label={removeLabel}
        onPress={onRemove}
        style={{ width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="close" size={icon.md} color={colors.textSubtle} />
      </Pressable>
    </View>
  );
}

export default function SearchScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const inputRef = useRef(null);

  useEffect(() => {
    getSearchHistory().then(setHistory);
  }, []);

  // Na web o campo ganha o foco ao montar (autoFocus) e o perde um instante
  // depois, quando a transição do stack JS esconde e mostra o card (medido:
  // focusin aos 49 ms, focusout aos 50 ms). Refoca quando a transição de
  // entrada termina. No nativo o autoFocus basta e isto só repete o foco.
  useEffect(
    () => navigation.addListener('transitionEnd', (e) => {
      if (!e?.data?.closing) inputRef.current?.focus();
    }),
    [navigation]
  );

  // Debounce da digitação; Enter no campo dispara na hora.
  useEffect(() => {
    if (query === debouncedQuery) {
      setBusy(false);
      return undefined;
    }
    setBusy(true);
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  // Toda busca efetiva (com 3+ letras) entra no histórico.
  useEffect(() => {
    setBusy(false);
    if (debouncedQuery.trim().length < MIN_QUERY) return;
    addSearchHistory(debouncedQuery).then(() => getSearchHistory().then(setHistory));
  }, [debouncedQuery]);

  const submit = useCallback(() => setDebouncedQuery(query), [query]);

  const clearHistory = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback(async (q) => {
    setHistory(await removeSearchHistory(q));
  }, []);

  // A busca full-text varre a tradução inteira, que na web é baixada sob
  // demanda. Sem esperar, searchBible devolveria [] e a tela diria "Nada
  // encontrado" por um motivo que não é esse.
  const biblia = useBibleReady(isEn ? 'en' : 'pt');

  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    if (q.length < MIN_QUERY) return { articles: [], references: [], verses: [], bible: [] };
    return {
      articles: articleIndex.search(q).slice(0, 8).map((h) => h.item),
      references: referenceIndex.search(q).slice(0, 10).map((h) => h.item),
      verses: verseIndex.search(q).slice(0, 8).map((h) => h.item),
      // Busca full-text na Bíblia inteira (offline), no idioma ativo.
      bible: biblia.pronta ? searchBible(q, { language: isEn ? 'en' : 'pt', limit: 20 }) : [],
    };
  }, [debouncedQuery, isEn, biblia.pronta]);

  const activeFilter = FILTERS.find((f) => f.id === filter) || FILTERS[0];
  const visibleHits = activeFilter.sections.reduce((n, s) => n + results[s].length, 0);
  const searching = debouncedQuery.trim().length >= MIN_QUERY;

  // Para sugestão "Você quis dizer", usa threshold mais frouxo.
  const suggestion = useMemo(() => {
    if (!searching || visibleHits > 0) return null;
    const q = debouncedQuery.trim();
    const a = looseArticleIndex.search(q)[0];
    const v = looseVerseIndex.search(q)[0];
    const candidates = [
      a && { type: 'article', label: pick(a.item, 'title', isEn), item: a.item, score: a.score },
      v && { type: 'verse', label: verseLabel(v.item, isEn), item: v.item, score: v.score },
    ].filter(Boolean);
    if (candidates.length === 0) return null;
    candidates.sort((x, y) => x.score - y.score);
    return candidates[0];
  }, [debouncedQuery, searching, visibleHits, isEn]);

  const openVerse = useCallback(
    (v) => openBible(navigation, { bookId: v.bookId, chapter: v.chapter, verse: v.verse }),
    [navigation]
  );
  const openReference = useCallback(
    (id) => navigation.navigate('RefDetail', { highlightId: id }),
    [navigation]
  );
  const openSuggestion = useCallback(() => {
    if (!suggestion) return;
    if (suggestion.type === 'article') openArticle(navigation, suggestion.item.id);
    else openVerse(suggestion.item);
  }, [suggestion, navigation, openVerse]);

  const quoteStyle = [text('bodySerif'), { color: colors.text, marginTop: space.xxs }];
  const summaryStyle = [text('subhead'), { color: colors.textSubtle, marginTop: space.xxs }];
  // O SectionTitle já traz a margem lateral; os grupos alinham por esta.
  const groupStyle = { marginHorizontal: space.md };

  // Cada seção de resultado: título de seção + grupo de linhas.
  const renderSection = (id) => {
    const data = results[id];
    if (!data.length) return null;
    if (id === 'articles') {
      return (
        <View key={id}>
          <SectionTitle title={t('search.filter.articles')} />
          <Group style={groupStyle}>
            {data.map((a) => (
              <Row
                key={a.id}
                icon="newspaper-outline"
                title={pick(a, 'title', isEn)}
                titleLines={2}
                subtitle={categoryLabel(a.category, t)}
                trailing="chevron"
                onPress={() => openArticle(navigation, a.id)}
              >
                <Text style={summaryStyle} numberOfLines={2}>{pick(a, 'summary', isEn)}</Text>
              </Row>
            ))}
          </Group>
        </View>
      );
    }
    if (id === 'references') {
      return (
        <View key={id}>
          <SectionTitle title={t('search.filter.references')} />
          <Group style={groupStyle}>
            {data.map((r) => {
              const full = { ...r, ...(referencesEn[r.id] || {}) };
              const topic = pick(full, 'topic', isEn);
              return (
                <Row
                  key={r.id}
                  icon="library-outline"
                  title={refLabel(full, isEn)}
                  subtitle={`${translateSource(r.source, isEn)}${topic ? ` · ${topic}` : ''}`}
                  trailing="chevron"
                  onPress={() => openReference(r.id)}
                >
                  <Text style={quoteStyle} numberOfLines={2}>{pick(full, 'text', isEn)}</Text>
                </Row>
              );
            })}
          </Group>
        </View>
      );
    }
    // 'verses' (curados, bilíngues) e 'bible' (varredura no idioma ativo).
    return (
      <View key={id}>
        <SectionTitle title={id === 'verses' ? t('search.section.verses') : t('search.section.bible')} />
        <Group>
          {data.map((v) => (
            <Row
              key={`${v.bookId}-${v.chapter}-${v.verse}`}
              icon="book-outline"
              title={verseLabel(v, isEn)}
              trailing="chevron"
              onPress={() => openVerse(v)}
            >
              <Text style={quoteStyle} numberOfLines={3}>{id === 'verses' ? pick(v, 'text', isEn) : v.text}</Text>
            </Row>
          ))}
        </Group>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SearchField
        ref={inputRef}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={submit}
        placeholder={t('search.placeholder')}
        clearLabel={t('search.clearSearch')}
        autoFocus
        autoCorrect={false}
        style={{ marginHorizontal: space.md, marginTop: space.sm }}
      />
      {/* Trilho dos chips com a altura do alvo de toque: sem `height` e
          `flexShrink: 0` a web encolhe o ScrollView horizontal a quase nada. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: space.md, gap: space.xs, alignItems: 'center' }}
        style={{ flexGrow: 0, flexShrink: 0, height: 44, marginTop: space.xxs }}
      >
        {FILTERS.map((f) => (
          <Chip key={f.id} label={t(f.key)} selected={filter === f.id} onPress={() => setFilter(f.id)} haptic />
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: space.xl }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {busy && query.trim().length >= MIN_QUERY ? (
          <ActivityIndicator color={colors.tint} style={{ marginTop: space.lg }} />
        ) : null}

        {/* Histórico: só enquanto não há busca ativa. */}
        {!searching && history.length > 0 ? (
          <>
            <SectionTitle title={t('search.recent')} action={{ label: t('search.clear'), onPress: clearHistory }} />
            <Group style={groupStyle}>
              {history.map((q) => (
                <HistoryRow
                  key={q}
                  query={q}
                  onPick={() => { setQuery(q); setDebouncedQuery(q); }}
                  onRemove={() => removeFromHistory(q)}
                  removeLabel={t('search.removeRecent', { q })}
                />
              ))}
            </Group>
          </>
        ) : null}

        {!searching && history.length === 0 ? (
          <EmptyState icon="search-outline" title={t('search.intro.title')} message={t('search.intro.message')} style={{ marginTop: space.xl }} />
        ) : null}

        {searching && !busy && visibleHits === 0 ? (
          <EmptyState
            icon="search-outline"
            title={biblia.pronta ? t('search.empty') : t('bible.loading')}
            message={suggestion ? t('search.didYouMean') : t('search.tryOther')}
            action={suggestion ? { label: suggestion.label, onPress: openSuggestion } : undefined}
            style={{ marginTop: space.xl }}
          />
        ) : null}

        {searching ? activeFilter.sections.map(renderSection) : null}
      </ScrollView>
    </View>
  );
}
