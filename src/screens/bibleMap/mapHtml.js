import { JESUS_JOURNEY } from '../../data/jesusJourney';
import { pick } from '../../utils/i18nData';

// HTML do mapa Leaflet com os dados da jornada injetados.
// Funciona tanto dentro de react-native-webview (nativo) quanto de um <iframe> (web):
//  - seleção de pino: posta para window.ReactNativeWebView (nativo) ou window.parent (web).
//  - troca de passo: window.setStep(n) (injetado no nativo) ou via postMessage {type:'setStep'} (web).
//
// Fundo: mapa físico da Esri (cara de atlas, sem fronteiras nem nomes
// modernos, sem chave de API). Ele só tem ladrilhos até o zoom 8, então a
// partir do 9 entra por cima o relevo sombreado (até o 13) em multiply, que
// devolve a nitidez sem perder a cor. A CARTO passou a exigir chave em 2026 e
// devolvia um ladrilho escrito "API key required".
export function buildMapHtml(isEn) {
  const journeyJson = JSON.stringify(
    JESUS_JOURNEY.map((p) => ({
      name: pick(p, 'name', isEn),
      lat: p.lat,
      lng: p.lng,
      waypointsToNext: p.waypointsToNext || [],
    }))
  );


  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<style>
  body, html { margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  #map { width: 100%; height: 100vh; background: #e9e1cc; }
  .leaflet-pane.leaflet-relief-pane { mix-blend-mode: multiply; }
  .leaflet-tooltip { font-weight: 600; font-size: 12px; border-radius: 6px; padding: 2px 8px; }
  .pin-future { background: #b9a878; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .pin-past { background: #1a3a5c; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
  .pin-current { background: #e09010; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.7); }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script src="https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js"></script>
<script>
const JOURNEY = ${journeyJson};
let step = 0;

function emitSelect(idx) {
  var msg = JSON.stringify({ type: 'selectPlace', idx: idx });
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(msg);
  } else if (window.parent) {
    window.parent.postMessage(msg, '*');
  }
}

// Recebe trocas de passo na web (no nativo usamos injectJavaScript -> window.setStep).
window.addEventListener('message', function (e) {
  try {
    var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (d && d.type === 'setStep' && typeof d.n === 'number') window.setStep(d.n);
  } catch (err) {}
});

const map = L.map('map', {
  center: [31.9, 35.4], zoom: 8, minZoom: 5, maxZoom: 13,
  // Do delta do Nilo ao Hermon: impede que o mapa se perca no oceano.
  maxBounds: [[27.5, 29.0], [35.0, 38.5]], maxBoundsViscosity: 0.8,
  zoomControl: true, attributionControl: true,
});
var ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
L.tileLayer(ESRI + 'World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri, US National Park Service', maxNativeZoom: 8, maxZoom: 13,
}).addTo(map);
map.createPane('relief').classList.add('leaflet-relief-pane');
map.getPane('relief').style.zIndex = 250;
L.tileLayer(ESRI + 'World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
  pane: 'relief', minZoom: 9, maxNativeZoom: 13, maxZoom: 13, attribution: '',
}).addTo(map);

const routeLayer = L.layerGroup().addTo(map);

const markers = JOURNEY.map((p, idx) => {
  const m = L.marker([p.lat, p.lng], {
    icon: L.divIcon({ className: '', html: '<div class="pin-future"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
    title: p.name,
  }).addTo(map);
  m.on('click', () => emitSelect(idx));
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
