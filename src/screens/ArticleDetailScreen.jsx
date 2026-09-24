import { useEffect, useLayoutEffect, useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { articles } from '../data/articles';
import { referenceById, translateRef, translateAuthor, translateYear } from '../data/references';
import { referencesEn } from '../data/references-en';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareArticle } from '../utils/share';
import { pick, categoryLabel } from '../utils/i18nData';
import { speakLong, stopSpeaking, isSpeaking } from '../utils/speakLong';
import { resolveVoice, getSavedRate } from '../utils/ttsVoice';
import { setLastRead } from '../utils/lastRead';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { markPlanDay } from '../utils/readingProgress';
import { planEntriesByArticle } from '../data/readingPlan';
import { translucentHeaderOptions, fullBleedContentOptions } from '../navigation/chrome';
import { Button, Group, Row, SectionTitle, PressScale } from '../components/ui';
import BrandMark from '../components/BrandMark';
import ImageZoomModal from '../components/ImageZoomModal';
import ReadingProgressBar from '../components/ReadingProgressBar';
import RelatedArticles from '../components/RelatedArticles';
import RelatedDialogues from '../components/RelatedDialogues';
import MarkdownText from '../components/MarkdownText';

// Alvo de toque das ações do header (HIG), a única medida solta da tela.
const ACTION_SIZE = 44;

// Progresso de leitura persistido (lastRead.js): grava no máximo a cada 1 s
// ou quando avança 5 pontos percentuais, e sempre ao sair da tela.
const PROGRESS_WRITE_MS = 1000;
const PROGRESS_WRITE_STEP = 0.05;

// Coluna de leitura no desktop (web): largura máxima do texto e, a partir de
// que sobra lateral (gutter) as cruzes decorativas aparecem. O BrandMark "lg"
// tem 44 de largura, e a cruz fica centrada no gutter.
const READING_COLUMN = 720;
const CROSS_MIN_GUTTER = 150;
const CROSS_WIDTH = 44;

// Só na web (stack JS, header do elements): com o título alinhado à esquerda o
// Header calcula o maxWidth do título contando UM botão de 72 pt à direita
// (node_modules/@react-navigation/elements/lib/module/Header/Header.js:197);
// com três ações de 44 ele invadiria a direita. Aqui o título encolhe
// (flexShrink) e o contêiner da direita fica com a largura do conteúdo. No
// nativo o header é do sistema e cuida disso sozinho; as chaves são ignoradas.
const WEB_HEADER_LAYOUT = Platform.OS === 'web'
  ? {
      headerTitleContainerStyle: { flexGrow: 1, flexShrink: 1, flexBasis: 0, maxWidth: '100%' },
      headerRightContainerStyle: { flexGrow: 0, flexBasis: 'auto' },
    }
  : null;

