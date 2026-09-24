import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, AppState, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useComposedEventHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notify } from '../utils/dialog';
import { shareVerse } from '../utils/share';
import { formatVerseRef } from '../utils/verseRef';
import { pick } from '../utils/i18nData';
import { speakLong, stopSpeaking, isSpeaking } from '../utils/speakLong';
import { BIBLE_BOOKS, bookName } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRequireAccount } from '../components/GuestGate';
import {
  watchChapterHighlights, watchChapterNotes,
  addHighlight, removeHighlight,
} from '../services/userData';
import { resolveVoice, getSavedRate, ttsLocale } from '../utils/ttsVoice';
import { scrollFraction, stepped } from '../utils/scrollProgress';
import ReadingProgressBar from '../components/ReadingProgressBar';
import BibleLoadingState from '../components/BibleLoadingState';
import { useBibleReady } from '../hooks/useBibleReady';
import ContinueBibleCard from '../components/ContinueBibleCard';
import VerseActionsSheet from '../components/VerseActionsSheet';
import ChapterPill from '../components/ChapterPill';
import LargeTitleScreen, { BAR_HEIGHT } from '../components/ui/LargeTitleScreen';
import { SearchField, Group, Row, SectionTitle, PressScale, ProgressBar, EmptyState } from '../components/ui';
import {
  saveBiblePosition, getBiblePosition,
  markChapterRead, getReadChapters, getBibleStats,
  READ_THRESHOLD,
} from '../utils/bibleProgress';

// Por quanto tempo, depois de abrir um capitulo, ainda tentamos restaurar o
// scroll salvo. Cobre o crescimento progressivo da FlatList sem atrapalhar
// quem ja comecou a ler.
const RESTORE_WINDOW_MS = 1500;

// Janela em que um scroll ainda conta como nosso, e nao como gesto do usuario.
// O scroll suave do navegador leva ~300-500 ms; 1200 da folga sem engolir
// gesto real, porque o toque promove por onTouchMove, independente do onScroll.
const AUTO_SCROLL_WINDOW_MS = 1200;

// Tempo minimo no capitulo antes de aceitar marca-lo como lido. Sem isto, um
// capitulo curto que cabe inteiro na tela (Salmo 117 tem 2 versiculos) entra
// como lido no instante em que abre, e um deep link que cai perto do fim
// tambem. Nao existe forma de desmarcar, entao errar aqui e caro.
const MARK_DWELL_MS = 2500;

// Toque longo num versículo (mesmo tempo de antes) abre a mesma folha do toque.
const LONG_PRESS_MS = 350;

// Alvo de toque (HIG): célula da grade de capítulos e botão de narração. A
// barra de progresso do capítulo fica colada logo abaixo da barra do
// LargeTitleScreen (BAR_HEIGHT).
const TARGET = 44;

// A pílula de capítulo só começa a sumir ao rolar para baixo depois deste
// ponto, e volta ao rolar para cima em qualquer lugar. Movimentos menores que
// SCROLL_DEADZONE entre dois eventos não contam como direção (tremor).
const PILL_HIDE_AFTER = 80;
const SCROLL_DEADZONE = 2;

// A lista de versículos recebe o onScroll a cada 32 ms (e não os 16 do
// LargeTitleScreen): o título inline e a pílula continuam fluidos, e o
// handler JS de progresso roda metade das vezes.
const VERSE_SCROLL_THROTTLE_MS = 32;

// Variação mínima da fração lida para chegar à barra: abaixo disso o scroll
// não escreve nada.
const RATIO_STEP = 0.005;

const keyByVerse = (v) => String(v.n);
const noop = () => {};

// Uma linha de versículo: número, texto e o ícone de nota. memo com props
// primitivas (o objeto `verse` é o do capítulo memoizado e `s` é o objeto de
// estilos, estável por tema), então abrir a folha ou receber uma marcação
// nova re-renderiza só as linhas que mudaram.
const VerseRow = memo(function VerseRow({ verse, bg, numColor, textColor, strong, hasNote, onPress, s }) {
  return (
    <Pressable
      role="button"
      onPress={() => onPress(verse)}
      onLongPress={() => onPress(verse)}
      delayLongPress={LONG_PRESS_MS}
      style={({ pressed }) => [
        s.row,
        { backgroundColor: bg ?? (pressed ? s.pressedBg : 'transparent') },
      ]}
    >
      <Text style={[s.numStyle, s.num, { color: numColor, paddingTop: s.numOffset }]}>{verse.n}</Text>
      <Text style={[s.readingStyle, s.text, { color: textColor }, strong ? s.strong : null]}>{verse.t}</Text>
      {hasNote ? <Ionicons name="document-text" size={s.iconSize} color={s.iconColor} style={s.noteIcon} /> : null}
    </Pressable>
  );
});

// Célula da grade de capítulos: Pressable simples (sem mola nem shared value
// por célula, são até 150 numa tela) com o fundo escurecido enquanto
// pressionada, como as linhas de lista. memo com props primitivas e o objeto
// de estilos estável, para a grade não redesenhar tudo quando a tela muda por
// outro motivo.
const ChapterCell = memo(function ChapterCell({ n, isRead, size, label, onPress, s }) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={() => onPress(n)}
      style={({ pressed }) => [
        s.cell,
        { width: size, height: size, backgroundColor: pressed ? s.pressedBg : isRead ? s.readBg : s.bg },
      ]}
    >
      <Text style={[s.num, { color: isRead ? s.readColor : s.color }]}>{n}</Text>
    </Pressable>
  );
});

// Linha de livro: memo com o handler estável (recebe o livro), para os 73
// livros não re-renderizarem a cada tecla do filtro nem quando o "continue
// lendo" e as estatísticas chegam.
const BookRow = memo(function BookRow({ book, title, subtitle, onPress }) {
  return <Row title={title} subtitle={subtitle} trailing="chevron" onPress={() => onPress(book)} />;
});

