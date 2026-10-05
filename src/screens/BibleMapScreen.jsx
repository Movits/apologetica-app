import { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Image, Platform, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { JESUS_JOURNEY } from '../data/jesusJourney';
import MapView from './bibleMap/MapView';
import { buildMapHtml } from './bibleMap/mapHtml';
import { verseEndFromRef } from '../utils/verseRange';
import { openBible } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { Button, Group, PressScale, ProgressBar, Row, SectionTitle } from '../components/ui';
import ImageZoomModal from '../components/ImageZoomModal';
import { columnStyle, columnContentStyle } from '../components/ReadingColumn';

// Tela "Nos Passos de Jesus": mapa real (Leaflet + mapa físico da Esri) com as 21
// paradas. O renderizador é por plataforma (MapView.native = WebView,
// MapView.web = iframe) e a rota cresce a cada passo. Abaixo do mapa fica a
// parada atual (foto, descrição e "Ler no app") e a lista de todas as paradas.
// Tocar num pino ou numa linha da lista seleciona aquela parada. No desktop
// tudo fica numa coluna central de leitura, como o Artigo.

// Altura do mapa: geometria do desenho, não espaço de layout.
const MAP_HEIGHT = 480;

// Estado "atual" da linha da lista: aria-current na web, selecionado no nativo.
const currentRowProps = Platform.OS === 'web' ? { 'aria-current': 'step' } : { 'aria-selected': true };

// Foto da parada. O estado de erro é por foto (a chave no chamador é o id da
// parada), então uma imagem que falhou não esconde a da parada seguinte.
// A moldura 3:2 é que define o tamanho e a imagem preenche por dentro com
// largura e altura explícitas: com absoluteFill sozinho, o react-native-web
// mantinha a largura e a altura do próprio arquivo e a foto vazava da
// moldura. Tocar na foto abre em tela cheia com zoom (ImageZoomModal).
function PlacePhoto({ source, credit, caption, alt }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, radius, icon } = tokens;
  const [failed, setFailed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  if (!source || failed) return null;
  return (
    <View style={{ gap: space.xxs }}>
      <PressScale
        role="button"
        aria-label={t('articles.expandImage')}
        onPress={() => setZoomOpen(true)}
        style={{
          width: '100%',
          aspectRatio: 3 / 2,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.separator,
        }}
      >
        <Image
          source={source}
          resizeMode="cover"
          alt={alt}
          onError={() => setFailed(true)}
          style={styles.fill}
        />
        {/* Selo de ampliar: avisa que a foto abre em tela cheia. */}
        <View
          style={[styles.badge, { right: space.xs, bottom: space.xs, padding: space.xs, borderRadius: radius.full, backgroundColor: colors.overlay }]}
        >
          <Ionicons name="expand" size={icon.sm} color={colors.onPrimary} />
        </View>
      </PressScale>
      {credit ? (
        <Text style={[text('caption2'), { color: colors.textSubtle }]} numberOfLines={2}>
          {credit}
        </Text>
      ) : null}
      <ImageZoomModal
        visible={zoomOpen}
        source={source}
        caption={caption}
        alt={alt}
        onClose={() => setZoomOpen(false)}
      />
    </View>
  );
}

export default function BibleMapScreen({ navigation }) {
  const { colors, darkMode, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { space, radius, icon } = tokens;
  const [step, setStep] = useState(0);
  const [mapInteracting, setMapInteracting] = useState(false);
  const scrollRef = useRef(null);
  // Posição do mapa dentro do conteúdo: tocar numa parada da lista sobe até
  // ele, para a pessoa ver o mapa ir até a parada escolhida.
  const mapYRef = useRef(0);

  const total = JESUS_JOURNEY.length;
  const current = JESUS_JOURNEY[step];

  const goPrev = () => { if (step > 0) setStep(step - 1); };
  const goNext = () => { if (step < total - 1) setStep(step + 1); };
  const selectFromList = (idx) => {
    setStep(idx);
    scrollRef.current?.scrollTo({ y: mapYRef.current, animated: !reduceMotion });
  };

  const openInBible = (place) => {
    if (!place?.nav) return;
    const ref = pick(place, 'ref', isEn);
    openBible(navigation, { ...place.nav, verseEnd: verseEndFromRef(ref) });
  };

  // HTML do mapa, com dados e cores do tema injetados. `colors` é a paleta
  // inteira do tema (mesma referência enquanto o tema não muda).
  const mapHtml = useMemo(() => buildMapHtml({ isEn, dark: darkMode, colors }), [isEn, darkMode, colors]);

  const stepLabel = t('common.stopOf', { n: step + 1, total });
  const currentName = pick(current, 'name', isEn);
  const currentTitle = pick(current, 'title', isEn);
  const currentRef = pick(current, 'ref', isEn);
  const photoCredit = pick(current, 'photoCredit', isEn);

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[columnContentStyle, { padding: space.md, paddingBottom: space.xl }]}
      scrollEnabled={!mapInteracting}
    >
      <View style={columnStyle}>
        <Text style={[text('subhead'), { color: colors.textSubtle }]}>
          {isEn
            ? 'Pinch to zoom and drag to pan. The route grows along land paths as you advance. Tap a pin to select a stop.'
            : 'Pinça para zoom e arraste para navegar. A rota cresce por caminhos terrestres a cada passo. Toque num pino para escolher a parada.'}
        </Text>

        <View
          style={{ height: MAP_HEIGHT, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.card, marginTop: space.md }}
          onLayout={(e) => { mapYRef.current = e.nativeEvent.layout.y; }}
          onTouchStart={() => setMapInteracting(true)}
          onTouchEnd={() => setMapInteracting(false)}
          onTouchCancel={() => setMapInteracting(false)}
        >
          <MapView
            html={mapHtml}
            step={step}
            onSelectPlace={setStep}
            title={isEn ? "Map of Jesus' journey" : 'Mapa da jornada de Jesus'}
            style={{ flex: 1, backgroundColor: colors.bg }}
          />
        </View>

        {/* Parada atual */}
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.md, gap: space.sm, marginTop: space.md }}>
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{stepLabel}</Text>
          <ProgressBar value={(step + 1) / total} accessibilityLabel={stepLabel} />
          <PlacePhoto
            key={current.id}
            source={current.photo}
            credit={photoCredit}
            alt={`${currentTitle}, ${currentName}`}
            caption={photoCredit ? `${currentName} · ${photoCredit}` : currentName}
          />
          <View style={{ gap: space.xxs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
              <Ionicons name="location" size={icon.sm} color={colors.accentText} />
              <Text style={[text('caption1'), { color: colors.accentText, flex: 1 }]}>{currentName}</Text>
            </View>
            <Text role="heading" style={[text('section'), { color: colors.text }]}>{currentTitle}</Text>
            <Text style={[text('body'), { color: colors.text }]}>{pick(current, 'desc', isEn)}</Text>
            <Text style={[text('footnote'), { color: colors.textSubtle }]}>{currentRef}</Text>
          </View>
          <Button icon="book-outline" label={t('ref.readInApp')} onPress={() => openInBible(current)} />
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Button
              variant="secondary"
              full={false}
              icon="chevron-back"
              label={isEn ? 'Previous' : 'Anterior'}
              onPress={goPrev}
              disabled={step === 0}
              style={{ flex: 1 }}
            />
            {/* row-reverse põe o chevron depois do rótulo, espelhando o Anterior. */}
            <Button
              variant="secondary"
              full={false}
              icon="chevron-forward"
              label={isEn ? 'Next' : 'Próxima'}
              onPress={goNext}
              disabled={step === total - 1}
              style={{ flex: 1, flexDirection: 'row-reverse' }}
            />
          </View>
        </View>

        <SectionTitle title={isEn ? 'All stops' : 'Todas as paradas'} />
        <Group>
          {JESUS_JOURNEY.map((p, idx) => {
            const isCurrent = idx === step;
            const name = pick(p, 'name', isEn);
            const title = pick(p, 'title', isEn);
            return (
              <Row
                key={p.id}
                trailing={isCurrent ? <Ionicons name="location" size={icon.sm} color={colors.tint} /> : 'chevron'}
                accessibilityLabel={`${idx + 1}. ${name}, ${title}`}
                onPress={() => selectFromList(idx)}
                {...(isCurrent ? currentRowProps : null)}
              >
                <Text style={[text('caption1'), { color: colors.accentText }]}>{idx + 1} · {name}</Text>
                <Text style={[text('headline'), { color: colors.text }]} numberOfLines={1}>{title}</Text>
                <Text style={[text('footnote'), { color: colors.textSubtle }]}>{pick(p, 'ref', isEn)}</Text>
              </Row>
            );
          })}
        </Group>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  badge: { position: 'absolute', pointerEvents: 'none' },
});
