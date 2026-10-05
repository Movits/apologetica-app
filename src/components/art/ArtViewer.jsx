import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInRight,
  SlideOutDown,
  SlideOutRight,
  useReducedMotion,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GALLERY, useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ART_IMAGES } from '../../data/artImages';
import { artworkForArticle, museumUrl } from '../../data/artworks';
import { pick } from '../../utils/i18nData';
import { commonsPyramid, commonsUrl, lupaBounds } from '../../utils/artImage';
import { selection as tick } from '../../utils/haptics';
import PressScale from '../ui/PressScale';
import ZoomableImage from '../ZoomableImage';
import ArtCanvas from './ArtCanvas';
import { buildArtViewerHtml } from './artViewerHtml';

// Visualizador de obras de arte dos artigos, à moda do Museu Virtual: a obra
// em zoom profundo numa sala escura, com lupas sobre os detalhes e uma aula.
//
// - A imagem roda no OpenSeadragon (artViewerHtml) dentro de ArtCanvas
//   (WebView no nativo, iframe na web): pinça, toque duplo e inércia nativos
//   do navegador, ladrilhos em alta resolução sob demanda.
// - Lupa tocada: o painel "Detalhe n de N" abre (embaixo no celular, à direita
//   a partir de 900 pt) e a câmera enquadra o detalhe na parte livre da tela
//   (lupaBounds). Anterior e Próximo percorrem as lupas como visita guiada.
// - "Aula sobre a obra": placa, a ponte com o artigo, o texto da aula e a lista
//   de detalhes, mais o link para a obra no Museu Virtual quando ela é de lá.
// - Sem rede (ou se o OpenSeadragon falhar), a imagem local do artigo aparece
//   em ZoomableImage e a aula continua disponível.
//
// Cores: GALLERY (fixas nos dois temas). Tamanhos e tipos: tokens do tema.

const BAR = 56;
const PANEL_W = 400;
const WIDE_AT = 900;

