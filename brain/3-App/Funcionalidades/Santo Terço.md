---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Santo Terço

Terço interativo com contas desenhadas na tela, mistérios do dia e todas as orações, para rezar acompanhando conta por conta.

## Telas

- `src/screens/RosaryScreen.jsx` concentra tudo: seletor de mistérios, lista dos 5 mistérios do conjunto, desenho do terço e orações completas.

## Dados

Ver [[Catálogo de Dados]].

- Os dados moram dentro da própria tela: os quatro conjuntos de mistérios (Gozosos, Luminosos, Dolorosos e Gloriosos), com os dias da semana de cada um e a referência bíblica de cada mistério (livro, capítulo e versículo). Tudo bilíngue PT/EN.

## Serviços e utilitários

- `react-native-svg` desenha o terço com contas clicáveis, gradientes e a medalha central.
- Deep link para a tab Bíblia com o versículo do mistério já destacado, ver [[Leitor da Bíblia]].

## Como funciona

A tela abre já no conjunto de mistérios do dia da semana, seguindo o costume da Igreja, e o usuário pode trocar pelos outros três. O terço aparece desenhado em SVG e cada conta é interativa: tocar avança a oração correspondente (Pai-Nosso, Ave-Maria, Glória) e mostra qual mistério está sendo meditado na dezena atual. Cada mistério tem o versículo bíblico que o narra, e tocar nele abre o Leitor da Bíblia direto na passagem. Um botão mostra ou oculta o texto completo das orações do Rosário para quem ainda não sabe de cor. Tudo funciona offline.

## Ligações

- [[Leitor da Bíblia]]
- [[Exame de Consciência]]
- [[Mapa de Funcionalidades]]
