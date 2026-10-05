import { JESUS_JOURNEY } from '../../data/jesusJourney';
import { pick } from '../../utils/i18nData';

// HTML do mapa Leaflet com os dados da jornada injetados.
// Funciona tanto dentro de react-native-webview (nativo) quanto de um <iframe> (web):
//  - seleção de pino: posta para window.ReactNativeWebView (nativo) ou window.parent (web).
//  - troca de passo: window.setStep(n, instant) (injetado no nativo) ou via
//    postMessage {type:'setStep', n, instant} (web). `instant` enquadra sem
//    voar: é o que o MapView manda quando o documento termina de carregar (o
//    HTML é refeito ao trocar tema ou idioma e o mapa precisa voltar ao passo
//    em que a tela está).
//
// Fundo: mapa físico da Esri (cara de atlas, sem fronteiras nem nomes
// modernos, sem chave de API). Ele só tem ladrilhos até o zoom 8, e os do 8
// já são ampliados na origem (blocos visíveis), então a partir do 8 entra por
// cima o relevo sombreado (até o 13) em multiply, que devolve a nitidez sem
// perder a cor. A CARTO passou a exigir chave em 2026 e
// devolvia um ladrilho escrito "API key required". Em tela retina os
// ladrilhos vêm um nível acima (detectRetina), por isso o teto nativo cai um
// (e o maxZoom sobe um, porque o detectRetina o desconta).
//
// Tema: as cores vêm da paleta do app (useTheme().colors) e entram como
// variáveis CSS. O mapa base continua o mesmo nos dois temas, só levemente
// escurecido no escuro; controles, atribuição e rótulos seguem a paleta.

