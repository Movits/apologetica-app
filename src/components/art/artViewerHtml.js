// HTML do visualizador de obras: OpenSeadragon (o mesmo motor de zoom
// profundo do Museu Virtual) com as lupas como marcadores sobre a imagem.
// Roda em react-native-webview (nativo) e em <iframe srcDoc> (web), como o
// mapa da jornada (src/screens/bibleMap/mapHtml.js).
//
// A página só desenha e mexe a câmera. Textos, painéis e navegação entre
// lupas são do React Native, que conversa com ela por mensagens:
//  - página -> app: {type:'ready', aspect} quando a imagem abre, {type:'loaded'}
//    no primeiro ladrilho, {type:'lupa', id} ao tocar num marcador,
//    {type:'tap'} num toque simples fora dos marcadores, {type:'error'}.
//  - app -> página: window.__art(cmd, arg) com cmd 'fit' ({x,y,width,height}
//    em coordenadas de viewport), 'home', 'active' (id ou null), 'markers'
//    (true/false) e 'zoom' (fator). Na web chega por postMessage {__art, cmd, arg}.
//
// O tile source é a URL de um .dzi (obras do Museu Virtual) ou a pirâmide de
// miniaturas da Commons ({type:'legacy-image-pyramid', levels}), que carrega a
// de 960 px primeiro e só busca a de 3840 px quando o zoom pede.

const OSD_URL = 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/5.0.1/openseadragon.min.js';

