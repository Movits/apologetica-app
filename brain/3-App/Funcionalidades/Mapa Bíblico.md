---
tags: [funcionalidade]
atualizado: 2026-07-08
aliases: [Nos Passos de Jesus]
---
# Mapa Bíblico

Mapa interativo "Nos Passos de Jesus" que percorre a vida de Cristo em paradas geográficas reais, de Belém à Ascensão.

## Telas

- `src/screens/BibleMapScreen.jsx` (tela principal com o passo a passo)
- `src/screens/bibleMap/MapView.native.jsx`, `src/screens/bibleMap/MapView.web.jsx` e `src/screens/bibleMap/mapHtml.js` (renderização do mapa)

## Dados

- [[Catálogo de Dados]]
- `src/data/jesusJourney.js` com 21 paradas em julho de 2026, cada uma com coordenadas GPS reais, descrição bilíngue, referência bíblica com navegação (`nav`) e waypoints intermediários para a rota seguir caminhos terrestres
- Fotos locais em `assets/jesus-journey/` (uma por parada)

## Serviços e utilitários

- Leaflet com tiles CartoDB Voyager, gerado como HTML em `mapHtml.js` com os dados da jornada injetados
- No celular o HTML roda dentro de `react-native-webview`, na web dentro de um `iframe` com `srcDoc`, ver [[Utilitários e Componentes]]

## Como funciona

O usuário avança e volta pelas paradas com botões prev/next, e a rota desenhada no mapa cresce a cada passo seguindo os waypoints (contornando o Mediterrâneo e descendo pelo vale do Jordão). Tocar em um pino abre um modal com foto, descrição e botão para abrir a passagem no [[Leitor da Bíblia]] com o versículo destacado. A comunicação com o mapa é específica por plataforma: no nativo a tela injeta JavaScript (`window.setStep`) e recebe eventos via `onMessage`, na web usa `postMessage` nos dois sentidos. Os tiles do mapa e o CSS do Leaflet vêm de CDN, então esta tela precisa de internet para exibir o fundo do mapa, uma exceção conhecida ao offline.

## Ligações

- [[Leitor da Bíblia]]
- [[Decisão - App 100% offline]] (os tiles do mapa são exceção)
- [[Bíblia (dados)]]
- [[Mapa de Funcionalidades]]
