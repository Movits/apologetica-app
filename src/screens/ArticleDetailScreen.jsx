import { useEffect, useLayoutEffect, useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { articles } from '../data/articles';
import { referenceById, withEn, translateRef, translateAuthor, translateYear } from '../data/references';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareArticle } from '../utils/share';
import { pick, categoryLabel } from '../utils/i18nData';
import { speakLong, stopSpeaking, isSpeaking } from '../utils/speakLong';
import { resolveVoice, getSavedRate, ttsLocale } from '../utils/ttsVoice';
import { stripMarkdownForSpeech } from '../utils/tts';
import { scrollFraction, stepped } from '../utils/scrollProgress';
import { setLastRead } from '../utils/lastRead';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { markPlanDay, markAsRead } from '../utils/readingProgress';
import { planEntriesByArticle } from '../data/readingPlan';
import { translucentHeaderOptions, fullBleedContentOptions, leftTitleHeaderOptions } from '../navigation/chrome';
import { Button, Group, Row, SectionTitle, useTabBarHeightSafe } from '../components/ui';
import HeaderButton from '../components/HeaderButton';
import ImageZoomModal from '../components/ImageZoomModal';
import ReadingColumn, { columnStyle, columnContentStyle } from '../components/ReadingColumn';
import ReadingProgressBar from '../components/ReadingProgressBar';
import RelatedArticles from '../components/RelatedArticles';
import RelatedDialogues from '../components/RelatedDialogues';
import MarkdownText from '../components/MarkdownText';

// Progresso de leitura persistido (lastRead.js): grava no máximo a cada 1 s
// ou quando avança 5 pontos percentuais, e sempre ao sair da tela.
const PROGRESS_WRITE_MS = 1000;
const PROGRESS_WRITE_STEP = 0.05;
// Fração do artigo a partir da qual ele conta como lido.
const READ_THRESHOLD = 0.9;
// Variação mínima da fração para chegar à barra (ela não percebe menos que
// meio por cento).
const PROGRESS_STEP = 0.005;
// Conteúdo até esta folga mais alto que a viewport ainda "cabe na tela": não
// há o que rolar, então o artigo já está inteiro à vista e conta como lido.
const FITS_SLACK = 4;

// As três ações do header: ouvir/parar, compartilhar, guardar/remover. Cada
// uma é um HeaderButton (44x44, ícone em `tint`); o estado (narrando,
// guardado) aparece no ícone preenchido e no rótulo de acessibilidade.
function HeaderActions({ speaking, fav, labels, onListen, onShare, onFav }) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: tokens.space.xxs }}>
      <HeaderButton icon={speaking ? 'stop-circle' : 'volume-high-outline'} label={speaking ? labels.stop : labels.listen} onPress={onListen} />
      <HeaderButton icon="share-outline" label={labels.share} onPress={onShare} />
      <HeaderButton icon={fav ? 'bookmark' : 'bookmark-outline'} label={fav ? labels.unsave : labels.save} onPress={onFav} />
    </View>
  );
}

