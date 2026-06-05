import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable, Image, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { articles } from '../data/articles';
import { referenceById, translateRef } from '../data/references';
import { referencesEn } from '../data/references-en';
import { useTheme } from '../context/ThemeContext';
import { shareArticle } from '../utils/share';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import CrossMark from '../components/CrossMark';
import ImageZoomModal from '../components/ImageZoomModal';
import ReadingProgressBar from '../components/ReadingProgressBar';
import RelatedArticles from '../components/RelatedArticles';
import MarkdownText from '../components/MarkdownText';
import { setLastRead } from '../utils/lastRead';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { useRequireAccount } from '../components/GuestGate';
import { resolveVoice, getSavedRate } from '../utils/ttsVoice';
import { useLanguage } from '../context/LanguageContext';
import { markPlanDay } from '../utils/readingProgress';
import { planDayByArticle } from '../data/readingPlan';

export default function ArticleDetailScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { lang, t, isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width: winWidth } = useWindowDimensions();
  const article = articles.find((a) => a.id === route.params?.articleId);

  // Cruzes decorativas nos gutters da coluna central (só desktop), igual ao "Dia de hoje".
  const gutter = (winWidth - 720) / 2;
  const showSideCrosses = Platform.OS === 'web' && gutter >= 150;
  const crossLeft = Math.max(0, gutter / 2 - 50);

  // Herói: mede a largura e dá altura explícita (sem corte em web/nativo).
  const [heroW, setHeroW] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const boxAspect = Math.max(article?.imageAspect || 1.6, 1.3);
  const heroH = heroW > 0 ? Math.round(heroW / boxAspect) : 0;

  // Conteúdo no idioma escolhido, com fallback para PT se a tradução não existir.
  const displayTitle = isEn ? (article?.titleEn || article?.title) : article?.title;
  const displayBody = isEn ? (article?.bodyEn || null) : article?.body;
  const showTranslationNotice = isEn && !article?.bodyEn && article?.body;

  const [progress, setProgress] = useState(0);
  const [fav, setFav] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef(null);
  const requireAccount = useRequireAccount();

  useEffect(() => {
    if (!article) return;
    setLastRead(article.id);
    const planDay = planDayByArticle(article.id);
    if (planDay) markPlanDay(planDay.day);
    isFavorite(article.id).then(setFav);
    // Para o TTS se a tela for desmontada
    return () => { Speech.stop(); };
  }, [article?.id]);

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
      .replace(/[​-‍﻿]/g, '');    // zero-width chars

  const onToggleSpeak = async () => {
    if (!article) return;
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);

    // Escolhe o idioma do TEXTO (não da interface). Se UI=EN mas artigo só tem PT,
    // narra em PT pra não dar sotaque/incoerência.
    const useEnText = isEn && !!article.bodyEn;
    const textLang = useEnText ? 'en' : 'pt';
    const [voice, rate] = await Promise.all([resolveVoice(textLang), getSavedRate()]);
    const rawText = useEnText
      ? `${article.titleEn || article.title}. ${article.bodyEn}`
      : `${article.title}. ${article.body}`;
    const speechText = stripMarkdownForTts(rawText);
    const defaultLang = textLang === 'en' ? 'en-US' : 'pt-BR';

    Speech.speak(speechText, {
      language: voice?.language || defaultLang,
      voice: voice?.identifier,
      rate,
      pitch: 1.0,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  // Configura header com botao de TTS + favoritar + share
  useEffect(() => {
    if (!article) return;
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 14, paddingRight: 4 }}>
          <TouchableOpacity onPress={onToggleSpeak}>
            <Ionicons
              name={speaking ? 'stop-circle' : 'volume-high-outline'}
              size={22}
              color={speaking ? colors.accent : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare}>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFav}>
            <Ionicons name={fav ? 'star' : 'star-outline'} size={22} color={fav ? colors.accent : '#fff'} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, fav, speaking, article?.id, colors.accent]);

  const openReference = (refId) => {
    navigation.navigate('RefDetail', { highlightId: refId });
  };

  const onShare = () => {
    if (!article) return;
    shareArticle({ title: article.title, summary: article.summary });
  };

  const onToggleFav = () => {
    if (!article) return;
    requireAccount(
      async () => {
        await toggleFavorite(article.id);
        setFav((f) => !f);
      },
      {
        title: isEn ? 'Save to favorites?' : 'Salvar nos favoritos?',
        message: isEn
          ? 'To save this article to your favorites, create a free account. Your favorites stay saved and synced across devices.'
          : 'Para guardar este artigo nos seus favoritos, crie uma conta gratuita. Seus favoritos ficam salvos e sincronizados entre dispositivos.',
        icon: 'star-outline',
      }
    );
  };

  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const max = Math.max(1, contentSize.height - layoutMeasurement.height);
    setProgress(contentOffset.y / max);
    hintScroll.onScroll(e);
  };

  const openOtherArticle = (id) => {
    // push (não replace) pra preservar o histórico — voltar volta pro artigo anterior.
    navigation.push(route.name, { articleId: id });
  };

  const hintScroll = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (!article) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted }}>{isEn ? 'Article not found.' : 'Artigo não encontrado.'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ReadingProgressBar progress={progress} />
      {showSideCrosses && (
        <>
          <View pointerEvents="none" style={[styles.sideCross, { left: crossLeft }]}>
            <CrossMark size={160} />
          </View>
          <View pointerEvents="none" style={[styles.sideCross, { right: crossLeft }]}>
            <CrossMark size={160} />
          </View>
        </>
      )}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        onContentSizeChange={hintScroll.onContentSizeChange}
        onLayout={hintScroll.onLayout}
        scrollEventThrottle={16}
      >
        <View style={styles.column}>
        {article.image && (
          <View style={styles.heroWrap}>
            <Pressable
              style={styles.heroBox}
              onLayout={(e) => setHeroW(e.nativeEvent.layout.width)}
              onPress={() => setZoomOpen(true)}
            >
              {heroW > 0 && (
                <Image
                  source={article.image}
                  style={{ width: heroW, height: heroH }}
                  resizeMode="contain"
                  accessibilityLabel={article.imageAlt || displayTitle}
                />
              )}
              <View style={styles.heroExpand} pointerEvents="none">
                <Ionicons name="expand" size={15} color="#fff" />
              </View>
            </Pressable>
            {article.imageCredit ? <Text style={styles.heroCredit}>{article.imageCredit}</Text> : null}
          </View>
        )}
        <View style={styles.headerRow}>
          <View style={styles.catBadge}>
            <Text style={styles.category}>{isEn ? t(`category.${article.category}`) : article.category}</Text>
          </View>
        </View>

        <Text style={styles.title}>{displayTitle}</Text>
        {showTranslationNotice && (
          <View style={styles.translationNotice}>
            <Ionicons name="language-outline" size={14} color={colors.accent} />
            <Text style={styles.translationNoticeText}>
              {t('articles.notAvailable')}
            </Text>
          </View>
        )}
        <MarkdownText
          text={displayBody || article.body}
          baseStyle={styles.body}
          onOpenGlossary={(term) => navigation.navigate('Glossary', { highlightTerm: term })}
        />

        {article.references?.length > 0 && (
          <View style={styles.refBox}>
            <Text style={styles.refTitle}>{t('articles.references')}</Text>
            <Text style={styles.refHint}>{t('articles.referencesHint')}</Text>
            {article.references.map((refId) => {
              const r = referenceById(refId);
              if (!r) return null;
              return (
                <TouchableOpacity
                  key={refId}
                  style={styles.refItem}
                  onPress={() => openReference(refId)}
                >
                  {(() => {
                    const rWithEn = { ...r, ...(referencesEn[r.id] || {}) };
                    return (
                      <View style={{ flex: 1 }}>
                        <Text style={styles.refItemRef}>{isEn ? (rWithEn.refEn || translateRef(r.ref, isEn)) : r.ref}</Text>
                        <Text style={styles.refItemSource}>
                          {isEn ? (rWithEn.fullSourceEn || r.fullSource) : r.fullSource}{r.author ? ` (${r.author}` : ''}{r.year ? `, ${r.year})` : r.author ? ')' : ''}
                        </Text>
                      </View>
                    );
                  })()}
                  <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <RelatedArticles currentId={article.id} onOpen={openOtherArticle} />
        </View>
      </ScrollView>
      <ScrollHint direction="up" visible={hintScroll.showTop} />
      <ScrollHint direction="down" visible={hintScroll.showBottom} />
      <ImageZoomModal
        visible={zoomOpen}
        source={article.image}
        caption={article.imageCredit}
        alt={article.imageAlt}
        onClose={() => setZoomOpen(false)}
      />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    // No desktop centra o conteúdo numa coluna legível; no celular ocupa 100%.
    content: { padding: 20, paddingBottom: 40, ...(Platform.OS === 'web' ? { alignItems: 'center' } : null) },
    column: { width: '100%', ...(Platform.OS === 'web' ? { maxWidth: 720, alignSelf: 'center' } : null) },
    heroWrap: { marginBottom: 14 },
    heroBox: { width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
    heroExpand: { position: 'absolute', right: 8, bottom: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
    sideCross: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
    heroCredit: { fontSize: fs(10), color: c.textSubtle, marginTop: 4, fontStyle: 'italic', textAlign: 'right' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    catBadge: { backgroundColor: c.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    category: { fontSize: fs(11), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    title: { fontSize: fs(22), fontWeight: 'bold', color: c.primaryText, marginBottom: 16 },
    body: { fontSize: fs(16), color: c.text, lineHeight: fs(26) },
    translationNotice: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: c.badgeBg, padding: 10, borderRadius: 8, marginBottom: 16,
      borderLeftWidth: 3, borderLeftColor: c.accent,
    },
    translationNoticeText: { color: c.textMuted, fontSize: fs(12), flex: 1, fontStyle: 'italic' },
    refBox: { marginTop: 28, backgroundColor: c.card, borderRadius: 12, padding: 16 },
    refTitle: { fontWeight: 'bold', color: c.primaryText, marginBottom: 4, fontSize: fs(15) },
    refHint: { fontSize: fs(11), color: c.textSubtle, marginBottom: 10, fontStyle: 'italic' },
    refItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      gap: 8,
    },
    refItemRef: { fontSize: fs(14), color: c.primaryText, fontWeight: '600' },
    refItemSource: { fontSize: fs(11), color: c.textMuted, marginTop: 2 },
  });
