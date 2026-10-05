---
tags: [funcionalidade]
atualizado: 2026-10-05
aliases: [Aulas de Arte, Lupas]
---
# Visualizador de Obras

A imagem de cada artigo abre numa "sala escura" com zoom profundo, lupas sobre
os detalhes e uma aula sobre a obra, à moda do Museu Virtual (projeto irmão do
dono, https://movits.github.io/museu-virtual/).

## Telas e componentes

- `src/components/art/ArtViewer.jsx`: o modal (barra de cima, painel do
  detalhe com visita guiada, painel da aula com placa, ponte com o artigo,
  texto e lista de detalhes, link "Ver no Museu Virtual").
- `src/components/art/artViewerHtml.js`: a página do OpenSeadragon 5.0.1 (CDN
  cdnjs) com as lupas; `ArtCanvas.native.jsx` (WebView) e `ArtCanvas.web.jsx`
  (iframe srcDoc) a hospedam, como o [[Mapa Bíblico]].
- `src/components/ZoomableImage.jsx`: reserva sem rede (imagem local com
  pinça, toque duplo e arrasto); também usada pelo `ImageZoomModal`.
- No artigo, o herói ganhou o selo "Explorar a obra · N detalhes" e troca a
  imagem local (~1000 px) pela da Commons em 1280 px quando há rede.

## Dados

- `src/data/artworks/<slug>.js`: uma lição por obra (placa, `intro`, `notes`
  por artigo, `lupas` com x/y/w/h normalizados), PT e EN. Em outubro de 2026
  as 83 imagens dos artigos têm aula: 82 lições, 472 lupas.
- `index.js` (resumo leve: artigo, slug, número de lupas) e `all.js` (todas as
  lições, carregado por `loadArtwork()` só quando o visualizador abre; na web
  é um pedaço separado de ~370 KB) são gerados por
  `scripts/generate-artworks-index.mjs`. Nunca importe `all.js` direto numa tela.
- As 7 obras que também estão no Museu (8 artigos) vieram de lá por
  `scripts/import-museum-artworks.mjs` e trazem `dzi` (pirâmide Deep Zoom dos
  repositórios de acervo). As demais usam a pirâmide de miniaturas da Commons
  (960, 1920, 3840 px), e as coordenadas valem sobre o arquivo da Commons.
- `src/data/artImages.js` é gerado por `scripts/generate-art-images.mjs`
  (arquivo, caminho de hash e tamanho do original de cada artigo).
- Testes: `tests/artImage.test.mjs` (URLs e enquadramento) e
  `tests/artworks.test.mjs` (integridade das lições).

## Decisões e armadilhas

- O `imageHd` dos artigos (proxy wsrv.nl) quebrou em outubro de 2026: a
  Wikimedia limitou o proxy (429) e 66 de 83 URLs falhavam. A Commons só serve
  miniaturas nos tamanhos-padrão e pelo host thumb.wikimedia.org.
- A lupa é enquadrada na parte livre da tela (`lupaBounds`), descontando a
  barra de cima e o painel de baixo (ou da direita no desktop).
- As lupas encolhem na visão geral de telas estreitas e crescem com o zoom.

## Ligações

- [[Artigos]]
- [[Decisão - App 100% offline]] (o zoom profundo precisa de rede, com reserva local)