export function buildArtViewerHtml({ source, lupas = [], background, accent, reduceMotion = false, lupaLabel }) {
  const config = JSON.stringify({
    source,
    lupas: lupas.map(({ id, title, x, y, w, h }) => ({ id, title, x, y, w, h })),
    reduceMotion,
    lupaLabel,
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"/>
<style>
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: ${background};
    -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none;
    -webkit-touch-callout: none; overscroll-behavior: none; }
  #viewer { position: absolute; inset: 0; opacity: 0; transition: opacity .6s cubic-bezier(.22,1,.36,1); }
  #viewer.is-open { opacity: 1; }
  .lupa { width: 40px; height: 40px; border-radius: 50%; padding: 0; margin: 0; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: ${accent}; background: rgba(10,8,5,.58); border: 1px solid rgba(201,168,76,.55);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
    box-shadow: 0 0 0 0 rgba(201,168,76,.35); animation: pulse 4s ease-out infinite;
    transition: transform .25s cubic-bezier(.22,1,.36,1), background-color .25s, opacity .3s; }
  .lupa svg { width: 20px; height: 20px; display: block; pointer-events: none; }
  /* A lupa aberta some: o leitor está olhando para o que ela cobria. */
  .lupa.is-active { opacity: 0; pointer-events: none; animation: none; }
  .lupas-off .lupa { opacity: 0; pointer-events: none; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(201,168,76,.4); } 70%, 100% { box-shadow: 0 0 0 14px rgba(201,168,76,0); } }
  @media (hover: hover) { .lupa:hover { transform: scale(1.15); animation-play-state: paused; } }
  @media (prefers-reduced-motion: reduce) { .lupa { animation: none; } #viewer { transition: none; } }
</style>
</head>
<body>
<div id="viewer"></div>
<script>
(function () {
  var CFG = ${config};
  var isNative = !!(window.ReactNativeWebView && window.ReactNativeWebView.postMessage);
  function post(msg) {
    var s = JSON.stringify(msg);
    if (isNative) window.ReactNativeWebView.postMessage(s);
    else if (window.parent !== window) window.parent.postMessage(JSON.stringify(Object.assign({ __artViewer: true }, msg)), '*');
  }

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.4" y1="15.4" x2="21" y2="21"/>' +
    '<line x1="10.5" y1="8" x2="10.5" y2="13" opacity=".55"/><line x1="8" y1="10.5" x2="13" y2="10.5" opacity=".55"/></svg>';

  var viewer = null, markers = {}, anyTile = false, failed = false;

  function fail() { if (failed) return; failed = true; post({ type: 'error' }); }

  function start() {
    if (!window.OpenSeadragon) { fail(); return; }
    var fast = CFG.reduceMotion;
    viewer = OpenSeadragon({
      element: document.getElementById('viewer'),
      tileSources: CFG.source,
      crossOriginPolicy: 'Anonymous',
      showNavigationControl: false,
      animationTime: fast ? 0.25 : 1.1,
      springStiffness: fast ? 12 : 7,
      blendTime: 0.15,
      zoomPerScroll: 1.3,
      zoomPerClick: 2.2,
      maxZoomPixelRatio: 2.5,
      minZoomImageRatio: 0.9,
      visibilityRatio: 0.8,
      constrainDuringPan: true,
      immediateRender: false,
      gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true, flickEnabled: true },
      gestureSettingsTouch: { clickToZoom: false, dblClickToZoom: true, pinchRotate: false, flickEnabled: true },
      gestureSettingsPen: { clickToZoom: false, dblClickToZoom: true }
    });

    viewer.addHandler('open', function () {
      var item = viewer.world.getItemAt(0);
      var size = item.getContentSize();
      CFG.lupas.forEach(function (l) {
        var btn = document.createElement('button');
        btn.className = 'lupa';
        btn.type = 'button';
        btn.setAttribute('aria-label', CFG.lupaLabel + ': ' + l.title);
        btn.innerHTML = ICON;
        var rect = viewer.viewport.imageToViewportRectangle(l.x * size.x, l.y * size.y, l.w * size.x, l.h * size.y);
        // MouseTracker próprio: sem ele o canvas engole o toque como arrasto.
        new OpenSeadragon.MouseTracker({
          element: btn,
          clickHandler: function (e) { if (e.quick !== false) select(l.id, true); }
        });
        viewer.addOverlay({ element: btn, location: rect.getCenter(), placement: OpenSeadragon.Placement.CENTER, checkResize: false });
        markers[l.id] = btn;
      });
      document.getElementById('viewer').classList.add('is-open');
      post({ type: 'ready', aspect: size.x / size.y });
    });
    viewer.addHandler('open-failed', fail);
    viewer.addHandler('tile-loaded', function () { if (!anyTile) { anyTile = true; post({ type: 'loaded' }); } });
    viewer.addHandler('tile-load-failed', function () { if (!anyTile) fail(); });
    viewer.addHandler('canvas-click', function (e) { if (e.quick) post({ type: 'tap' }); });
    // Sem nenhum ladrilho em 20 s (rede muito lenta ou bloqueada): o app
    // volta para a imagem local.
    setTimeout(function () { if (!anyTile) fail(); }, 20000);
  }

  function setActive(id) {
    Object.keys(markers).forEach(function (k) { markers[k].classList.toggle('is-active', k === id); });
  }
  function select(id, fromTap) {
    setActive(id);
    if (fromTap) post({ type: 'lupa', id: id });
  }

  window.__art = function (cmd, arg) {
    if (!viewer) return;
    if (cmd === 'fit' && arg) viewer.viewport.fitBounds(new OpenSeadragon.Rect(arg.x, arg.y, arg.width, arg.height));
    else if (cmd === 'home') { setActive(null); viewer.viewport.goHome(); }
    else if (cmd === 'active') setActive(arg);
    else if (cmd === 'markers') document.body.classList.toggle('lupas-off', !arg);
    else if (cmd === 'zoom') { viewer.viewport.zoomBy(arg); viewer.viewport.applyConstraints(); }
  };
  window.addEventListener('message', function (e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d && d.__art) window.__art(d.cmd, d.arg);
    } catch (err) {}
  });

  var s = document.createElement('script');
  s.src = '${OSD_URL}';
  s.onload = start;
  s.onerror = fail;
  document.head.appendChild(s);
})();
</script>
</body></html>`;
}