// '#rrggbb' -> 'rgba(r,g,b,a)'. Cores que já são rgba passam direto.
function alpha(hex, a) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function buildMapHtml({ isEn, dark, colors }) {
  const journeyJson = JSON.stringify(
    JESUS_JOURNEY.map((p) => ({
      name: pick(p, 'name', isEn),
      lat: p.lat,
      lng: p.lng,
      waypointsToNext: p.waypointsToNext || [],
    }))
  );

  // Navy e dourado da paleta: rota e pinos visitados em navy, a parada atual
  // em dourado com anel claro. O anel (onPrimary) separa o pino do mapa nos
  // dois temas, porque o mapa base é claro mesmo no escuro.
  const c = {
    navy: colors.primary,
    navySoft: alpha(colors.primary, 0.55),
    gold: colors.accent,
    goldSoft: alpha(colors.accent, 0.35),
    ring: colors.onPrimary,
    paper: colors.bg,
    surface: colors.elevated,
    text: colors.text,
    muted: colors.textSubtle,
    tint: colors.tint,
    hairline: colors.separator,
    material: colors.material,
  };
  const routeJson = JSON.stringify({ navy: c.navy, ring: c.ring });

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"/>
<meta name="color-scheme" content="${dark ? 'dark' : 'light'}"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<style>
  :root {
    --navy: ${c.navy}; --navy-soft: ${c.navySoft}; --gold: ${c.gold}; --gold-soft: ${c.goldSoft};
    --ring: ${c.ring}; --paper: ${c.paper}; --surface: ${c.surface}; --text: ${c.text};
    --muted: ${c.muted}; --tint: ${c.tint}; --hairline: ${c.hairline}; --material: ${c.material};
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  html, body { margin: 0; padding: 0; height: 100%; background: var(--paper); font-family: var(--font); }
  #map { width: 100%; height: 100vh; }
  .leaflet-container { background: var(--paper); font-family: var(--font); -webkit-tap-highlight-color: transparent; }
  .leaflet-pane.leaflet-relief-pane { mix-blend-mode: multiply; }
  ${dark ? '.leaflet-tile-pane { filter: brightness(0.8) saturate(0.85); }' : ''}

  /* Pinos: a área de toque é o quadrado de 44 do marcador; o ponto visível
     fica centrado nela. Futuro = anel vazado, visitado = navy cheio,
     atual = dourado com anel claro e um halo que pulsa. */
  .pin-hit { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
  .pin { box-sizing: border-box; border-radius: 50%; position: relative; }
  .pin-future { width: 12px; height: 12px; background: var(--ring); border: 2.5px solid var(--navy-soft); }
  .pin-past { width: 14px; height: 14px; background: var(--navy); border: 2px solid var(--ring); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .pin-current { width: 22px; height: 22px; background: var(--gold); border: 3px solid var(--ring); box-shadow: 0 0 0 1.5px var(--navy), 0 2px 6px rgba(0,0,0,0.35); }
  .pin-current::after {
    content: ''; position: absolute; inset: -3px; border-radius: 50%;
    border: 2px solid var(--gold); opacity: 0;
    animation: ping 2.4s var(--ease-out) infinite;
  }
  @keyframes ping { 0% { transform: scale(1); opacity: 0.85; } 70%, 100% { transform: scale(2.3); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .pin-current::after { animation: none; opacity: 1; border: none; box-shadow: 0 0 0 5px var(--gold-soft); }
  }
  .leaflet-marker-icon:focus { outline: none; }
  .leaflet-marker-icon:focus-visible .pin { outline: 2px solid var(--tint); outline-offset: 3px; }

  /* Rótulos dos pinos na paleta. */
  .leaflet-tooltip {
    background: var(--surface); color: var(--text); border: none; border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18); padding: 3px 8px;
    font: 600 12px/16px var(--font); white-space: nowrap;
  }
  .leaflet-tooltip-top:before { border-top-color: var(--surface); }

  /* Botões + e − com 44 de lado, superfície elevada e tint da paleta. */
  .leaflet-touch .leaflet-bar, .leaflet-bar {
    border: none; border-radius: 12px; overflow: hidden;
    box-shadow: 0 0 0 0.5px var(--hairline), 0 2px 8px rgba(0,0,0,0.16);
  }
  .leaflet-touch .leaflet-bar a, .leaflet-bar a {
    width: 44px; height: 44px; line-height: 44px; font: 400 24px/44px var(--font);
    background: var(--surface); color: var(--tint); border-bottom: 1px solid var(--hairline);
    transition: box-shadow 150ms ease;
  }
  .leaflet-bar a:last-child { border-bottom: none; }
  /* Estado de hover/toque: véu da hairline por cima da superfície (a cor é
     translúcida e, sozinha como fundo, deixaria o mapa aparecer no botão). */
  .leaflet-bar a:hover, .leaflet-bar a:focus-visible { background: var(--surface); color: var(--tint); }
  @media (hover: hover) and (pointer: fine) { .leaflet-bar a:hover { box-shadow: inset 0 0 0 44px var(--hairline); } }
  .leaflet-bar a:active { box-shadow: inset 0 0 0 44px var(--hairline); }
  .leaflet-bar a.leaflet-disabled, .leaflet-bar a.leaflet-disabled:hover { background: var(--surface); color: var(--muted); opacity: 0.45; }

  /* Atribuição: material translúcido do tema, texto discreto. */
  .leaflet-container .leaflet-control-attribution {
    background: var(--material); color: var(--muted); font: 10px/14px var(--font);
    padding: 2px 8px; border-top-left-radius: 8px;
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  }
  .leaflet-control-attribution a { color: var(--tint); text-decoration: none; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script src="https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js"></script>
<script>
var JOURNEY = ${journeyJson};
var ROUTE = ${routeJson};
var step = 0;
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (d && d.type === 'setStep' && typeof d.n === 'number') window.setStep(d.n, !!d.instant);
  } catch (err) {}
});

var map = L.map('map', {
  center: [31.9, 35.4], zoom: 7, minZoom: 5, maxZoom: 13,
  zoomSnap: 0.25, zoomDelta: 1,
  // Do delta do Nilo ao Hermon: impede que o mapa se perca no oceano.
  maxBounds: [[27.5, 29.0], [35.0, 38.5]], maxBoundsViscosity: 0.8,
  // Na web a roda do mouse só dá zoom depois de um clique no mapa: antes
  // disso ela rola a página, que é o que quem está lendo espera.
  scrollWheelZoom: false,
  zoomControl: true, attributionControl: true,
});
var mapEl = map.getContainer();
mapEl.addEventListener('pointerdown', function () { map.scrollWheelZoom.enable(); });
mapEl.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });

var ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
var RETINA = L.Browser.retina;
L.tileLayer(ESRI + 'World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri, US National Park Service',
  detectRetina: true, maxNativeZoom: RETINA ? 7 : 8, maxZoom: RETINA ? 14 : 13,
}).addTo(map);
map.createPane('relief').classList.add('leaflet-relief-pane');
map.getPane('relief').style.zIndex = 250;
L.tileLayer(ESRI + 'World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
  pane: 'relief', minZoom: 8, detectRetina: true, maxNativeZoom: RETINA ? 12 : 13, maxZoom: RETINA ? 14 : 13, attribution: '',
}).addTo(map);

// Zoom fracionário (zoomSnap 0.25) escala os ladrilhos e o Chromium deixa
// frestas claras entre eles. Cada ladrilho ganha 1 px de sobra por cima do
// vizinho, com mistura normal (a plus-lighter do Leaflet somaria a sobra e
// acenderia a emenda).
var TILE = RETINA ? 128 : 256;
var seamFix = document.createElement('style');
seamFix.textContent = '.leaflet-container img.leaflet-tile{mix-blend-mode:normal;width:' + (TILE + 1) + 'px !important;height:' + (TILE + 1) + 'px !important;}';
document.head.appendChild(seamFix);

