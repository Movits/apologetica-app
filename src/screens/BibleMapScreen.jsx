import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { JESUS_JOURNEY } from '../data/jesusJourney';
import MapView from './bibleMap/MapView';
import { buildMapHtml } from './bibleMap/mapHtml';
import { verseEndFromRef } from '../utils/verseRange';

// Tela "Nos Passos de Jesus": mapa real (Leaflet + CartoDB Voyager).
// O renderizador do mapa é plataforma-específico (MapView.native = WebView,
// MapView.web = iframe). A rota cresce a cada passo, com waypoints e setas.
export default function BibleMapScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [mapInteracting, setMapInteracting] = useState(false);

  const total = JESUS_JOURNEY.length;
  const current = JESUS_JOURNEY[step];
  const styles = makeStyles(colors, fs);

  const goPrev = () => { if (step > 0) setStep(step - 1); };
  const goNext = () => { if (step < total - 1) setStep(step + 1); };
  const goToStep = (n) => setStep(n);

  const openInBible = (nav, ref) => {
    if (!nav) return;
    setSelected(null);
    navigation.navigate('Bíblia', {
      bookId: nav.bookId,
      chapter: nav.chapter,
      highlightVerse: nav.verse,
      highlightVerseEnd: verseEndFromRef(ref),
    });
  };

  // HTML do mapa, com dados injetados.
  const mapHtml = useMemo(() => buildMapHtml(isEn), [isEn]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} scrollEnabled={!mapInteracting}>
        <View style={styles.intro}>
          <Text style={styles.title}>
            {isEn ? 'In Jesus\' Footsteps' : 'Nos Passos de Jesus'}
          </Text>
          <Text style={styles.sub}>
            {isEn
              ? 'Pinch to zoom and drag to pan. The route grows along land paths as you advance. Arrows show direction. Tap a pin for details.'
              : 'Pinça pra zoom e arraste pra navegar. A rota cresce por caminhos terrestres a cada passo, com setas mostrando a direção. Toque num pino pra ver detalhes.'}
          </Text>
        </View>

        <View
          style={styles.mapWrapper}
          onTouchStart={() => setMapInteracting(true)}
          onTouchEnd={() => setMapInteracting(false)}
          onTouchCancel={() => setMapInteracting(false)}
        >
          <MapView
            html={mapHtml}
            step={step}
            onSelectPlace={(idx) => setSelected(JESUS_JOURNEY[idx])}
            style={styles.webView}
          />
        </View>

        <View style={styles.timelineBox}>
          <View style={styles.timelineHead}>
            <Text style={styles.stepLabel}>
              {isEn ? 'Step' : 'Passo'} {step + 1} / {total}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((step + 1) / total) * 100}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.currentCard} onPress={() => setSelected(current)} activeOpacity={0.7}>
            <View style={styles.placeLine}>
              <Ionicons name="location" size={14} color={colors.accent} />
              <Text style={styles.placeName}>{isEn ? current.nameEn : current.name}</Text>
            </View>
            <Text style={styles.eventTitle}>{isEn ? current.titleEn : current.title}</Text>
            <Text style={styles.eventDesc} numberOfLines={3}>
              {isEn ? current.descEn : current.desc}
            </Text>
            <Text style={styles.tapToOpen}>
              {isEn ? 'Tap for more · ' : 'Toque para ver mais · '}
              <Text style={styles.refLink}>{isEn ? current.refEn : current.ref}</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={step === 0}
            >
              <Ionicons name="chevron-back" size={20} color={step === 0 ? colors.textSubtle : colors.primaryText} />
              <Text style={[styles.navBtnText, step === 0 && styles.navBtnTextDisabled]}>
                {isEn ? 'Previous' : 'Anterior'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, step === total - 1 && styles.navBtnDisabled]}
              onPress={goNext}
              disabled={step === total - 1}
            >
              <Text style={[styles.navBtnText, step === total - 1 && styles.navBtnTextDisabled]}>
                {isEn ? 'Next' : 'Próximo'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={step === total - 1 ? colors.textSubtle : colors.primaryText} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.allTitle}>
          {isEn ? 'All stops' : 'Todas as paradas'}
        </Text>
        {JESUS_JOURNEY.map((p, idx) => {
          const isPast = idx < step;
          const isCurrent = idx === step;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.listRow,
                isCurrent && styles.listRowActive,
                isPast && !isCurrent && styles.listRowPast,
              ]}
              onPress={() => goToStep(idx)}
            >
              <View style={[styles.listNum, (isPast || isCurrent) && styles.listNumDone]}>
                <Text style={[styles.listNumText, (isPast || isCurrent) && styles.listNumTextDone]}>
                  {idx + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listPlace}>{isEn ? p.nameEn : p.name}</Text>
                <Text style={styles.listEvent} numberOfLines={1}>{isEn ? p.titleEn : p.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <PlaceModal place={selected} onClose={() => setSelected(null)} onOpenBible={openInBible} isEn={isEn} colors={colors} fs={fs} />
    </View>
  );
}