// Lista de versículos: Animated.FlatList que recebe o onScroll do
// LargeTitleScreen (título inline e backdrop) composto com o nosso, que
// decide a direção da rolagem para a pílula e repassa o evento ao handler JS
// de progresso e restauração (onScrollJS). O worklet captura só `dispatch`,
// que é estável: o handler JS mais recente fica numa ref. `autoUntil` é o
// prazo (Date.now) até o qual a rolagem é NOSSA (restauração, deep link):
// nesse período a pílula não se esconde, só o gesto do usuário a esconde.
function VerseList({
  list,
  listRef,
  data,
  renderItem,
  footer,
  onScrollJS,
  onScrollBeginDrag,
  onTouchMove,
  onContentSizeChange,
  onLayout,
  pillVisible,
  autoUntil,
}) {
  const { tokens } = useTheme();
  const { motion } = tokens;
  const easing = useMemo(() => Easing.bezier(...motion.easing), [motion.easing]);
  const lastY = useSharedValue(0);
  const pillTarget = useSharedValue(1);

  const jsRef = useRef(onScrollJS);
  jsRef.current = onScrollJS;
  const dispatch = useCallback((nativeEvent) => {
    jsRef.current?.({ nativeEvent });
  }, []);

  // Capítulo novo: pílula visível e direção zerada.
  useEffect(() => {
    lastY.value = 0;
    pillTarget.value = 1;
    pillVisible.value = 1;
  }, [data, lastY, pillTarget, pillVisible]);

  const mine = useAnimatedScrollHandler((e) => {
    const y = e.contentOffset.y;
    const dy = y - lastY.value;
    lastY.value = y;
    const ours = Date.now() < autoUntil.value;
    let target = pillTarget.value;
    if (!ours && dy > SCROLL_DEADZONE && y > PILL_HIDE_AFTER) target = 0;
    else if (dy < -SCROLL_DEADZONE || y <= PILL_HIDE_AFTER) target = 1;
    if (target !== pillTarget.value) {
      pillTarget.value = target;
      pillVisible.value = withTiming(target, { duration: motion.aba, easing });
    }
    scheduleOnRN(dispatch, {
      contentOffset: e.contentOffset,
      contentSize: e.contentSize,
      layoutMeasurement: e.layoutMeasurement,
    });
  });
  const onScroll = useComposedEventHandler([list.onScroll, mine]);

  return (
    <Animated.FlatList
      ref={listRef}
      data={data}
      keyExtractor={keyByVerse}
      renderItem={renderItem}
      ListHeaderComponent={list.header}
      ListFooterComponent={footer}
      contentContainerStyle={list.contentContainerStyle}
      onScroll={onScroll}
      scrollEventThrottle={VERSE_SCROLL_THROTTLE_MS}
      onScrollBeginDrag={onScrollBeginDrag}
      onTouchMove={onTouchMove}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      onScrollToIndexFailed={noop}
    />
  );
}

