import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { JESUS_JOURNEY } from '../data/jesusJourney';
import MapView from './bibleMap/MapView';
import { buildMapHtml } from './bibleMap/mapHtml';
import { verseEndFromRef } from '../utils/verseRange';
import { openBible } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { Button, Group, ProgressBar, Row, SectionTitle } from '../components/ui';

// Tela "Nos Passos de Jesus": mapa real (Leaflet + CartoDB Voyager) com as 21
// paradas. O renderizador é por plataforma (MapView.native = WebView,
// MapView.web = iframe) e a rota cresce a cada passo. Abaixo do mapa fica a
// parada atual (foto, descrição e "Ler no app") e a lista de todas as paradas.
// Tocar num pino ou numa linha da lista seleciona aquela parada.

// Altura do mapa: geometria do desenho, não espaço de layout.
const MAP_HEIGHT = 480;

// Foto da parada. O estado de erro é por foto (a chave no chamador é o id da
// parada), então uma imagem que falhou não esconde a da parada seguinte.
function PlacePhoto({ source }) {
  const { colors, tokens } = useTheme();
  const [failed, setFailed] = useState(false);
  if (!source || failed) return null;
  return (
    <Image
      source={source}
      resizeMode="cover"
      onError={() => setFailed(true)}
      style={{ width: '100%', aspectRatio: 3 / 2, borderRadius: tokens.radius.md, backgroundColor: colors.separator }}
    />
  );
}

export default function BibleMapScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon } = tokens;
  const [step, setStep] = useState(0);
  const [mapInteracting, setMapInteracting] = useState(false);

  const total = JESUS_JOURNEY.length;
  const current = JESUS_JOURNEY[step];

  const goPrev = () => { if (step > 0) setStep(step - 1); };
  const goNext = () => { if (step < total - 1) setStep(step + 1); };

  const openInBible = (place) => {
    if (!place?.nav) return;
    const ref = pick(place, 'ref', isEn);
    openBible(navigation, { ...place.nav, verseEnd: verseEndFromRef(ref) });
  };

  // HTML do mapa, com dados injetados.
  const mapHtml = useMemo(() => buildMapHtml(isEn), [isEn]);

  const stepLabel = isEn ? `Stop ${step + 1} of ${total}` : `Parada ${step + 1} de ${total}`;
  const currentRef = pick(current, 'ref', isEn);

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xl }} scrollEnabled={!mapInteracting}>
      <Text style={[text('subhead'), { color: colors.textSubtle }]}>
        {isEn
          ? 'Pinch to zoom and drag to pan. The route grows along land paths as you advance. Tap a pin to select a stop.'
          : 'Pinça para zoom e arraste para navegar. A rota cresce por caminhos terrestres a cada passo. Toque num pino para escolher a parada.'}
      </Text>

      <View
        style={{ height: MAP_HEIGHT, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.card, marginTop: space.md }}
        onTouchStart={() => setMapInteracting(true)}
        onTouchEnd={() => setMapInteracting(false)}
        onTouchCancel={() => setMapInteracting(false)}
      >
        <MapView
          html={mapHtml}
          step={step}
          onSelectPlace={(idx) => setStep(idx)}
          style={{ flex: 1, backgroundColor: colors.card }}
        />
      </View>

      {/* Parada atual */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.md, gap: space.sm, marginTop: space.md }}>
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>{stepLabel}</Text>
        <ProgressBar value={(step + 1) / total} accessibilityLabel={stepLabel} />
        <PlacePhoto key={current.id} source={current.photo} />
        <View style={{ gap: space.xxs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
            <Ionicons name="location" size={icon.sm} color={colors.accentText} />
            <Text style={[text('caption1'), { color: colors.accentText, flex: 1 }]}>{pick(current, 'name', isEn)}</Text>
          </View>
          <Text role="heading" style={[text('section'), { color: colors.text }]}>{pick(current, 'title', isEn)}</Text>
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
          <Button
            variant="secondary"
            full={false}
            label={isEn ? 'Next' : 'Próxima'}
            onPress={goNext}
            disabled={step === total - 1}
            style={{ flex: 1 }}
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
              onPress={() => setStep(idx)}
            >
              <Text style={[text('caption1'), { color: colors.accentText }]}>{idx + 1} · {name}</Text>
              <Text style={[text('headline'), { color: colors.text }]} numberOfLines={1}>{title}</Text>
              <Text style={[text('footnote'), { color: colors.textSubtle }]}>{pick(p, 'ref', isEn)}</Text>
            </Row>
          );
        })}
      </Group>
    </ScrollView>
  );
}