function PlaceModal({ place, onClose, onOpenBible, isEn, colors, fs }) {
  if (!place) return null;
  const s = modalStyles(colors, fs);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  return (
    <Modal visible={!!place} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.place}>
                <Ionicons name="location" size={16} color={colors.accent} /> {isEn ? place.nameEn : place.name}
              </Text>
              <Text style={s.title}>{isEn ? place.titleEn : place.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 8 }}>
            {place.photo && !imgError && (
              <View style={s.photoBox}>
                {imgLoading && (
                  <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.accent} />
                )}
                <Image
                  source={place.photo}
                  style={[s.photo, imgLoading && { opacity: 0 }]}
                  resizeMode="cover"
                  onLoad={() => setImgLoading(false)}
                  onLoadEnd={() => setImgLoading(false)}
                  onError={() => { setImgLoading(false); setImgError(true); }}
                />
              </View>
            )}
            <Text style={s.body}>{isEn ? place.descEn : place.desc}</Text>
            <TouchableOpacity style={s.bibleBtn} onPress={() => onOpenBible(place.nav, place.ref)}>
              <Ionicons name="bookmark" size={16} color="#fff" />
              <Text style={s.bibleBtnText}>
                {isEn ? `Read ${place.refEn} in the Bible` : `Ler ${place.ref} na Bíblia`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const modalStyles = (c, fs) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(13, 23, 34, 0.75)', justifyContent: 'flex-end', alignItems: 'center' },
    // maxWidth evita o sheet ficar largo demais no desktop (web); no celular fica 100%.
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '85%', width: '100%', maxWidth: 520 },
    header: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.divider,
    },
    place: { fontSize: fs(13), color: c.accent, fontWeight: 'bold', marginBottom: 4 },
    title: { fontSize: fs(18), fontWeight: 'bold', color: c.primaryText },
    photoBox: { width: '100%', aspectRatio: 3 / 2, borderRadius: 10, overflow: 'hidden', marginBottom: 14, backgroundColor: c.divider },
    photo: { width: '100%', height: '100%' },
    body: { fontSize: fs(15), color: c.text, lineHeight: fs(23), marginBottom: 16 },
    bibleBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: c.primary, paddingVertical: 14, borderRadius: 10,
    },
    bibleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: fs(14) },
  });

const makeStyles = (c, fs) =>
  StyleSheet.create({
    intro: { padding: 14, backgroundColor: c.card, borderRadius: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: c.accent },
    title: { fontSize: fs(18), color: c.primaryText, fontWeight: 'bold', marginBottom: 6 },
    sub: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(18) },
    mapWrapper: { width: '100%', height: 480, borderRadius: 10, overflow: 'hidden', marginBottom: 14, backgroundColor: '#e8dcb8' },
    webView: { flex: 1, backgroundColor: '#e8dcb8' },
    timelineBox: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 14 },
    timelineHead: { marginBottom: 10 },
    stepLabel: { fontSize: fs(11), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    progressBar: { height: 4, backgroundColor: c.divider, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: c.accent },
    currentCard: { backgroundColor: c.badgeBg, borderRadius: 10, padding: 12, marginBottom: 10 },
    placeLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    placeName: { fontSize: fs(12), color: c.accent, fontWeight: 'bold' },
    eventTitle: { fontSize: fs(15), color: c.primaryText, fontWeight: '600', marginBottom: 4 },
    eventDesc: { fontSize: fs(13), color: c.text, lineHeight: fs(19), marginBottom: 6 },
    tapToOpen: { fontSize: fs(11), color: c.textSubtle, fontStyle: 'italic' },
    refLink: { color: c.accent, fontWeight: 'bold', fontStyle: 'normal' },
    navRow: { flexDirection: 'row', gap: 8 },
    navBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
      borderWidth: 1, borderColor: c.accent, paddingVertical: 10, borderRadius: 10,
    },
    navBtnDisabled: { borderColor: c.divider },
    navBtnText: { color: c.primaryText, fontSize: fs(13), fontWeight: '600' },
    navBtnTextDisabled: { color: c.textSubtle },
    allTitle: { fontSize: fs(13), fontWeight: 'bold', color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 8 },
    listRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, padding: 10, borderRadius: 8, marginBottom: 4,
    },
    listRowActive: { borderWidth: 1, borderColor: c.accent },
    listRowPast: { opacity: 0.7 },
    listNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.divider, justifyContent: 'center', alignItems: 'center' },
    listNumDone: { backgroundColor: c.accent },
    listNumText: { color: c.text, fontSize: fs(12), fontWeight: 'bold' },
    listNumTextDone: { color: '#fff' },
    listPlace: { fontSize: fs(13), color: c.primaryText, fontWeight: '600' },
    listEvent: { fontSize: fs(11), color: c.textSubtle, marginTop: 1 },
  });