export default function BibleScreen({ route, navigation }) {
  const { colors, tokens, text, darkMode } = useTheme();
  const { space, icon } = tokens;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();
  const { lang, t, isEn } = useLanguage();
  const bn = useCallback((b) => bookName(b, isEn), [isEn]);
  const requireAccount = useRequireAccount();
  // A tradução vem num pedaço separado na web (ver src/services/bibleApi.js).
  // Enquanto ela não chega, getChapter devolve null: sem isto a tela mostraria
  // "capítulo em preparação", que significa outra coisa.
  const bibliaPronta = useBibleReady(lang);
  const [view, setView] = useState('books');
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [highlightVerse, setHighlightVerse] = useState(null);
  // Fim do intervalo destacado (ex.: Mt 16,18-19 destaca 18 e 19). Null = só o verso inicial.
  const [highlightVerseEnd, setHighlightVerseEnd] = useState(null);
  // Marca que chegamos a um capítulo/versículo por deep link (ref, artigo, etc.),
  // para que o voltar retorne à tela de origem em vez de descer na hierarquia
  // interna da Bíblia (versículos -> capítulos -> livros).
  const [fromDeepLink, setFromDeepLink] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [actionVerse, setActionVerse] = useState(null);
  const [chapterHighlights, setChapterHighlights] = useState([]);
  const [chapterNotes, setChapterNotes] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const verseListRef = useRef(null);
  const booksScrollRef = useRef(null);
  // 1 = pílula de capítulo visível, 0 = escondida (escrito pela VerseList).
  const pillVisible = useSharedValue(1);
  // Espelho de autoScroll.until para o worklet da lista: até esse instante a
  // rolagem é nossa e não esconde a pílula.
  const autoUntil = useSharedValue(0);

  // ===== Progresso de leitura (ver src/utils/bibleProgress.js) =====
  // Quanto do capítulo atual já foi rolado (0..1). A barra do topo lê o shared
  // value (o onScroll escreve nele sem re-renderizar a tela); o estado só
  // muda quando a fração cruza READ_THRESHOLD ou o capítulo troca, que é o
  // que o efeito de marcação observa.
  const progressSv = useSharedValue(0);
  // A proporcao lida anda junto do capitulo a que pertence. Guardar so o numero
  // abria uma corrida: `chapter` muda num render e o reset da proporcao so vinha
  // no efeito seguinte, entao o efeito de marcacao via o capitulo NOVO com a
  // proporcao ANTIGA e marcava o capitulo como lido sozinho ao avancar.
  const [progresso, setProgresso] = useState({ chave: null, ratio: 0 });
  // Última fração escrita na barra: o onScroll só escreve quando a diferença
  // passa de RATIO_STEP, e é contra ela que se detecta o cruzamento do
  // limiar. Quem muda a fração fora do scroll acerta o espelho.
  const ratioNaBarra = useRef(0);
  // Vira true depois de MARK_DWELL_MS no capitulo; e dependencia do efeito de
  // marcacao, entao a virada reavalia a marcacao sozinha.
  const [passouTempoMinimo, setPassouTempoMinimo] = useState(false);
  // Último ponto salvo, usado pelo card "Continue lendo" na lista de livros.
  const [savedPosition, setSavedPosition] = useState(null);
  // Capítulos já lidos DO LIVRO ABERTO (Set), para marcar a grade de capítulos.
  const [readChapters, setReadChapters] = useState(new Set());
  const [stats, setStats] = useState(null);
  // Escrita em AsyncStorage é debounced: o scroll dispara dezenas de eventos.
  const saveTimer = useRef(null);
  const pendingSave = useRef(null);
  // Altura da viewport e do conteúdo da lista. As duas chegam por callbacks
  // independentes e em ordem imprevisível, por isso guardamos ambas e tentamos
  // restaurar a partir de qualquer uma delas (ver tryRestore).
  const verseLayoutH = useRef(0);
  const verseContentH = useRef(0);
  // Restauração de scroll pendente ({ ratio }) ao reabrir o capítulo onde parou.
  // A FlatList renderiza por partes, então o alvo só é alcançável depois que a
  // lista cresce: tentamos de novo a cada mudança de altura até o usuário rolar.
  const pendingRestore = useRef(null);
  // Leitura x consulta. Chegar num capítulo por busca, referência, liturgia ou
  // qualquer deep link é CONSULTA: não move o "continue lendo" nem marca lido.
  // Vira leitura no primeiro arrasto do usuário dentro do capítulo.
  const userScrolled = useRef(false);
  // Alvo e prazo do scroll que NOS disparamos (restauracao / deep link), para
  // nao confundi-lo com o do usuario quando so temos o evento onScroll.
  const autoScroll = useRef({ target: -1, until: 0 });
  // Chave do capitulo aberto, para os callbacks de medicao que rodam fora do render.
  const chaveAtual = useRef(null);
  // Marcação de "lido": uma tentativa por capítulo.
  const markedKey = useRef(null);

  // Toda mudança de nível (livros, capítulos, versículos) passa por aqui. O
  // destaque de versículo e a marca de deep link são zerados a cada ida,
  // salvo quando o chamador os passa (o deep link de uma referência). A barra
  // de progresso zera junto, antes do efeito de troca de capítulo, para a
  // fração do capítulo anterior não aparecer num quadro do novo.
  const goTo = useCallback(({ view: v, book: b = null, chapter: c = null, highlight = null, highlightEnd = null, deepLink = false }) => {
    setView(v);
    setBook(b);
    setChapter(c);
    setHighlightVerse(highlight);
    setHighlightVerseEnd(highlightEnd);
    setFromDeepLink(deepLink);
    progressSv.value = 0;
  }, [progressSv]);

  // Deep link de uma referência
  const { bookId: linkBookId, chapter: linkChapter, highlightVerse: linkVerse, highlightVerseEnd: linkVerseEnd } = route?.params || {};
  useEffect(() => {
    if (!linkBookId) return;
    const b = BIBLE_BOOKS.find((x) => x.id === linkBookId);
    if (!b) return;
    if (linkChapter) {
      goTo({ view: 'verses', book: b, chapter: linkChapter, highlight: linkVerse ?? null, highlightEnd: linkVerseEnd ?? null, deepLink: true });
    } else {
      goTo({ view: 'chapters', book: b, deepLink: true });
    }
    navigation?.setParams?.({ bookId: undefined, chapter: undefined, highlightVerse: undefined, highlightVerseEnd: undefined });
  }, [linkBookId, linkChapter, linkVerse, linkVerseEnd, goTo, navigation]);

  // Volta pro início da seção quando o usuário aperta o tab Bíblia de novo
  useEffect(() => {
    const unsub = navigation?.addListener?.('tabPress', () => {
      if (!navigation.isFocused?.()) return;
      if (view !== 'books') {
        goTo({ view: 'books' });
        setFilterText('');
      } else {
        // Ja esta na view de livros: scroll pro topo
        booksScrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation, view, goTo]);

  // Voltar um nível (o `back` do LargeTitleScreen). Chegando por deep link, a
  // volta é para a tela de origem, como antes. O botão físico do Android e o
  // gesto de voltar não são tratados aqui (nunca foram): seguem o histórico
  // entre abas do Tab.Navigator.
  const goBackLevel = () => {
    if (fromDeepLink && navigation.canGoBack()) { navigation.goBack(); return; }
    if (view === 'verses') goTo({ view: 'chapters', book });
    else if (view === 'chapters') goTo({ view: 'books' });
  };

  // bookId em variável própria (em vez de book?.id direto nas deps) para os
  // hooks abaixo não dispararem o aviso de exhaustive-deps.
  const bookId = book?.id ?? null;

  const chapterData = useMemo(() => {
    if (view !== 'verses' || !bookId || !chapter) return null;
    if (!bibliaPronta.pronta) return null;
    return getChapter(bookId, chapter, lang);
  }, [view, bookId, chapter, lang, bibliaPronta.pronta]);

  // ===== Progresso de leitura =====

  // Debounced: o scroll dispara dezenas de eventos e cada um viraria uma escrita.
  const queueSave = useCallback((bId, ch, ratio, lng) => {
    if (!bId || !ch) return;
    pendingSave.current = { bookId: bId, chapter: ch, ratio, lang: lng };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      if (pendingSave.current) saveBiblePosition(pendingSave.current);
    }, 500);
  }, []);

  // Grava na hora o que estiver pendente. Sem isso, quem fecha o app logo depois
  // de rolar perderia os últimos 500 ms, justamente o ponto onde parou.
  const flushSave = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    if (pendingSave.current) {
      saveBiblePosition(pendingSave.current);
      pendingSave.current = null;
    }
  }, []);

  // Tenta restaurar o scroll pendente com as medidas que já temos. Chamada por
  // onLayout e por onContentSizeChange: a lista cresce em etapas, então não
  // desistimos na primeira tentativa, só quando o usuário arrasta ou a janela
  // de RESTORE_WINDOW_MS expira.
  // Fallback de medição. No react-native-web, onLayout e onContentSizeChange
  // só disparam quando o tamanho MUDA depois da montagem: um capítulo que já
  // cabe inteiro na tela nunca cresce e portanto nunca é medido. Aqui lemos
  // direto do nó de scroll. No nativo getScrollableNode devolve um handle
  // numérico, sem clientHeight, então a checagem falha e caímos nos callbacks,
  // que lá disparam normalmente.
  const measureFromNode = useCallback(() => {
    const node = verseListRef.current?.getScrollableNode?.();
    if (!node || typeof node.clientHeight !== 'number' || node.clientHeight <= 0) return false;
    verseLayoutH.current = node.clientHeight;
    verseContentH.current = node.scrollHeight;
    return true;
  }, []);

  const tryRestore = useCallback(() => {
    if (!verseLayoutH.current || !verseContentH.current) measureFromNode();
    const layout = verseLayoutH.current;
    const content = verseContentH.current;
    if (!layout || !content) return;
    const scrollable = content - layout;
    const pending = pendingRestore.current;

    if (pending) {
      if (Date.now() <= pending.until) {
        if (scrollable <= 4) return; // ainda não há o que rolar; tenta de novo depois
        ratioNaBarra.current = pending.ratio;
        progressSv.value = pending.ratio;
        setProgresso({ chave: chaveAtual.current, ratio: pending.ratio });
        const alvo = pending.ratio * scrollable;
        autoScroll.current = { target: alvo, until: Date.now() + 600 };
        autoUntil.value = autoScroll.current.until;
        verseListRef.current?.scrollToOffset({ offset: alvo, animated: false });
        // Consome a pendência: restaurada uma vez, não se repete. Sem isso,
        // sair do capítulo e voltar rebobinava para o ponto antigo, porque
        // savedPosition em memória continuava com o valor de quando a lista
        // de livros foi montada.
        pendingRestore.current = null;
        return;
      }
      pendingRestore.current = null;
    }
    // Capítulo curto que cabe inteiro na tela: não há o que rolar, já está lido.
    if (scrollable <= 4) {
      ratioNaBarra.current = 1;
      progressSv.value = 1;
      setProgresso({ chave: chaveAtual.current, ratio: 1 });
    }
  }, [measureFromNode, autoUntil, progressSv]);

  // Recarrega "continue lendo" e estatísticas ao voltar para a lista de livros.
  useEffect(() => {
    if (view !== 'books') return;
    let alive = true;
    (async () => {
      const [pos, st] = await Promise.all([getBiblePosition(), getBibleStats()]);
      if (!alive) return;
      setSavedPosition(pos);
      setStats(st);
    })();
    return () => { alive = false; };
  }, [view]);

  // Capítulos já lidos do livro aberto, para pintar a grade de capítulos.
  useEffect(() => {
    if (!bookId) { setReadChapters(new Set()); return; }
    let alive = true;
    getReadChapters(bookId).then((s) => { if (alive) setReadChapters(s); });
    return () => { alive = false; };
  }, [bookId]);

  // Troca de capítulo: grava o anterior, zera a barra e agenda a restauração
  // do scroll se este for exatamente o capítulo onde o usuário havia parado.
  // Deep link tem prioridade: com versículo destacado, quem rola é o outro efeito.
  useEffect(() => {
    flushSave();
    ratioNaBarra.current = 0;
    progressSv.value = 0;
    setProgresso({ chave: `${bookId}:${chapter}`, ratio: 0 });
    markedKey.current = null;
    userScrolled.current = false;
    autoScroll.current = { target: -1, until: 0 };
    const pos = savedPosition;
    const shouldRestore = pos && pos.bookId === bookId && pos.chapter === chapter
      && pos.ratio > 0.01 && !highlightVerse
      // O ratio e fracao do texto renderizado: restaurar 45% do portugues no
      // ingles cai noutro versiculo. Posicao sem idioma e de antes desta versao.
      && (!pos.lang || pos.lang === lang);
    // `until` limita a janela de tentativas: passado esse tempo a lista já parou
    // de crescer, e insistir só atrapalharia quem começou a ler.
    pendingRestore.current = shouldRestore
      ? { ratio: pos.ratio, until: Date.now() + RESTORE_WINDOW_MS }
      : null;
    // Zera a altura do conteúdo para não restaurar com a medida do capítulo
    // anterior enquanto o novo ainda não foi medido.
    chaveAtual.current = `${bookId}:${chapter}`;
    verseContentH.current = 0;
    if (!shouldRestore) {
      // Sem restauração pendente, começa do topo. Sem isso o offset do capítulo
      // anterior vaza: indo de Salmos 118 (176 versículos) para o 119 (7), o
      // scroll é truncado no novo máximo e o capítulo entra como lido sozinho.
      if (!highlightVerse) verseListRef.current?.scrollToOffset({ offset: 0, animated: false });
      return undefined;
    }
    // Rede de segurança: se as medidas chegarem antes da lista estar pronta,
    // ainda tentamos algumas vezes dentro da janela. A última tentativa cai
    // depois do fim da janela, para encerrar a pendência e acertar a barra em
    // capítulos curtos, que cabem inteiros na tela e nunca crescem.
    const timers = [150, 400, 900, RESTORE_WINDOW_MS + 100]
      .map((ms) => setTimeout(tryRestore, ms));
    return () => timers.forEach(clearTimeout);
  }, [bookId, chapter, flushSave, savedPosition, highlightVerse, tryRestore, lang, progressSv]);

  // Conta o tempo de permanencia no capitulo aberto.
  useEffect(() => {
    setPassouTempoMinimo(false);
    if (view !== 'verses' || !bookId || !chapter) return undefined;
    const timer = setTimeout(() => setPassouTempoMinimo(true), MARK_DWELL_MS);
    return () => clearTimeout(timer);
  }, [view, bookId, chapter]);

  // Passou do limiar: marca como lido. Uma tentativa por capítulo (markedKey),
  // já que o ratio continua mudando acima do limiar.
  useEffect(() => {
    if (view !== 'verses' || !bookId || !chapter) return;
    const chave = `${bookId}:${chapter}`;
    // A proporcao tem de ser DESTE capitulo, senao e sobra do anterior.
    if (progresso.chave !== chave || progresso.ratio < READ_THRESHOLD) return;
    if (!passouTempoMinimo) return;
    // Abrir por link não conta como ler, senão cinco buscas viram cinco
    // capítulos com tique na grade e no contador do cânon. Um capítulo aberto
    // pela grade conta, mesmo sem arrasto: há curtos que cabem inteiros na tela.
    if (fromDeepLink && !userScrolled.current) return;
    if (markedKey.current === chave) return;
    markedKey.current = chave;
    let alive = true;
    markChapterRead(bookId, chapter).then((s) => { if (alive && s) setReadChapters(s); });
    return () => { alive = false; };
  }, [view, bookId, chapter, progresso, fromDeepLink, passouTempoMinimo]);

  // Sair da aba grava; sair do app também (blur não dispara ao ir pro background).
  useEffect(() => {
    const unsubBlur = navigation.addListener('blur', flushSave);
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flushSave();
    });
    // Fechar a aba ou sair para outro site no Safari do iPhone nao dispara
    // visibilitychange, que e o unico evento que o AppState da web escuta.
    // So pagehide chega. Na web o AsyncStorage escreve sincrono, entao grava.
    const naWeb = Platform.OS === 'web' && typeof window !== 'undefined';
    if (naWeb) window.addEventListener('pagehide', flushSave);
    return () => {
      unsubBlur();
      sub?.remove?.();
      if (naWeb) window.removeEventListener('pagehide', flushSave);
    };
  }, [navigation, flushSave]);

  useEffect(() => () => flushSave(), [flushSave]);

  // Handlers da lista de versículos: progresso de leitura, medição e restauração.
  // Arrasto do usuário cancela a restauração: a partir daí quem manda é ele.
  // Fica em onScrollBeginDrag e não em onScroll porque a própria montagem da
  // lista dispara um onScroll em offset 0, que cancelaria a restauração.
  // Promove consulta a leitura. Tres gatilhos porque nenhum cobre tudo:
  //   onScrollBeginDrag  -> nativo (no react-native-web NAO dispara)
  //   onTouchMove        -> toque, que e o caso do Safari no iPhone
  //   heuristica no onScroll -> roda do mouse e trackpad no desktop
  const marcarLeitura = useCallback(() => {
    pendingRestore.current = null;
    userScrolled.current = true;
  }, []);

  const onVerseScroll = useCallback((e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    // O react-native-web dispara um onScroll atrasado (timer interno, sem
    // cleanup no desmonte) que le o DOM na hora em que roda. Se a lista ja saiu
    // de cena (troca de aba, volta pra grade), o no devolve tudo zero, e o
    // fallback abaixo viraria ratio 1: capitulo marcado como lido sozinho.
    if (!layoutMeasurement.height || !contentSize.height) return;
    verseLayoutH.current = layoutMeasurement.height;
    const clamped = scrollFraction(e.nativeEvent);
    // A barra lê o shared value (sem re-render) e só recebe o que andou de
    // verdade (ou cravou 0 ou 1). Estado só ao cruzar o limiar de "lido",
    // nos dois sentidos: é o que o efeito de marcação observa.
    const next = stepped(ratioNaBarra.current, clamped, RATIO_STEP);
    if (next !== ratioNaBarra.current) {
      const cruzou = (next >= READ_THRESHOLD) !== (ratioNaBarra.current >= READ_THRESHOLD);
      ratioNaBarra.current = next;
      progressSv.value = next;
      if (cruzou) setProgresso({ chave: `${bookId}:${chapter}`, ratio: next });
    }
    // Consulta não move o "continue lendo": uma busca que cai em Apocalipse 22
    // não pode apagar o ponto de quem estava lendo Gênesis 15. Ao arrastar, o
    // usuário promove aquilo a leitura e a gravação passa a valer.
    // Scroll que nao veio de nos, e fora da janela do nosso proprio scroll, e
    // do usuario. Cobre roda do mouse, onde nao ha evento de toque.
    const auto = autoScroll.current;
    const naJanela = Date.now() < auto.until;
    const nossoScroll = naJanela
      && (auto.target == null || Math.abs(contentOffset.y - auto.target) < 8);
    if (!nossoScroll && contentOffset.y > 0) userScrolled.current = true;

    if (!fromDeepLink || userScrolled.current) queueSave(bookId, chapter, clamped, lang);
  }, [queueSave, bookId, chapter, fromDeepLink, lang, progressSv]);

  const onVerseLayout = useCallback((e) => {
    verseLayoutH.current = e.nativeEvent.layout.height;
    tryRestore();
  }, [tryRestore]);

  const onVerseContentSize = useCallback((w, h) => {
    verseContentH.current = h;
    tryRestore();
  }, [tryRestore]);

  // Abre o capítulo salvo a partir do card "Continue lendo".
  const resumeReading = useCallback(() => {
    const pos = savedPosition;
    if (!pos) return;
    const b = BIBLE_BOOKS.find((x) => x.id === pos.bookId);
    if (!b) return;
    goTo({ view: 'verses', book: b, chapter: pos.chapter });
  }, [savedPosition, goTo]);

  // Subscreve às marcações e notas deste capítulo. Visitante (user null) fica
  // com as listas vazias, sem tocar no Firestore.
  useEffect(() => {
    if (view !== 'verses' || !bookId || !chapter || !user) {
      setChapterHighlights([]);
      setChapterNotes([]);
      return;
    }
    const u1 = watchChapterHighlights(bookId, chapter, setChapterHighlights);
    const u2 = watchChapterNotes(bookId, chapter, setChapterNotes);
    return () => { u1(); u2(); };
  }, [view, bookId, chapter, user]);

  // Mapa: { verseNumber: highlight }
  const highlightsByVerse = useMemo(() => {
    const map = {};
    chapterHighlights.forEach((h) => { map[h.verse] = h; });
    return map;
  }, [chapterHighlights]);

  // Versículos com nota (Set) e mapa versículo -> id da nota (para abrir a nota)
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

  // Scroll até versículo destacado (chegada por referência, busca, liturgia...).
  // Este scroll é NOSSO e precisa armar o mesmo guarda da restauração, senão o
  // onScroll que ele provoca é lido como gesto do usuário e a consulta passa a
  // sobrescrever o "Continue lendo", exatamente o que a separação entre ler e
  // consultar existe para impedir.
  useEffect(() => {
    if (!chapterData?.verses?.length || !highlightVerse) return undefined;
    const idx = chapterData.verses.findIndex((v) => v.n === highlightVerse);
    if (idx < 0 || !verseListRef.current) return undefined;
    const timer = setTimeout(() => {
      // Sem alvo em pixels: scrollToIndex resolve o offset por dentro, então
      // dentro da janela qualquer posição conta como nossa.
      autoScroll.current = { target: null, until: Date.now() + AUTO_SCROLL_WINDOW_MS };
      autoUntil.value = autoScroll.current.until;
      verseListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 });
    }, 350);
    return () => clearTimeout(timer);
  }, [chapterData, highlightVerse, autoUntil]);

  // ===== Ações do versículo (folha) =====
  // Estável: é o onPress de todas as VerseRow (memo).
  const openActions = useCallback((verse) => setActionVerse(verse), []);
  const closeActions = () => setActionVerse(null);

  // Ação adiada até a folha sair de cena. O convite de conta é outro Modal, e
  // o iOS não apresenta dois ao mesmo tempo: a folha chama onDismissed no fim
  // da animação de saída, com o Modal já desmontado, e só aí o convite abre.
  const afterSheet = useRef(null);
  const onSheetDismissed = useCallback(() => {
    const fn = afterSheet.current;
    afterSheet.current = null;
    fn?.();
  }, []);

  const gateOpts = {
    title: isEn ? 'Highlight verse?' : 'Marcar versículo?',
    message: isEn
      ? 'To highlight verses and create notes, create a free account. Your annotations stay saved and synced across devices.'
      : 'Para marcar versículos e criar notas, crie uma conta gratuita. Suas marcações ficam salvas e sincronizadas entre dispositivos.',
    icon: 'color-fill-outline',
  };

  // Fecha a folha e executa. Visitante vê o convite de conta, mas só depois
  // que a folha saiu (onSheetDismissed).
  const withAccount = (fn) => {
    setActionVerse(null);
    if (user) { fn(); return; }
    afterSheet.current = () => requireAccount(fn, gateOpts);
  };

  const applyHighlight = async (verseN, color) => {
    const existing = highlightsByVerse[verseN];
    try {
      if (existing) await removeHighlight(existing.id);
      if (!existing || existing.color !== color) {
        await addHighlight({ bookId: book.id, chapter, verse: verseN, color });
      }
    } catch (e) {
      notify(isEn ? 'Error' : 'Erro', e.message || (isEn ? 'Could not save the highlight.' : 'Não consegui salvar a marcação.'));
    }
  };

  const onPickColor = (color) => {
    const v = actionVerse;
    if (!v) return;
    withAccount(() => applyHighlight(v.n, color));
  };

  // Marcar de novo com a mesma cor remove (é o que applyHighlight faz).
  const onRemoveHighlight = () => {
    const v = actionVerse;
    const existing = v && highlightsByVerse[v.n];
    if (!existing) return;
    withAccount(() => applyHighlight(v.n, existing.color));
  };

  const onNote = () => {
    const v = actionVerse;
    if (!v) return;
    withAccount(() => navigation.navigate('NoteEditor', {
      bookId: book.id,
      chapter,
      verseStart: v.n,
      verseEnd: v.n,
    }));
  };

  const onOpenNote = () => {
    const v = actionVerse;
    setActionVerse(null);
    const noteId = v && noteIdByVerse[v.n];
    if (noteId) navigation.navigate('NoteEditor', { noteId });
  };

  const verseRef = (verse) => formatVerseRef({ bookName: bn(book), chapter, verse: verse?.n }, isEn);

  const onCopy = async () => {
    const v = actionVerse;
    if (!v) return;
    setActionVerse(null);
    await Clipboard.setStringAsync(`${verseRef(v)}\n${v.t}`);
    notify(isEn ? 'Copied' : 'Copiado', isEn ? 'Verse copied to clipboard.' : 'Versículo copiado para a área de transferência.');
  };

  const onShare = () => {
    const v = actionVerse;
    if (!v) return;
    setActionVerse(null);
    shareVerse({ text: v.t, ref: verseRef(v), isEn });
  };

  // ===== Narração do capítulo =====
  // speakLong fatia o texto no limite do TTS do Android e encadeia os pedaços;
  // stopSpeaking invalida a fila, então um onDone atrasado não fala por cima.
  const toggleChapterTts = async () => {
    if (speaking || (await isSpeaking())) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!chapterData?.verses?.length) return;
    setSpeaking(true);
    const textLang = chapterData.language === 'en' ? 'en' : 'pt';
    const [voice, rate] = await Promise.all([resolveVoice(textLang), getSavedRate()]);
    const intro = `${bn(book)} ${chapter}. `;
    const body = chapterData.verses.map((v) => `${v.n}. ${v.t}`).join(' ');
    const done = () => setSpeaking(false);
    speakLong(intro + body, {
      language: voice?.language || ttsLocale(textLang),
      voice: voice?.identifier,
      rate,
      pitch: 1.0,
      onDone: done,
      onStopped: done,
      onError: () => {
        done();
        notify(
          isEn ? 'Narration failed' : 'Erro na narração',
          isEn
            ? 'Could not play audio. Go to Settings → Voice to configure an English voice.'
            : 'Não foi possível reproduzir. Acesse Ajustes → Voz para configurar.',
        );
      },
    });
  };

  // Para a narração quando o capítulo muda, a tela é desmontada ou perde o foco
  // (a aba Bíblia nunca desmonta ao trocar de aba, então o blur é essencial).
  useEffect(() => () => { stopSpeaking(); }, []);
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      stopSpeaking();
      setSpeaking(false);
    });
    return unsub;
  }, [navigation]);
  useEffect(() => {
    if (speaking) { stopSpeaking(); setSpeaking(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, book?.id]);

  const styles = useMemo(() => makeStyles(colors, tokens), [colors, tokens]);

  // "50 capítulos · deuterocanônico", para a linha do livro e o subtítulo da grade.
  const bookMeta = useCallback((b) => {
    const count = b.totalChapters > 1 ? `${b.totalChapters} ${t('bible.chapters')}` : t('bible.oneChapter');
    return b.deutero ? `${count} · ${t('bible.deutero')}` : count;
  }, [t]);

  const openBook = useCallback((b) => goTo({ view: 'chapters', book: b }), [goTo]);
  const openChapter = useCallback((c) => goTo({ view: 'verses', book, chapter: c }), [goTo, book]);

  // Estilos da célula da grade, num objeto só e estável (ChapterCell é memo).
  const cellStyles = useMemo(() => ({
    cell: styles.cell,
    num: text('body'),
    bg: colors.card,
    readBg: colors.separator,
    pressedBg: colors.separator,
    color: colors.text,
    readColor: colors.accentText,
  }), [styles.cell, text, colors.card, colors.separator, colors.text, colors.accentText]);

  // Estilos da linha de versículo, idem (VerseRow é memo). O número fica
  // centrado na primeira linha do texto.
  const verseStyles = useMemo(() => {
    const numStyle = text('caption1');
    const readingStyle = text('readingBible');
    const numOffset = Math.max(0, (readingStyle.lineHeight - numStyle.lineHeight) / 2);
    return {
      row: styles.verseRow,
      num: styles.verseNum,
      text: styles.verseText,
      strong: styles.verseTextStrong,
      numStyle,
      readingStyle,
      numOffset,
      noteIcon: { marginTop: numOffset },
      pressedBg: colors.card,
      iconSize: icon.sm,
      iconColor: colors.accent,
    };
  }, [styles, text, colors.card, colors.accent, icon.sm]);

  // Texto sobre a cor de marcação (pastel): precisa ser escuro nos dois
  // temas. No claro é o texto normal; no escuro o texto é creme, então usa a
  // cor que já vai por cima do tint (navy).
  const onHighlight = darkMode ? colors.onTint : colors.text;

  const renderVerse = useCallback(({ item }) => {
    const isDeepLinked = Boolean(highlightVerse && item.n >= highlightVerse && item.n <= (highlightVerseEnd || highlightVerse));
    const userHighlight = highlightsByVerse[item.n];
    return (
      <VerseRow
        verse={item}
        bg={userHighlight ? userHighlight.color : isDeepLinked ? colors.deepLinkHl : null}
        numColor={userHighlight ? onHighlight : isDeepLinked ? colors.text : colors.accentText}
        textColor={userHighlight ? onHighlight : colors.text}
        strong={isDeepLinked}
        hasNote={versesWithNotes.has(item.n)}
        onPress={openActions}
        s={verseStyles}
      />
    );
  }, [highlightVerse, highlightVerseEnd, highlightsByVerse, versesWithNotes, colors.deepLinkHl, colors.text, colors.accentText, onHighlight, openActions, verseStyles]);

  const translation = chapterData?.language === 'en' ? 'Douay-Rheims-Challoner' : 'Ave Maria';
  const footer = useMemo(() => (
    <Text style={[text('footnote'), styles.footer]}>{t('bible.translation', { name: translation })}</Text>
  ), [text, styles.footer, t, translation]);

  // ===== LIVROS =====
  if (view === 'books') {
    const q = filterText.trim().toLowerCase();
    const filtered = q
      ? BIBLE_BOOKS.filter((b) =>
          b.name.toLowerCase().includes(q) || b.short.toLowerCase().includes(q) ||
          b.nameEn?.toLowerCase().includes(q) || b.shortEn?.toLowerCase().includes(q))
      : BIBLE_BOOKS;

    const testaments = [
      { key: 'AT', title: t('bible.oldTestament') },
      { key: 'NT', title: t('bible.newTestament') },
    ]
      .map((tst) => ({ ...tst, books: filtered.filter((b) => b.testament === tst.key) }))
      .filter((tst) => tst.books.length > 0);

    const continueBook = savedPosition && !q ? BIBLE_BOOKS.find((x) => x.id === savedPosition.bookId) : null;

    return (
      <LargeTitleScreen
        title={t('tab.bible')}
        subtitle={t('bible.canonSubtitle')}
        renderList={(list) => (
          <Animated.ScrollView
            ref={booksScrollRef}
            onScroll={list.onScroll}
            scrollEventThrottle={list.scrollEventThrottle}
            contentContainerStyle={list.contentContainerStyle}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {list.header}
            <SearchField
              value={filterText}
              onChangeText={setFilterText}
              placeholder={t('bible.searchBook')}
              clearLabel={t('common.clear')}
              style={styles.search}
            />
            {continueBook ? (
              <ContinueBibleCard
                label={`${bn(continueBook)} ${savedPosition.chapter}`}
                chapterRatio={savedPosition.ratio}
                stats={stats}
                onPress={resumeReading}
                style={styles.continueCard}
              />
            ) : null}
            {testaments.map((tst) => (
              <View key={tst.key}>
                <SectionTitle title={tst.title} style={styles.sectionTitle} />
                <Group>
                  {tst.books.map((b) => (
                    <BookRow key={b.id} book={b} title={bn(b)} subtitle={bookMeta(b)} onPress={openBook} />
                  ))}
                </Group>
              </View>
            ))}
            {testaments.length === 0 ? (
              <EmptyState icon="search-outline" title={t('bible.noBook')} />
            ) : null}
          </Animated.ScrollView>
        )}
      />
    );
  }

  // ===== CAPÍTULOS =====
  if (view === 'chapters' && book) {
    const allChapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);
    const readCount = allChapters.filter((c) => readChapters.has(c)).length;
    // Grade de quadrados de pelo menos 44, quantos couberem na largura útil,
    // esticados para fechar a linha sem sobra à direita.
    const gap = space.xs;
    const inner = windowWidth - space.md * 2;
    const cols = Math.max(1, Math.floor((inner + gap) / (TARGET + gap)));
    const cell = Math.floor((inner - gap * (cols - 1)) / cols);

    return (
      <LargeTitleScreen
        title={bn(book)}
        subtitle={bookMeta(book)}
        back={{ label: t('tab.bible'), a11yLabel: t('common.back'), onPress: goBackLevel }}
      >
        {readCount > 0 ? (
          <View style={styles.bookProgress}>
            <ProgressBar
              value={readCount / book.totalChapters}
              accessibilityLabel={`${t('bible.ofTotal', { n: readCount, total: book.totalChapters })} ${t('bible.chaptersRead')}`}
            />
            <Text style={[text('footnote'), styles.bookProgressText]}>
              {t('bible.ofTotal', { n: readCount, total: book.totalChapters })} {t('bible.chaptersRead')}
            </Text>
          </View>
        ) : null}
        <View style={[styles.grid, { gap }]}>
          {allChapters.map((c) => {
            const isRead = readChapters.has(c);
            return (
              <ChapterCell
                key={c}
                n={c}
                isRead={isRead}
                size={cell}
                label={isRead ? `${t('bible.chapter')} ${c}, ${t('bible.chapterDone')}` : `${t('bible.chapter')} ${c}`}
                onPress={openChapter}
                s={cellStyles}
              />
            );
          })}
        </View>
      </LargeTitleScreen>
    );
  }

  // ===== VERSÍCULOS =====
  if (view === 'verses' && book && chapter) {
    const hasPrev = chapter > 1;
    const hasNext = chapter < book.totalChapters;
    // Três situações diferentes, que antes cairiam todas no mesmo texto:
    //   aguardando  -> a tradução ainda está sendo baixada (ou falhou)
    //   isEmpty     -> a tradução está aqui, mas este capítulo não foi adicionado
    const aguardando = !bibliaPronta.pronta;
    const isEmpty = !aguardando && !chapterData?.verses?.length;
    const goPrev = () => { if (hasPrev) goTo({ view: 'verses', book, chapter: chapter - 1 }); };
    const goNext = () => { if (hasNext) goTo({ view: 'verses', book, chapter: chapter + 1 }); };

    const title = `${bn(book)} ${chapter}`;
    const subtitle = `${pick(book, 'group', isEn)}, ${t('bible.chapterOf', { n: chapter, total: book.totalChapters })}`;
    const back = {
      label: fromDeepLink ? t('common.back') : bn(book),
      a11yLabel: t('common.back'),
      onPress: goBackLevel,
    };
    const right = (
      <PressScale
        role="button"
        aria-label={speaking ? t('bible.stopListening') : t('bible.listen')}
        aria-pressed={speaking}
        onPress={toggleChapterTts}
        style={styles.iconButton}
      >
        <Ionicons
          name={speaking ? 'stop-circle' : 'volume-high-outline'}
          size={icon.lg}
          color={speaking ? colors.accent : colors.tint}
        />
      </PressScale>
    );

    // Sem lista (carregando ou capítulo em preparação) a pílula fica fixa à
    // vista (sem `visible`): é por ela que se avança ao capítulo seguinte,
    // como o rodapé antigo permitia.
    const pill = (
      <ChapterPill
        label={t('bible.ofTotal', { n: chapter, total: book.totalChapters })}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goPrev}
        onNext={goNext}
        prevLabel={t('bible.prevChapter')}
        nextLabel={t('bible.nextChapter')}
        visible={aguardando || isEmpty ? undefined : pillVisible}
      />
    );

    if (aguardando || isEmpty) {
      return (
        <View style={styles.screen}>
          <LargeTitleScreen title={title} subtitle={subtitle} back={back} right={right}>
            {aguardando ? (
              <BibleLoadingState erro={bibliaPronta.erro} onTentarDeNovo={bibliaPronta.tentarDeNovo} />
            ) : (
              <EmptyState
                icon="time-outline"
                title={t('bible.chapterPrep')}
                message={isEn
                  ? 'This chapter of the deuterocanonical books has not been added to the app yet.'
                  : 'Este capítulo dos livros deuterocanônicos ainda não foi adicionado ao app.'}
              />
            )}
          </LargeTitleScreen>
          {pill}
        </View>
      );
    }

    const current = actionVerse ? highlightsByVerse[actionVerse.n] : null;

    return (
      <View style={styles.screen}>
        <LargeTitleScreen
          title={title}
          subtitle={subtitle}
          back={back}
          right={right}
          renderList={(list) => (
            <VerseList
              list={list}
              listRef={verseListRef}
              data={chapterData.verses}
              renderItem={renderVerse}
              footer={footer}
              onScrollJS={onVerseScroll}
              onScrollBeginDrag={marcarLeitura}
              onTouchMove={marcarLeitura}
              onContentSizeChange={onVerseContentSize}
              onLayout={onVerseLayout}
              pillVisible={pillVisible}
              autoUntil={autoUntil}
            />
          )}
        />

        {/* Progresso da leitura deste capítulo, colado sob a barra do topo.
            Alimenta também o "continue lendo". */}
        <View style={[styles.progress, { top: insets.top + BAR_HEIGHT }]}>
          <ReadingProgressBar progressValue={progressSv} />
        </View>

        {pill}

        <VerseActionsSheet
          verse={actionVerse}
          title={verseRef(actionVerse)}
          currentColor={current?.color}
          hasNote={actionVerse ? versesWithNotes.has(actionVerse.n) : false}
          onColor={onPickColor}
          onRemoveHighlight={onRemoveHighlight}
          onNote={onNote}
          onOpenNote={onOpenNote}
          onCopy={onCopy}
          onShare={onShare}
          onClose={closeActions}
          onDismissed={onSheetDismissed}
        />
      </View>
    );
  }

  return null;
}

const makeStyles = (c, { space, radius }) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    search: { marginBottom: space.md },
    continueCard: { marginBottom: space.xs },
    // O conteúdo do LargeTitleScreen já tem o recuo lateral.
    sectionTitle: { marginHorizontal: 0 },
    bookProgress: { marginBottom: space.lg },
    bookProgressText: { color: c.textSubtle, marginTop: space.xs },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    iconButton: { width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center' },
    // A marcação sangra `space.xs` para cada lado do texto, que continua
    // alinhado ao recuo do conteúdo.
    verseRow: {
      flexDirection: 'row',
      gap: space.sm,
      paddingVertical: space.xs,
      paddingHorizontal: space.xs,
      marginHorizontal: -space.xs,
      borderRadius: radius.sm,
    },
    verseNum: { fontWeight: '600', minWidth: space.lg },
    verseText: { flex: 1 },
    verseTextStrong: { fontWeight: '600' },
    footer: { color: c.textSubtle, textAlign: 'center', marginTop: space.xl },
    progress: { position: 'absolute', left: 0, right: 0, pointerEvents: 'none' },
  });