function ChipButton({ icon, label, onPress, a11yLabel, style }) {
  const { tokens, text } = useTheme();
  const { space, radius, icon: iconSize } = tokens;
  return (
    <PressScale
      onPress={onPress}
      aria-label={a11yLabel ?? label}
      style={[
        styles.chip,
        {
          minHeight: 44,
          minWidth: 44,
          paddingHorizontal: label ? space.md : 0,
          borderRadius: radius.full,
          gap: space.xs,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize.md} color={GALLERY.text} />
      {label ? <Text style={[text('subhead'), { color: GALLERY.text }]}>{label}</Text> : null}
    </PressScale>
  );
}

function Eyebrow({ children }) {
  const { text } = useTheme();
  return (
    <Text style={[text('caption1'), styles.eyebrow, { color: GALLERY.accent }]}>
      {children}
    </Text>
  );
}

function Plate({ art, isEn, t }) {
  const { tokens, text } = useTheme();
  const { space, radius } = tokens;
  const rows = [
    ['art.plate.artist', art.artistLife ? `${pick(art, 'artist', isEn)} (${art.artistLife})` : pick(art, 'artist', isEn)],
    ['art.plate.date', pick(art, 'date', isEn)],
    ['art.plate.technique', pick(art, 'technique', isEn)],
    ['art.plate.dimensions', art.dimensions],
    ['art.plate.location', pick(art, 'location', isEn)],
    ['art.plate.style', pick(art, 'style', isEn)],
  ].filter(([, v]) => v);
  return (
    <View
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: GALLERY.hairline,
        backgroundColor: GALLERY.plate,
        borderRadius: radius.sm,
        padding: space.md,
        gap: space.xs,
      }}
    >
      {rows.map(([key, value]) => (
        <View key={key} style={{ flexDirection: 'row', gap: space.sm }}>
          <Text style={[text('caption1'), styles.plateKey, { color: GALLERY.accent }]}>{t(key)}</Text>
          <Text style={[text('subhead'), { color: GALLERY.text, flex: 1 }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ArtViewer({ visible, article, onClose }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { space, radius } = tokens;

  const art = article ? artworkForArticle(article.id) : null;
  const img = article ? ART_IMAGES[article.id] : null;
  const lupas = useMemo(() => art?.lupas ?? [], [art]);
  const total = lupas.length;

  const source = useMemo(() => {
    if (art?.dzi) return art.dzi;
    if (img) return { type: 'legacy-image-pyramid', levels: commonsPyramid(img) };
    return null;
  }, [art, img]);

  const html = useMemo(
    () => (source
      ? buildArtViewerHtml({
        source,
        lupas: lupas.map((l) => ({ ...l, title: pick(l, 'title', isEn) })),
        background: GALLERY.bg,
        accent: GALLERY.accent,
        reduceMotion,
        lupaLabel: t('art.lupa'),
      })
      : null),
    [source, lupas, isEn, reduceMotion, t],
  );

  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | fallback
  const [loaded, setLoaded] = useState(false);
  const [aspect, setAspect] = useState(img ? img.width / img.height : 1.5);
  const [active, setActive] = useState(null); // índice da lupa
  const [panel, setPanel] = useState(null); // 'lupa' | 'about' | null
  const [chrome, setChrome] = useState(true);
  const [markers, setMarkers] = useState(true);

  // Estado novo a cada abertura.
  useEffect(() => {
    if (!visible) return;
    setStatus(source ? 'loading' : 'fallback');
    setLoaded(false);
    setActive(null);
    setPanel(null);
    setChrome(true);
    setMarkers(true);
  }, [visible, source]);

  const wide = W >= WIDE_AT;
  // Detalhe: folha baixa, a obra continua visível em cima. Aula: leitura
  // longa, folha alta.
  const sheetH = Math.round(Math.min(H * 0.46, 440));
  const aboutH = Math.round(H * 0.82);
  const topInset = insets.top + BAR;

  const send = useCallback((cmd, arg) => canvasRef.current?.send(cmd, arg), []);

  const focus = useCallback((i) => {
    const lupa = lupas[i];
    if (!lupa) return;
    tick();
    setActive(i);
    setPanel('lupa');
    setChrome(true);
    // Sem checar o status: antes de a obra abrir, a página ignora o comando.
    send('active', lupa.id);
    send('fit', lupaBounds({
      lupa,
      aspect,
      viewW: W,
      viewH: H,
      topInset,
      bottomInset: wide ? insets.bottom + space.md : sheetH,
      rightInset: wide ? PANEL_W : 0,
    }));
  }, [lupas, aspect, W, H, topInset, wide, insets.bottom, space.md, sheetH, send]);

  const overview = useCallback(() => {
    setActive(null);
    setPanel(null);
    send('active', null);
    send('home');
  }, [send]);

  const onEvent = useCallback((e) => {
    if (e.type === 'ready') {
      setStatus('ready');
      if (e.aspect) setAspect(e.aspect);
    } else if (e.type === 'loaded') {
      setLoaded(true);
    } else if (e.type === 'error') {
      setStatus('fallback');
    } else if (e.type === 'lupa') {
      const i = lupas.findIndex((l) => l.id === e.id);
      if (i >= 0) focus(i);
    } else if (e.type === 'tap') {
      if (panel) {
        setPanel(null);
        setActive(null);
        send('active', null);
      } else {
        setChrome((c) => !c);
      }
    }
  }, [lupas, focus, panel, send]);

  const toggleMarkers = () => {
    const next = !markers;
    setMarkers(next);
    send('markers', next);
  };

  const openMuseum = () => {
    const url = museumUrl(art, active != null ? lupas[active]?.id : null);
    if (url) Linking.openURL(url);
  };

  if (!article) return null;

  const title = art ? pick(art, 'title', isEn) : pick(article, 'imageAlt', isEn) || '';
  const subtitle = art ? [pick(art, 'artist', isEn), pick(art, 'date', isEn)].filter(Boolean).join(', ') : '';
  const credit = pick(article, 'imageCredit', isEn);
  const note = art ? (isEn ? art.notesEn?.[article.id] : null) || art.notes?.[article.id] : null;
  const intro = art ? pick(art, 'intro', isEn) : [];
  const lupa = active != null ? lupas[active] : null;
  const showLupaUi = total > 0 && status !== 'fallback';

  const panelStyle = wide
    ? { position: 'absolute', top: topInset, right: space.md, bottom: insets.bottom + space.md, width: PANEL_W - space.md * 2, borderRadius: radius.lg }
    : { position: 'absolute', left: 0, right: 0, bottom: 0, height: panel === 'about' ? aboutH : sheetH, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg };
  const entering = reduceMotion ? FadeIn : (wide ? SlideInRight : SlideInDown).duration(tokens.motion.layout);
  const exiting = reduceMotion ? FadeOut : wide ? SlideOutRight : SlideOutDown;
  const reading = [text('bodySerif'), { color: GALLERY.text }];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      // Voltar do Android (e Esc na web) fecha o painel aberto antes da sala.
      // O do detalhe sai como o X dele (overview): sem limpar a lupa ativa, o
      // marcador dela continuava invisível e sem toque sobre a obra.
      onRequestClose={panel === 'lupa' ? overview : panel ? () => setPanel(null) : onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.root, { backgroundColor: GALLERY.bg }]}>
          {/* A obra */}
          {status === 'fallback' ? (
            <ZoomableImage
              source={article.image}
              hdUri={img ? commonsUrl(img, 1920) : null}
              alt={pick(article, 'imageAlt', isEn)}
            />
          ) : html ? (
            <ArtCanvas ref={canvasRef} html={html} onEvent={onEvent} />
          ) : null}

          {status !== 'fallback' && !loaded ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
              <ActivityIndicator color={GALLERY.accent} />
              <Text style={[text('footnote'), { color: GALLERY.textSubtle, marginTop: space.sm }]}>{t('art.loading')}</Text>
            </View>
          ) : null}

          {/* Barra de cima */}
          {chrome ? (
            <Animated.View
              entering={FadeIn.duration(tokens.motion.aba)}
              exiting={FadeOut.duration(tokens.motion.aba)}
              style={[styles.topBar, { paddingTop: insets.top, height: topInset, paddingHorizontal: space.sm, gap: space.sm }]}
            >
              <ChipButton icon="close" onPress={onClose} a11yLabel={t('common.close')} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[text('headline'), { color: GALLERY.text }]}>{title}</Text>
                {subtitle ? (
                  <Text numberOfLines={1} style={[text('footnote'), { color: GALLERY.textSubtle }]}>{subtitle}</Text>
                ) : null}
              </View>
              {showLupaUi ? (
                <ChipButton
                  icon={markers ? 'eye-outline' : 'eye-off-outline'}
                  onPress={toggleMarkers}
                  a11yLabel={markers ? t('art.hideLupas') : t('art.showLupas')}
                />
              ) : null}
            </Animated.View>
          ) : null}

          {/* Barra de baixo: aula, visita e crédito */}
          {chrome && !panel ? (
            <Animated.View
              entering={FadeIn.duration(tokens.motion.aba)}
              exiting={FadeOut.duration(tokens.motion.aba)}
              style={[styles.bottomBar, { paddingBottom: insets.bottom + space.md, paddingHorizontal: space.md, gap: space.sm }]}
              pointerEvents="box-none"
            >
              {status === 'fallback' && source ? (
                <Text style={[text('footnote'), { color: GALLERY.textSubtle, textAlign: 'center' }]}>{t('art.offline')}</Text>
              ) : null}
              {art ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.xs }}>
                  <ChipButton icon="book-outline" label={t('art.lessonButton')} onPress={() => setPanel('about')} />
                  {showLupaUi ? (
                    <ChipButton icon="search-outline" label={`${t('art.tourButton')} · ${total}`} onPress={() => focus(0)} />
                  ) : null}
                </View>
              ) : null}
              {credit ? (
                <Text numberOfLines={2} style={[text('caption1'), styles.credit, { color: GALLERY.textSubtle }]}>{credit}</Text>
              ) : null}
            </Animated.View>
          ) : null}

          {/* Painel: detalhe (lupa) ou aula */}
          {panel ? (
            <Animated.View
              key={panel}
              entering={entering}
              exiting={exiting}
              role="dialog"
              aria-label={panel === 'lupa' ? pick(lupa, 'title', isEn) : t('art.lessonButton')}
              style={[styles.panel, panelStyle, { backgroundColor: GALLERY.panel, borderColor: GALLERY.hairline }]}
            >
              {!wide ? <View style={[styles.grabber, { backgroundColor: GALLERY.hairline, marginTop: space.xs }]} /> : null}
              <View style={[styles.panelHead, { paddingHorizontal: space.lg, paddingTop: space.sm }]}>
                <View style={{ flex: 1 }}>
                  <Eyebrow>
                    {panel === 'lupa' ? t('art.detailOf', { n: active + 1, total }) : t('art.lessonEyebrow')}
                  </Eyebrow>
                </View>
                <ChipButton icon="close" onPress={panel === 'lupa' ? overview : () => setPanel(null)} a11yLabel={t('art.closePanel')} style={{ backgroundColor: 'transparent' }} />
              </View>

              {panel === 'lupa' && lupa ? (
                <>
                  <ScrollView
                    key={lupa.id}
                    contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.sm }}
                  >
                    <Animated.View entering={FadeIn.duration(tokens.motion.layout)} style={{ gap: space.sm }}>
                      <Text role="heading" style={[text('section'), { color: GALLERY.text }]}>{pick(lupa, 'title', isEn)}</Text>
                      {pick(lupa, 'text', isEn).map((p, i) => (
                        <Text key={i} style={reading}>{p}</Text>
                      ))}
                    </Animated.View>
                  </ScrollView>
                  <View style={[styles.panelFoot, { paddingHorizontal: space.md, paddingBottom: wide ? space.md : insets.bottom + space.sm, paddingTop: space.xs, gap: space.xs, borderTopColor: GALLERY.hairline }]}>
                    <ChipButton icon="chevron-back" onPress={() => focus(active - 1)} a11yLabel={t('art.previous')} style={active === 0 && styles.disabled} />
                    <ChipButton icon="scan-outline" label={t('art.overview')} onPress={overview} style={{ flex: 1 }} />
                    <ChipButton icon="chevron-forward" onPress={() => focus(active + 1)} a11yLabel={t('art.next')} style={active === total - 1 && styles.disabled} />
                  </View>
                </>
              ) : null}

              {panel === 'about' && art ? (
                <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xl, gap: space.md }}>
                  <View>
                    <Text role="heading" style={[text('title'), { color: GALLERY.text }]}>{title}</Text>
                    <Text style={[text('subhead'), { color: GALLERY.textSubtle, marginTop: space.xxs }]}>{pick(art, 'artist', isEn)}</Text>
                  </View>
                  <Plate art={art} isEn={isEn} t={t} />
                  {note ? (
                    <View style={[styles.note, { borderLeftColor: GALLERY.accent, paddingLeft: space.md, gap: space.xxs }]}>
                      <Eyebrow>{t('art.whyHere')}</Eyebrow>
                      <Text style={reading}>{note}</Text>
                    </View>
                  ) : null}
                  {intro.map((p, i) => (
                    <Text key={i} style={reading}>{p}</Text>
                  ))}
                  {total > 0 ? (
                    <View style={{ gap: space.xs }}>
                      <Eyebrow>{t('art.detailsTitle')}</Eyebrow>
                      {lupas.map((l, i) => (
                        <PressScale
                          key={l.id}
                          onPress={() => focus(i)}
                          style={[styles.detailRow, { minHeight: 44, gap: space.sm, borderBottomColor: GALLERY.hairline }]}
                        >
                          <Text style={[text('footnote'), styles.detailNum, { color: GALLERY.accent }]}>{String(i + 1).padStart(2, '0')}</Text>
                          <Text style={[text('body'), { color: GALLERY.text, flex: 1 }]}>{pick(l, 'title', isEn)}</Text>
                          <Ionicons name="search-outline" size={tokens.icon.sm} color={GALLERY.textSubtle} />
                        </PressScale>
                      ))}
                    </View>
                  ) : null}
                  {showLupaUi ? (
                    <ChipButton icon="play-outline" label={t('art.startTour')} onPress={() => focus(0)} style={{ alignSelf: 'flex-start', borderColor: GALLERY.accent }} />
                  ) : null}
                  {art.museum ? (
                    <ChipButton icon="open-outline" label={t('art.openMuseum')} onPress={openMuseum} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent' }} />
                  ) : null}
                  {credit ? <Text style={[text('caption1'), { color: GALLERY.textSubtle }]}>{credit}</Text> : null}
                </ScrollView>
              ) : null}
            </Animated.View>
          ) : null}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GALLERY.chip,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GALLERY.hairline,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GALLERY.bar,
  },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  credit: { textAlign: 'center', fontStyle: 'italic', opacity: 0.9 },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
  plateKey: { width: 92, textTransform: 'uppercase', letterSpacing: 1.2, paddingTop: 2 },
  panel: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3 },
  panelHead: { flexDirection: 'row', alignItems: 'center' },
  panelFoot: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth },
  note: { borderLeftWidth: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  detailNum: { width: 24, fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.35 },
});