export default function ArticleDetailScreen({ route, navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useTabBarHeightSafe();
  const article = articles.find((a) => a.id === route.params?.articleId);

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

  // Fração lida que a barra do topo desenha. É um shared value: o onScroll
  // escreve nele sem re-renderizar a tela (nada aqui depende dela em estado;
  // o "lido" e o lastRead vivem em progressRef).
  const progressSv = useSharedValue(0);
  const [fav, setFav] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef(null);
  const scrollYRef = useRef(0);
  const savedScrollRef = useRef(0);
  // Espelho do que a barra mostra, para só escrever quando andou de verdade.
  const shownProgressRef = useRef(0);
  // Altura da viewport e do conteúdo do ScrollView, para saber se o artigo
  // cabe inteiro na tela (aí nunca haveria scroll para chegar aos 90%).
  const layoutHRef = useRef(0);
  const contentHRef = useRef(0);

  useEffect(() => {
    if (!article) return undefined;
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
    // Chegou perto do fim: conta como lido (selo "Lido" na lista de Artigos).
    if (s.max >= READ_THRESHOLD && !s.marked) {
      s.marked = true;
      markAsRead(article.id);
    }
  }, [article]);

  useEffect(() => {
    progressRef.current = { max: 0, written: 0, at: 0 };
    // Ao desmontar (ou trocar de artigo na mesma tela) grava o que faltou.
    return () => persistProgress(true);
  }, [article, persistProgress]);

  const showProgress = useCallback((p) => {
    const next = stepped(shownProgressRef.current, p, PROGRESS_STEP);
    if (next === shownProgressRef.current) return;
    shownProgressRef.current = next;
    progressSv.value = next;
  }, [progressSv]);

  // Artigo que cabe inteiro na viewport: não há scroll, então o progresso vai
  // direto a 1 (grava o "continuar lendo" e o selo de lido). Chamado pelo
  // onLayout e pelo onContentSizeChange, que chegam em qualquer ordem. Com
  // herói, só decide depois de ele ter sido medido: antes disso o conteúdo
  // está sem a imagem e pareceria caber; medido, o onContentSizeChange volta.
  const checkFits = useCallback(() => {
    if (article?.image && heroW <= 0) return;
    const layout = layoutHRef.current;
    const content = contentHRef.current;
    if (!layout || !content || content > layout + FITS_SLACK) return;
    showProgress(1);
    const s = progressRef.current;
    if (s.max < 1) {
      s.max = 1;
      persistProgress(false);
    }
  }, [article, heroW, showProgress, persistProgress]);

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
    const speechText = stripMarkdownForSpeech(rawText);

    // speakLong fatia o texto (limite do Android) e chama os callbacks finais
    // uma vez só, para a narração inteira.
    speakLong(speechText, {
      language: voice?.language || ttsLocale(textLang),
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
      ...leftTitleHeaderOptions(),
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

  // Ao ganhar foco (abrir, ou voltar de um artigo relacionado, referência ou
  // glossário) este passa a ser o "Continuar lendo" da Início, com o progresso
  // que já tinha: sem isso, voltar de um artigo relacionado deixava o outro lá.
  useFocusEffect(
    useCallback(() => {
      if (article) setLastRead(article.id, progressRef.current.max || undefined);
    }, [article])
  );

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
    const p = scrollFraction(e.nativeEvent, FITS_SLACK);
    showProgress(p);
    scrollYRef.current = e.nativeEvent.contentOffset.y;
    const s = progressRef.current;
    if (p > s.max) {
      s.max = p;
      persistProgress(false);
    }
  };

  // Estáveis para as seções relacionadas (memo) não re-renderizarem à toa.
  const openDialogue = useCallback((dialogueId) => {
    navigation.navigate('Dialogue', { dialogueId });
  }, [navigation]);

  const openOtherArticle = useCallback((id) => {
    // push (não replace) pra preservar o histórico: voltar volta pro artigo anterior.
    navigation.push(route.name, { articleId: id });
  }, [navigation, route.name]);

  // Fontes citadas, já com a tradução EN mesclada campo a campo (withEn) e o
  // `pick` caindo no PT quando ela não existe, com os tradutores heurísticos
  // (translateRef etc.) como fallback. Mesmo padrão do RefDetail.
  const sources = useMemo(() => (article?.references || []).flatMap((refId) => {
    const ref = withEn(referenceById(refId));
    if (!ref) return [];
    const author = pick(ref, 'author', isEn, translateAuthor);
    const year = pick(ref, 'year', isEn, translateYear);
    const credit = [author, year].filter(Boolean).join(', ');
    // Obra e autoria juntas: "Suma Teológica, I, q. 2 · Tomás de Aquino, 1274".
    return [{
      id: refId,
      title: pick(ref, 'ref', isEn, translateRef),
      subtitle: [pick(ref, 'fullSource', isEn), credit].filter(Boolean).join(' · '),
    }];
  }), [article, isEn]);

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
    <ReadingColumn>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight, paddingBottom: tabBarHeight + tokens.space.xl },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={(e) => { layoutHRef.current = e.nativeEvent.layout.height; checkFits(); }}
        onContentSizeChange={(w, h) => { contentHRef.current = h; checkFits(); }}
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
              label={pick({ label: article.tool.labelPt, labelEn: article.tool.labelEn }, 'label', isEn)}
              onPress={() => navigation.navigate(article.tool.tab || 'Ferramentas', { screen: article.tool.screen })}
              style={styles.toolBtn}
            />
          )}

          {sources.length > 0 && (
            <>
              <SectionTitle title={t('articles.sources')} style={styles.sectionTitle} />
              <Group>
                {sources.map((s) => (
                  <Row
                    key={s.id}
                    title={s.title}
                    titleLines={2}
                    subtitle={s.subtitle}
                    subtitleLines={2}
                    trailing="chevron"
                    onPress={() => openReference(s.id)}
                  />
                ))}
              </Group>
            </>
          )}

          <RelatedDialogues currentId={article.id} onOpen={openDialogue} />
          <RelatedArticles currentId={article.id} onOpen={openOtherArticle} />
        </View>
      </ScrollView>
      {/* Depois do ScrollView na árvore para ficar por cima do conteúdo. */}
      <ReadingProgressBar progressValue={progressSv} top={headerHeight} />
      <ImageZoomModal
        visible={zoomOpen}
        source={article.image}
        hdUri={article.imageHd}
        caption={article.imageCredit}
        alt={article.imageAlt}
        onClose={() => setZoomOpen(false)}
      />
    </ReadingColumn>
  );
}

// Tudo em tokens: espaço e raio da grade de 4 pt, papéis de texto do tema.
function makeStyles(c, { space, radius }, text) {
  return {
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    notFound: [text('body'), { color: c.textSubtle }],
    // No desktop centra o conteúdo numa coluna legível; no celular ocupa 100%
    // (ReadingColumn).
    content: { paddingHorizontal: space.lg, ...columnContentStyle },
    column: columnStyle,
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
