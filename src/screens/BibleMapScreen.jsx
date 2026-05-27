import { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { JESUS_JOURNEY } from '../data/jesusJourney';

// Tela "Nos Passos de Jesus": mapa real (Leaflet + CartoDB Voyager) num WebView.
// A rota cresce no mapa a cada passo, com waypoints terrestres e setas direcionais.
export default function BibleMapScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const webRef = useRef(null);

  const total = JESUS_JOURNEY.length;
  const current = JESUS_JOURNEY[step];
  const styles = makeStyles(colors, fs);

  const goPrev = () => {
    if (step <= 0) return;
    const n = step - 1;
    setStep(n);
    sendStepToWeb(n);
  };
  const goNext = () => {
    if (step >= total - 1) return;
    const n = step + 1;
    setStep(n);
    sendStepToWeb(n);
  };
  const goToStep = (n) => {
    setStep(n);
    sendStepToWeb(n);
  };

  const sendStepToWeb = (n) => {
    if (webRef.current) {
      webRef.current.injectJavaScript(`if(window.setStep){window.setStep(${n});}true;`);
    }
  };

  const openInBible = (nav) => {
    if (!nav) return;
    setSelected(null);
    navigation.navigate('Bíblia', {
      bookId: nav.bookId,
      chapter: nav.chapter,
      highlightVerse: nav.verse,
    });
  };

  // HTML do mapa, com dados injetados.
  const mapHtml = useMemo(() => buildMapHtml(isEn), [isEn]);

  // Mensagens vindas do WebView (clique num pino)
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selectPlace' && typeof data.idx === 'number') {
        setSelected(JESUS_JOURNEY[data.idx]);
      }
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
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

        <View style={styles.mapWrapper}>
          <WebView
            ref={webRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.webView}
            onMessage={onMessage}
            scalesPageToFit={false}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mixedContentMode="always"
            startInLoadingState
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

// Constrói o HTML do mapa Leaflet com os dados injetados.
function buildMapHtml(isEn) {
  const journeyJson = JSON.stringify(
    JESUS_JOURNEY.map((p) => ({
      name: isEn ? p.nameEn : p.name,
      lat: p.lat,
      lng: p.lng,
      waypointsToNext: p.waypointsToNext || [],
    }))
  );

  const hintMsg = isEn ? 'Pinch to zoom · Drag · Tap a pin' : 'Pinça pra zoom · Arraste · Toque num pino';

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<style>
  body, html { margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  #map { width: 100%; height: 100vh; background: #e8dcb8; }
  .pin-future { background: #b9a878; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .pin-past { background: #1a3a5c; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
  .pin-current { background: #e09010; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.7); }
  .hint { position: absolute; bottom: 4px; left: 4px; right: 4px; text-align: center; font-size: 10px; color: #444; background: rgba(255,255,255,0.75); padding: 2px 6px; border-radius: 4px; pointer-events: none; z-index: 999; font-style: italic; }
</style>
</head>
<body>
<div id="map"></div>
<div class="hint">${hintMsg}</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script src="https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js"></script>
<script>
const JOURNEY = ${journeyJson};
let step = 0;

const map = L.map('map', { center: [31.9, 35.4], zoom: 8, zoomControl: true, attributionControl: true });
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OSM, © CARTO', subdomains: 'abcd', maxZoom: 19,
}).addTo(map);

const routeLayer = L.layerGroup().addTo(map);

const markers = JOURNEY.map((p, idx) => {
  const m = L.marker([p.lat, p.lng], {
    icon: L.divIcon({ className: '', html: '<div class="pin-future"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
    title: p.name,
  }).addTo(map);
  m.on('click', () => {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selectPlace', idx: idx }));
    }
  });
  return m;
});

function buildPathUpTo(stepIdx) {
  const path = [];
  if (stepIdx < 1) return path;
  for (let i = 0; i < stepIdx; i++) {
    const from = JOURNEY[i];
    const to = JOURNEY[i + 1];
    if (!to) continue;
    if (path.length === 0) path.push([from.lat, from.lng]);
    (from.waypointsToNext || []).forEach((wp) => path.push(wp));
    path.push([to.lat, to.lng]);
  }
  return path;
}

function update() {
  markers.forEach((m, i) => {
    const isPast = i < step;
    const isCurrent = i === step;
    const cls = isCurrent ? 'pin-current' : isPast ? 'pin-past' : 'pin-future';
    const size = isCurrent ? 28 : isPast ? 18 : 16;
    m.setIcon(L.divIcon({
      className: '',
      html: '<div class="' + cls + '"></div>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    }));
    if (isPast || isCurrent) {
      m.bindTooltip(JOURNEY[i].name, { permanent: isCurrent, direction: 'top', offset: [0, -10] });
    } else {
      m.unbindTooltip();
    }
  });

  routeLayer.clearLayers();
  const path = buildPathUpTo(step);
  if (path.length >= 2) {
    const line = L.polyline(path, {
      color: '#c44a1a', weight: 4, opacity: 0.85,
      dashArray: '8 5', lineCap: 'round', lineJoin: 'round',
    }).addTo(routeLayer);

    L.polylineDecorator(line, {
      patterns: [{
        offset: 30, repeat: 80,
        symbol: L.Symbol.arrowHead({
          pixelSize: 12, polygon: false,
          pathOptions: { stroke: true, color: '#8a2a08', weight: 2.5, opacity: 0.95 },
        }),
      }],
    }).addTo(routeLayer);
  }

  const current = JOURNEY[step];
  map.panTo([current.lat, current.lng], { animate: true, duration: 0.5 });
}

window.setStep = function (n) {
  if (n < 0 || n >= JOURNEY.length) return;
  step = n;
  update();
};

update();
</script>
</body></html>`;
}

function PlaceModal({ place, onClose, onOpenBible, isEn, colors, fs }) {
  if (!place) return null;
  const s = modalStyles(colors, fs);
  return (
    <Modal visible={!!place} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
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
            <Text style={s.body}>{isEn ? place.descEn : place.desc}</Text>
            <TouchableOpacity style={s.bibleBtn} onPress={() => onOpenBible(place.nav)}>
              <Ionicons name="bookmark" size={16} color="#fff" />
              <Text style={s.bibleBtnText}>
                {isEn ? `Read ${place.refEn} in the Bible` : `Ler ${place.ref} na Bíblia`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = (c, fs) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(13, 23, 34, 0.75)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '85%' },
    header: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.divider,
    },
    place: { fontSize: fs(13), color: c.accent, fontWeight: 'bold', marginBottom: 4 },
    title: { fontSize: fs(18), fontWeight: 'bold', color: c.primaryText },
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
