import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Platform, AppState } from 'react-native';
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
import ReadingProgressBar from '../components/ReadingProgressBar';
import ContinueBibleCard from '../components/ContinueBibleCard';
import {
  saveBiblePosition, getBiblePosition,
  markChapterRead, getReadChapters, getBibleStats,
  READ_THRESHOLD,
} from '../utils/bibleProgress';

// Por quanto tempo, depois de abrir um capitulo, ainda tentamos restaurar o
// scroll salvo. Cobre o crescimento progressivo da FlatList sem atrapalhar
// quem ja comecou a ler.
const RESTORE_WINDOW_MS = 1500;

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

  // ===== Progresso de leitura (ver src/utils/bibleProgress.js) =====
  // Quanto do capítulo atual já foi rolado (0..1), alimenta a barra do topo.
  // A proporcao lida anda junto do capitulo a que pertence. Guardar so o numero
  // abria uma corrida: `chapter` muda num render e o reset da proporcao so vinha
  // no efeito seguinte, entao o efeito de marcacao via o capitulo NOVO com a
  // proporcao ANTIGA e marcava o capitulo como lido sozinho ao avancar.
  const [progresso, setProgresso] = useState({ chave: null, ratio: 0 });
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

  // ===== Progresso de leitura =====
  // bookId em variável própria (em vez de book?.id direto nas deps) para os
  // hooks abaixo não dispararem o aviso de exhaustive-deps.
  const bookId = book?.id ?? null;

  // Debounced: o scroll dispara dezenas de eventos e cada um viraria uma escrita.
  const queueSave = useCallback((bId, ch, ratio) => {
    if (!bId || !ch) return;
    pendingSave.current = { bookId: bId, chapter: ch, ratio };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      if (pendingSave.current) saveBiblePosition(pendingSave.current);
    }, 500);
  }, []);

  // Grava na hora o que estiver pendente. Sem isso, quem fecha o app logo depois
  // de rolar perderia os últimos 500 ms — justamente o ponto onde parou.
  const flushSave = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    if (pendingSave.current) {
      saveBiblePosition(pendingSave.current);
      pendingSave.current = null;
    }
  }, []);

  // Tenta restaurar o scroll pendente com as medidas que já temos. Chamada por
  // onLayout e por onContentSizeChange: a lista cresce em etapas, então não
  // desistimos na primeira tentativa — só quando o usuário arrasta ou a janela
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
        setProgresso({ chave: chaveAtual.current, ratio: pending.ratio });
        const alvo = pending.ratio * scrollable;
        autoScroll.current = { target: alvo, until: Date.now() + 600 };
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
    if (scrollable <= 4) setProgresso({ chave: chaveAtual.current, ratio: 1 });
  }, [measureFromNode]);

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
    setProgresso({ chave: `${bookId}:${chapter}`, ratio: 0 });
    markedKey.current = null;
    userScrolled.current = false;
    const pos = savedPosition;
    const shouldRestore = pos && pos.bookId === bookId && pos.chapter === chapter
      && pos.ratio > 0.01 && !highlightVerse;
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
  }, [bookId, chapter, flushSave, savedPosition, highlightVerse, tryRestore]);

  // Passou do limiar: marca como lido. Uma tentativa por capítulo (markedKey),
  // já que o ratio continua mudando acima do limiar.
  useEffect(() => {
    if (view !== 'verses' || !bookId || !chapter) return;
    const chave = `${bookId}:${chapter}`;
    // A proporcao tem de ser DESTE capitulo, senao e sobra do anterior.
    if (progresso.chave !== chave || progresso.ratio < READ_THRESHOLD) return;
    // Abrir por link não conta como ler, senão cinco buscas viram cinco
    // capítulos com tique na grade e no contador do cânon. Um capítulo aberto
    // pela grade conta, mesmo sem arrasto: há curtos que cabem inteiros na tela.
    if (fromDeepLink && !userScrolled.current) return;
    const key = `${bookId}:${chapter}`;
    if (markedKey.current === key) return;
    markedKey.current = key;
    let alive = true;
    markChapterRead(bookId, chapter).then((s) => { if (alive && s) setReadChapters(s); });
    return () => { alive = false; };
  }, [view, bookId, chapter, progresso, fromDeepLink]);

  // Sair da aba grava; sair do app também (blur não dispara ao ir pro background).
  useEffect(() => {
    const unsubBlur = navigation.addListener('blur', flushSave);
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flushSave();
    });
    return () => { unsubBlur(); sub.remove(); };
  }, [navigation, flushSave]);

  useEffect(() => () => flushSave(), [flushSave]);

  // Handlers da lista de versículos: compõem os do useScrollHints com o progresso.
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
    verseHints.onScroll(e);
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    verseLayoutH.current = layoutMeasurement.height;
    const scrollable = contentSize.height - layoutMeasurement.height;
    const r = scrollable > 4 ? contentOffset.y / scrollable : 1;
    const clamped = Math.max(0, Math.min(1, r));
    setProgresso({ chave: `${bookId}:${chapter}`, ratio: clamped });
    // Consulta não move o "continue lendo": uma busca que cai em Apocalipse 22
    // não pode apagar o ponto de quem estava lendo Gênesis 15. Ao arrastar, o
    // usuário promove aquilo a leitura e a gravação passa a valer.
    // Scroll que nao veio de nos, e fora da janela do nosso proprio scroll, e
    // do usuario. Cobre roda do mouse, onde nao ha evento de toque.
    const auto = autoScroll.current;
    const nossoScroll = Date.now() < auto.until && Math.abs(contentOffset.y - auto.target) < 8;
    if (!nossoScroll && contentOffset.y > 0) userScrolled.current = true;

    if (!fromDeepLink || userScrolled.current) queueSave(bookId, chapter, clamped);
  }, [verseHints, queueSave, bookId, chapter, fromDeepLink]);

  const onVerseLayout = useCallback((e) => {
    verseHints.onLayout(e);
    verseLayoutH.current = e.nativeEvent.layout.height;
    tryRestore();
  }, [verseHints, tryRestore]);

  const onVerseContentSize = useCallback((w, h) => {
    verseHints.onContentSizeChange(w, h);
    verseContentH.current = h;
    tryRestore();
  }, [verseHints, tryRestore]);

  // Abre o capítulo salvo a partir do card "Continue lendo".
  const resumeReading = useCallback(() => {
    const pos = savedPosition;
    if (!pos) return;
    const b = BIBLE_BOOKS.find((x) => x.id === pos.bookId);
    if (!b) return;
    setBook(b);
    setChapter(pos.chapter);
    setHighlightVerse(null);
    setHighlightVerseEnd(null);
    setFromDeepLink(false);
    setView('verses');
  }, [savedPosition]);

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

  // Para TTS quando capítulo muda, tela é desmontada ou perde o foco
  // (a aba Bíblia nunca desmonta ao trocar de aba, então o blur é essencial).
  useEffect(() => {
    return () => { speakingRef.current = false; Speech.stop(); };
  }, []);
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      speakingRef.current = false;
      Speech.stop();
      setSpeaking(false);
    });
    return unsub;
  }, [navigation]);
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

        {savedPosition && !filterText.trim() && (() => {
          const b = BIBLE_BOOKS.find((x) => x.id === savedPosition.bookId);
          if (!b) return null;
          return (
            <ContinueBibleCard
              label={`${bn(b)} ${savedPosition.chapter}`}
              chapterRatio={savedPosition.ratio}
              stats={stats}
              onPress={resumeReading}
            />
          );
        })()}

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
    const readCount = allChapters.filter((c) => readChapters.has(c)).length;
    return (
      <View style={styles.container}>
        <Text style={styles.bookHeader}>{bn(book)}</Text>
        {readCount > 0 && (
          <View style={styles.bookProgress}>
            <View style={styles.bookProgressTrack}>
              <View style={[styles.bookProgressFill, { width: `${(readCount / book.totalChapters) * 100}%` }]} />
            </View>
            <Text style={styles.bookProgressText}>
              {readCount}/{book.totalChapters} {t('bible.chaptersRead')}
            </Text>
          </View>
        )}
        <FlatList
          key="chapters-grid"
          data={allChapters}
          keyExtractor={(c) => String(c)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item }) => {
            const isRead = readChapters.has(item);
            return (
              <TouchableOpacity
                style={[styles.chapterCell, isRead && styles.chapterCellRead]}
                onPress={() => { setChapter(item); setHighlightVerse(null); setView('verses'); setFromDeepLink(false); }}
                accessibilityRole="button"
                accessibilityLabel={isRead
                  ? `${isEn ? 'Chapter' : 'Capítulo'} ${item}, ${t('bible.chapterDone')}`
                  : `${isEn ? 'Chapter' : 'Capítulo'} ${item}`}
              >
                <Text style={[styles.chapterCellText, isRead && styles.chapterCellTextRead]}>{item}</Text>
                {isRead && (
                  <Ionicons name="checkmark" size={11} color={colors.accentText} style={styles.chapterCheck} />
                )}
              </TouchableOpacity>
            );
          }}
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

        {/* Progresso da leitura deste capítulo. Alimenta também o "continue lendo". */}
        {!isEmpty && <ReadingProgressBar progress={progresso.chave === `${bookId}:${chapter}` ? progresso.ratio : 0} />}

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
            onScroll={onVerseScroll}
            onScrollBeginDrag={marcarLeitura}
            onTouchMove={marcarLeitura}
            onContentSizeChange={onVerseContentSize}
            onLayout={onVerseLayout}
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
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    // Capítulo já lido: fundo dourado suave + tique. A borda continua a mesma,
    // então a grade não "pula" quando um capítulo muda de estado.
    chapterCellRead: { backgroundColor: c.badgeBg },
    chapterCellTextRead: { color: c.accentText },
    chapterCheck: { position: 'absolute', top: 3, right: 4 },
    bookProgress: { paddingHorizontal: 16, marginBottom: 14 },
    bookProgressTrack: { height: 4, borderRadius: 2, backgroundColor: c.divider, overflow: 'hidden' },
    bookProgressFill: { height: '100%', backgroundColor: c.accent },
    bookProgressText: { fontSize: fs(11), color: c.textSubtle, marginTop: 5 },
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
      fontSize: fs(11), color: c.accentText, fontWeight: 'bold',
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
    modalRef: { fontSize: fs(15), fontWeight: 'bold', color: c.accentText, marginBottom: 4 },
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
