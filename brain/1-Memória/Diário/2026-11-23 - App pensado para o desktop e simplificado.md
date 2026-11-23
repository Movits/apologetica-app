# 2026-11-23 - App pensado para o desktop e simplificado

Pedido do Roberto: o site parecia feito só para celular (tudo numa coluna de 720 no meio,
bordas vazias) e os filtros de tema da aba Artigos eram feios e não rolavam com o mouse
(só clicando no último chip). Pediu uma análise do app inteiro, aberto a remover coisas.

## Decisões (dele)
- Desktop com **barra lateral** fixa (a partir de 1024 px), celular mantém a barra embaixo.
- Artigos no desktop: **temas à esquerda e grade de cartões**.
- Simplificar tudo que estava duplicado, entregue em três fases (commits separados).

## O que foi feito
1. **Base do desktop**: `src/utils/layout.js` + `useLayout()` (faixas barra, cápsula, lateral).
   Telas centram pela área ao lado da lateral. Praticar e os livros da Bíblia em duas colunas
   (`ui/Columns`). `ChipRow` rola com roda e arrasto do mouse e mostra setas; `Chip` discreto,
   sem ícone. Hover e cursor de mão em Row/PressScale. Imagem do artigo até 45% da janela.
2. **Artigos**: lista de temas com contagem + grade de `ArticleCard` (16:9) no desktop.
3. **Simplificação**: "Dia de Hoje" entrou na Início (versículo, estação, santo, liturgia,
   notícias) e a tela saiu; Início perdeu "Temas" (a aba Artigos faz isso) e "Bíblia" (é aba);
   Praticar perdeu Jornada, Dia de Hoje e "Perguntas que expõem" (agora dentro do Modo
   Diálogo); favoritos, marcações, notas e caderno viraram **Meu Estudo** (segmentos);
   Glossário e Mapa foram para "Consulta"; Revisão aparece na Início quando há vencidas.

## Verificação
- lint 0/0, `npm test` 218 pass, `verify-journey` e `verify-bible` sem falhas no dev server.
- Fotos à mão em 1440, 1100, 900 e 390.
- Scripts: `verify-journey` aceitava só LF (no Windows o checkout vem CRLF) e esperava 83
  lições; agora conta pelos artigos. `capture-screens` e `verify-bible` seguem a Início nova.

## Pendências
- Conferir no celular (Expo Go) que nada mudou no nativo.
- `CategoryArticles` continua lista (só a Jornada abre); grade lá se ele quiser.
- Strings antigas sem uso (`home.card.today*`, `home.section.topics`...) ficaram.