// Limpa marcadores de markdown que poluem a narração.
const stripMarkdownForTts = (s) =>
  String(s || '')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')        // [[termo]] → termo
    .replace(/\*\*([^*]+)\*\*/g, '$1')         // **bold** → bold
    .replace(/__([^_]+)__/g, '$1')             // __italic__ → italic
    .replace(/\*([^*]+)\*/g, '$1')             // *italic* → italic
    .replace(/_([^_]+)_/g, '$1')               // _italic_ → italic
    .replace(/`([^`]+)`/g, '$1')               // `code` → code
    .replace(/^#{1,6}\s*/gm, '')               // # headers
    .replace(/[\u200B-\u200D\uFEFF]/g, '');    // zero-width chars

// Cópia do useTabBarHeightSafe de src/components/ui/LargeTitleScreen.jsx
// (arquivo de outra onda): useBottomTabBarHeight() lança quando não há tab
// navigator por cima (node_modules/@react-navigation/bottom-tabs/src/utils/
// useBottomTabBarHeight.tsx:8-12). Esta tela vive nos stacks das abas, mas o
// mesmo componente responde por 'ArticleFromSearch' em qualquer stack, então
// fora das abas o recuo é zero.
function useTabBarHeightSafe() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}

// As três ações do header: ouvir/parar, compartilhar, guardar/remover. Cada
// uma é um PressScale de 44x44 com o ícone em `tint`; o estado (narrando,
// guardado) aparece no ícone preenchido e no rótulo de acessibilidade.
function HeaderActions({ speaking, fav, labels, onListen, onShare, onFav }) {
  const { colors, tokens } = useTheme();
  const btn = {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.md,
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: tokens.space.xxs }}>
      <PressScale role="button" aria-label={speaking ? labels.stop : labels.listen} onPress={onListen} style={btn}>
        <Ionicons name={speaking ? 'stop-circle' : 'volume-high-outline'} size={tokens.icon.md} color={colors.tint} />
      </PressScale>
      <PressScale role="button" aria-label={labels.share} onPress={onShare} style={btn}>
        <Ionicons name="share-outline" size={tokens.icon.md} color={colors.tint} />
      </PressScale>
      <PressScale role="button" aria-label={fav ? labels.unsave : labels.save} onPress={onFav} style={btn}>
        <Ionicons name={fav ? 'bookmark' : 'bookmark-outline'} size={tokens.icon.md} color={colors.tint} />
      </PressScale>
    </View>
  );
}

export default function ArticleDetailScreen({ route, navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { width: winWidth } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeightSafe();
  const article = articles.find((a) => a.id === route.params?.articleId);

  // Cruzes decorativas nos gutters da coluna central (só desktop), igual ao
  // "Dia de hoje": BrandMark "lg" esmaecido, escondido do leitor de tela.
  const gutter = (winWidth - READING_COLUMN) / 2;
  const showSideCrosses = Platform.OS === 'web' && gutter >= CROSS_MIN_GUTTER;
  const crossLeft = Math.max(0, gutter / 2 - CROSS_WIDTH / 2);

  // Herói: mede a largura e dá altura explícita (sem corte em web/nativo).
  // As proporções são da imagem, não medidas de layout.
  const [heroW, setHeroW] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const boxAspect = Math.max(article?.imageAspect || 1.6, 1.3);
  const heroH = heroW > 0 ? Math.round(heroW / boxAspect) : 0;

  // Conteúdo no idioma escolhido, com fallback para PT se a tradução não existir.
  const displayTitle = pick(article, 'title', isEn);
  const displayBody = pick(article, 'body', isEn);
  const showTranslationNotice = isEn && !article?.bodyEn && !!article?.body;

  const [progress, setProgress] = useState(0);
  const [fav, setFav] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef(null);
  const scrollYRef = useRef(0);
  const savedScrollRef = useRef(0);

  useEffect(() => {
    if (!article) return undefined;
    setLastRead(article.id);
    // Vindo do plano: credita o trilho/dia exatos. Fora do plano: credita
    // todos os dias (em qualquer trilho) que contêm este artigo.
    const { fromPlanTrack, fromPlanDay } = route.params || {};
    if (fromPlanTrack && fromPlanDay) {
      markPlanDay(fromPlanTrack, fromPlanDay);
    } else {
      planEntriesByArticle(article.id).forEach((e) => markPlanDay(e.trackId, e.day));
    }
    isFavorite(article.id).then(setFav);
    // Para o TTS se a tela for desmontada
    return () => { stopSpeaking(); };
  }, [article, route.params]);

  // Progresso de leitura por artigo: a fração máxima alcançada (0 a 1) vai
  // para lastRead.js (a Início mostra a barra do "Continuar lendo"). `written`
  // começa em 0 para não gravar nada se a pessoa nem rolou.
  const progressRef = useRef({ max: 0, written: 0, at: 0 });
  const persistProgress = useCallback((force) => {
    if (!article) return;
    const s = progressRef.current;
    if (s.max <= s.written) return;
    const now = Date.now();
    if (!force && now - s.at < PROGRESS_WRITE_MS && s.max - s.written < PROGRESS_WRITE_STEP) return;
    s.at = now;
    s.written = s.max;
    setLastRead(article.id, s.max);
  }, [article]);

  useEffect(() => {
    progressRef.current = { max: 0, written: 0, at: 0 };
    // Ao desmontar (ou trocar de artigo na mesma tela) grava o que faltou.
    return () => persistProgress(true);
  }, [article, persistProgress]);

  // Ao sair da tela (voltar, trocar de aba ou empurrar outra por cima): para o
  // TTS e grava o progresso.
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      stopSpeaking();
      setSpeaking(false);
      persistProgress(true);
    });
    return unsub;
  }, [navigation, persistProgress]);

  const onToggleSpeak = async () => {
    if (!article) return;
    if (speaking || (await isSpeaking())) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);

    // Escolhe o idioma do TEXTO (não da interface). Se UI=EN mas artigo só tem PT,
    // narra em PT pra não dar sotaque/incoerência.
    const useEnText = isEn && !!article.bodyEn;
    const textLang = useEnText ? 'en' : 'pt';
    const [voice, rate] = await Promise.all([resolveVoice(textLang), getSavedRate()]);
    const rawText = `${pick(article, 'title', useEnText)}. ${pick(article, 'body', useEnText)}`;
    const speechText = stripMarkdownForTts(rawText);
    const defaultLang = textLang === 'en' ? 'en-US' : 'pt-BR';

    // speakLong fatia o texto (limite do Android) e chama os callbacks finais
    // uma vez só, para a narração inteira.
    speakLong(speechText, {
      language: voice?.language || defaultLang,
      voice: voice?.identifier,
      rate,
      pitch: 1.0,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const onShare = () => {
    if (!article) return;
    shareArticle({ title: article.title, summary: article.summary });
  };

  // Favoritos ficam no aparelho (AsyncStorage): funcionam sem conta.
  const onToggleFav = async () => {
    if (!article) return;
    await toggleFavorite(article.id);
    setFav((f) => !f);
  };

  // Os handlers mudam a cada render (fecham sobre article, isEn, speaking);
  // o header lê a versão atual pela ref e o efeito abaixo só depende do que
  // muda o visual (estado e rótulos), sem closure velha nem re-set por render.
  const actionsRef = useRef({});
  actionsRef.current = { onToggleSpeak, onShare, onToggleFav };

  // Header translúcido (opt-in da Onda 3) com o título completo à esquerda e
  // as três ações à direita. Layout effect: as opções valem antes da pintura.
  useLayoutEffect(() => {
    if (!article) return;
    const labels = {
      listen: t('articles.listen'),
      stop: t('articles.stopListening'),
      share: t('common.share'),
      save: t('articles.save'),
      unsave: t('articles.unsave'),
    };
    navigation.setOptions({
      ...translucentHeaderOptions(),
      ...fullBleedContentOptions(colors),
      ...WEB_HEADER_LAYOUT,
      headerTitleAlign: 'left',
      headerTitle: displayTitle,
      headerRight: () => (
        <HeaderActions
          speaking={speaking}
          fav={fav}
          labels={labels}
          onListen={() => actionsRef.current.onToggleSpeak()}
          onShare={() => actionsRef.current.onShare()}
          onFav={() => actionsRef.current.onToggleFav()}
        />
      ),
    });
  }, [navigation, article, displayTitle, colors, fav, speaking, t]);

  // Restaura a posição de scroll ao voltar de uma referência/glossário (web reseta).
  // A posição é capturada no momento de navegar (savedScrollRef), porque eventos de
  // scroll durante a transição corrompiam o valor (a página voltava no fim).
  useFocusEffect(
    useCallback(() => {
      const y = savedScrollRef.current;
      if (!y) return undefined;
      const restore = () => scrollRef.current?.scrollTo({ y, animated: false });
      const r = requestAnimationFrame(restore);
      const t1 = setTimeout(restore, 80);
      const t2 = setTimeout(() => { restore(); savedScrollRef.current = 0; }, 220);
      return () => { cancelAnimationFrame(r); clearTimeout(t1); clearTimeout(t2); };
    }, [])
  );

  const openReference = (refId) => {
    savedScrollRef.current = scrollYRef.current;
    navigation.navigate('RefDetail', { highlightId: refId });
  };

  // Estável para o MarkdownText (memo) não re-renderizar a cada scroll.
  const openGlossary = useCallback((term) => {
    savedScrollRef.current = scrollYRef.current;
    navigation.navigate('Glossary', { highlightTerm: term });
  }, [navigation]);

  // Barra de progresso da leitura, posição para restaurar ao voltar e o
  // máximo alcançado para persistir.
  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const max = Math.max(1, contentSize.height - layoutMeasurement.height);
    const p = Math.max(0, Math.min(1, contentOffset.y / max));
    setProgress(p);
    scrollYRef.current = contentOffset.y;
    const s = progressRef.current;
    if (p > s.max) {
      s.max = p;
      persistProgress(false);
    }
  };

  const openDialogue = (dialogueId) => {
    navigation.navigate('Dialogue', { dialogueId });
  };

  const openOtherArticle = (id) => {
    // push (não replace) pra preservar o histórico: voltar volta pro artigo anterior.
    navigation.push(route.name, { articleId: id });
  };

  const styles = useMemo(() => makeStyles(colors, tokens, text), [colors, tokens, text]);

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>{t('articles.notFound')}</Text>
      </View>
    );
  }

  const imageCaption = pick(article, 'imageCredit', isEn) || pick(article, 'imageAlt', isEn);

  return (
    <View style={styles.container}>
      {showSideCrosses && (
        <>
          <View pointerEvents="none" style={[styles.sideCross, { left: crossLeft }]}>
            <BrandMark size="lg" decorative style={styles.crossFade} />
          </View>
          <View pointerEvents="none" style={[styles.sideCross, { right: crossLeft }]}>
            <BrandMark size="lg" decorative style={styles.crossFade} />
          </View>
        </>
      )}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight, paddingBottom: tabBarHeight + tokens.space.xl },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.column}>
          {article.image && (
            <View style={styles.heroWrap}>
              <Pressable
                role="button"
                aria-label={t('articles.expandImage')}
                style={styles.heroBox}
                onLayout={(e) => setHeroW(e.nativeEvent.layout.width)}
                onPress={() => setZoomOpen(true)}
              >
                {heroW > 0 && (
                  <Image
                    source={article.image}
                    style={{ width: heroW, height: heroH }}
                    resizeMode="contain"
                    alt={article.imageAlt || displayTitle}
                  />
                )}
              </Pressable>
              {imageCaption ? <Text style={styles.caption}>{imageCaption}</Text> : null}
            </View>
          )}

          <Text style={styles.category}>{categoryLabel(article.category, t)}</Text>
          <Text role="heading" style={styles.title}>{displayTitle}</Text>

          {showTranslationNotice && (
            <View style={styles.translationNotice}>
              <Ionicons name="language-outline" size={tokens.icon.sm} color={colors.textSubtle} />
              <Text style={styles.translationNoticeText}>{t('articles.notAvailable')}</Text>
            </View>
          )}

          <MarkdownText text={displayBody} onOpenGlossary={openGlossary} />

          {article.tool && (
            <Button
              icon={article.tool.icon || 'open-outline'}
              label={isEn ? (article.tool.labelEn || article.tool.labelPt) : article.tool.labelPt}
              onPress={() => navigation.navigate(article.tool.tab || 'Ferramentas', { screen: article.tool.screen })}
              style={styles.toolBtn}
            />
          )}

          {article.references?.length > 0 && (
            <>
              <SectionTitle title={t('articles.sources')} style={styles.sectionTitle} />
              <Group>
                {article.references.map((refId) => {
                  const r = referenceById(refId);
                  if (!r) return null;
                  // Mesmo padrão do RefDetail: campo a campo em EN, com
                  // fallback para o PT quando a tradução não existe. O `ref`
                  // já vem curado no formato do app (translateRef cuida do EN).
                  const en = referencesEn[r.id] || {};
                  const title = isEn ? (en.refEn || translateRef(r.ref, isEn)) : r.ref;
                  const author = isEn ? (en.authorEn || translateAuthor(r.author, isEn)) : r.author;
                  const year = isEn ? (en.yearEn || translateYear(r.year, isEn)) : r.year;
                  const credit = [author, year].filter(Boolean).join(', ');
                  const subtitle = credit || (isEn ? (en.fullSourceEn || r.fullSource) : r.fullSource);
                  return (
                    <Row
                      key={refId}
                      title={title}
                      titleLines={2}
                      subtitle={subtitle}
                      trailing="chevron"
                      onPress={() => openReference(refId)}
                    />
                  );
                })}
              </Group>
            </>
          )}

          <RelatedDialogues currentId={article.id} onOpen={openDialogue} />
          <RelatedArticles currentId={article.id} onOpen={openOtherArticle} />
        </View>
      </ScrollView>
      {/* Depois do ScrollView na árvore para ficar por cima do conteúdo. */}
      <ReadingProgressBar progress={progress} top={headerHeight} />
      <ImageZoomModal
        visible={zoomOpen}
        source={article.image}
        hdUri={article.imageHd}
        caption={article.imageCredit}
        alt={article.imageAlt}
        onClose={() => setZoomOpen(false)}
      />
    </View>
  );
}

// Tudo em tokens: espaço e raio da grade de 4 pt, papéis de texto do tema.
function makeStyles(c, { space, radius }, text) {
  const web = Platform.OS === 'web';
  return {
    container: { flex: 1, backgroundColor: c.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    notFound: [text('body'), { color: c.textSubtle }],
    // No desktop centra o conteúdo numa coluna legível; no celular ocupa 100%.
    content: { paddingHorizontal: space.lg, ...(web ? { alignItems: 'center' } : null) },
    column: { width: '100%', ...(web ? { maxWidth: READING_COLUMN, alignSelf: 'center' } : null) },
    sideCross: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
    crossFade: { opacity: 0.16 },
    heroWrap: { marginBottom: space.lg },
    heroBox: {
      width: '100%',
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    caption: [text('caption1'), { color: c.textSubtle, marginTop: space.xs }],
    category: [text('footnote'), { color: c.textSubtle }],
    title: [text('title'), { color: c.text, marginTop: space.xxs, marginBottom: space.md }],
    translationNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      backgroundColor: c.card,
      padding: space.sm,
      borderRadius: radius.md,
      marginBottom: space.md,
    },
    translationNoticeText: [text('footnote'), { color: c.textSubtle, flex: 1, fontStyle: 'italic' }],
    toolBtn: { marginTop: space.xl },
    // O título de seção alinha com a coluna do artigo (o padrão do componente
    // recua space.md para as listas do LargeTitleScreen).
    sectionTitle: { marginHorizontal: 0 },
  };
}