var routeLayer = L.layerGroup().addTo(map);

// Tamanho visível de cada tipo de pino (o rótulo fica logo acima dele).
var DOT = { future: 12, past: 14, current: 22 };

function pinIcon(kind) {
  return L.divIcon({
    className: '',
    html: '<div class="pin-hit"><div class="pin pin-' + kind + '"></div></div>',
    iconSize: [44, 44], iconAnchor: [22, 22],
  });
}

var markers = JOURNEY.map(function (p, idx) {
  var m = L.marker([p.lat, p.lng], { icon: pinIcon('future'), keyboard: true }).addTo(map);
  m.on('click', function () { emitSelect(idx); });
  return m;
});

function legPoints(i) {
  var pts = [[JOURNEY[i].lat, JOURNEY[i].lng]];
  if (i > 0) {
    var prev = JOURNEY[i - 1];
    pts.push([prev.lat, prev.lng]);
    (prev.waypointsToNext || []).forEach(function (wp) { pts.push(wp); });
  }
  return pts;
}

function buildPathUpTo(stepIdx) {
  var path = [];
  for (var i = 0; i < stepIdx; i++) {
    var from = JOURNEY[i];
    var to = JOURNEY[i + 1];
    if (!to) continue;
    if (path.length === 0) path.push([from.lat, from.lng]);
    (from.waypointsToNext || []).forEach(function (wp) { path.push(wp); });
    path.push([to.lat, to.lng]);
  }
  return path;
}

function render() {
  markers.forEach(function (m, i) {
    var kind = i === step ? 'current' : i < step ? 'past' : 'future';
    m.setIcon(pinIcon(kind));
    m.setZIndexOffset(kind === 'current' ? 1000 : kind === 'past' ? 100 : 0);
    var el = m.getElement();
    if (el) el.setAttribute('aria-label', JOURNEY[i].name);
    m.unbindTooltip();
    m.bindTooltip(JOURNEY[i].name, {
      permanent: kind === 'current', direction: 'top', offset: [0, -(DOT[kind] / 2 + 2)],
    });
  });

  routeLayer.clearLayers();
  var path = buildPathUpTo(step);
  if (path.length >= 2) {
    // Contorno claro por baixo e a trilha navy pontilhada por cima: lê bem
    // tanto sobre o deserto quanto sobre o verde e a água do mapa físico.
    L.polyline(path, {
      color: ROUTE.ring, weight: 7, opacity: 0.55, lineCap: 'round', lineJoin: 'round', interactive: false,
    }).addTo(routeLayer);
    var line = L.polyline(path, {
      color: ROUTE.navy, weight: 3.5, opacity: 0.95, dashArray: '1 8', lineCap: 'round', lineJoin: 'round', interactive: false,
    }).addTo(routeLayer);
    L.polylineDecorator(line, {
      patterns: [{
        offset: 40, repeat: 110,
        symbol: L.Symbol.arrowHead({
          pixelSize: 9, polygon: true,
          pathOptions: { stroke: true, color: ROUTE.ring, weight: 1.5, fill: true, fillColor: ROUTE.navy, fillOpacity: 1, interactive: false },
        }),
      }],
    }).addTo(routeLayer);
  }
}

// Enquadramento: no passo 0 a jornada inteira; nos outros, o trecho que
// acabou de ser percorrido (parada anterior, caminho e parada atual), sem
// aproximar demais quando as duas paradas são vizinhas. O respiro de cima
// deixa lugar para o rótulo do pino atual.
var ALL = L.latLngBounds(JOURNEY.map(function (p) { return [p.lat, p.lng]; }));
var LEG_MAX_ZOOM = 9;

function frame(instant) {
  var bounds = step === 0 ? ALL : L.latLngBounds(legPoints(step));
  var opts = {
    paddingTopLeft: [32, 48], paddingBottomRight: [32, 28],
    maxZoom: step === 0 ? 13 : LEG_MAX_ZOOM,
  };
  if (instant || reduceMotion) {
    map.fitBounds(bounds, Object.assign({ animate: false }, opts));
  } else {
    map.flyToBounds(bounds, Object.assign({ duration: 0.9, easeLinearity: 0.35 }, opts));
  }
}

window.setStep = function (n, instant) {
  if (typeof n !== 'number' || n < 0 || n >= JOURNEY.length) return;
  var changed = n !== step;
  step = n;
  if (changed) render();
  if (changed || instant) frame(instant);
};

// Girar o aparelho ou redimensionar a janela muda o tamanho do mapa:
// reenquadra o passo atual no tamanho novo.
var resizeTimer = null;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () { map.invalidateSize(); frame(true); }, 150);
});

render();
frame(true);
</script>
</body></html>`;
}
