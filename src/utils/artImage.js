// URLs da Wikimedia Commons e geometria do visualizador de obras. Puro (sem
// react-native), testado em tests/artImage.test.mjs.
//
// A Commons só serve miniaturas em tamanhos-padrão (pedir 2560 dá HTTP 400) e
// só pelo host thumb.wikimedia.org (o caminho /thumb do upload.wikimedia.org
// responde 429). Uma miniatura nunca pode ser maior ou igual ao original:
// nesse caso a URL é a do próprio original.

export const COMMONS_BUCKETS = [500, 960, 1280, 1920, 3840];
// Degraus da pirâmide progressiva: o visualizador carrega o de baixo primeiro
// e só busca o de 3840 px (cerca de 3 MB) quando o zoom pede.
const PYRAMID_BUCKETS = [960, 1920, 3840];

export function commonsOriginalUrl(img) {
  return `https://upload.wikimedia.org/wikipedia/commons/${img.path}/${img.file}`;
}

function thumbUrl(img, width) {
  return `https://thumb.wikimedia.org/wikipedia/commons/thumb/${img.path}/${img.file}/${width}px-${img.file}`;
}

// Menor tamanho-padrão com pelo menos `minWidth` px; o original quando ele
// já é menor que esse tamanho.
export function commonsUrl(img, minWidth) {
  const bucket = COMMONS_BUCKETS.find((b) => b >= minWidth) ?? COMMONS_BUCKETS[COMMONS_BUCKETS.length - 1];
  return bucket < img.width ? thumbUrl(img, bucket) : commonsOriginalUrl(img);
}

// Níveis para o tile source 'legacy-image-pyramid' do OpenSeadragon, do
// menor para o maior. Original até 3840 px entra inteiro como último nível.
export function commonsPyramid(img) {
  const levels = PYRAMID_BUCKETS.filter((b) => b < img.width).map((width) => ({
    url: thumbUrl(img, width),
    width,
    height: Math.round((img.height * width) / img.width),
  }));
  if (img.width <= PYRAMID_BUCKETS[PYRAMID_BUCKETS.length - 1]) {
    levels.push({ url: commonsOriginalUrl(img), width: img.width, height: img.height });
  }
  return levels;
}

// Retângulo para viewer.viewport.fitBounds que mostra a lupa inteira, com
// folga (`pad`, fração do tamanho da lupa em cada lado), centrada na parte da
// tela que fica livre entre a barra de cima, o painel de baixo (celular) e o
// painel da direita (desktop). Sem essa conta a lupa ficava atrás do painel.
//
// Coordenadas do OpenSeadragon: a imagem tem largura 1 e altura 1 / aspect
// (aspect = largura / altura). A lupa vem normalizada de 0 a 1 nos dois eixos,
// como no Museu Virtual. O retângulo devolvido tem exatamente a proporção da
// tela, então o fitBounds não acrescenta sobra que deslocaria o centro.
export function lupaBounds({
  lupa,
  aspect,
  viewW,
  viewH,
  topInset = 0,
  bottomInset = 0,
  rightInset = 0,
  pad = 0.18,
}) {
  const rw = lupa.w * (1 + 2 * pad);
  const rh = (lupa.h * (1 + 2 * pad)) / aspect;
  const cx = lupa.x + lupa.w / 2;
  const cy = (lupa.y + lupa.h / 2) / aspect;

  const freeW = Math.max(1, viewW - rightInset);
  const freeH = Math.max(1, viewH - topInset - bottomInset);
  const scale = Math.max(rw / freeW, rh / freeH);

  return {
    x: cx - scale * (freeW / 2),
    y: cy - scale * (topInset + freeH / 2),
    width: scale * viewW,
    height: scale * viewH,
  };
}
