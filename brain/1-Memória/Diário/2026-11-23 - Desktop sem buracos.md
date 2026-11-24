# 2026-11-23 - Desktop sem buracos

Pedido do Roberto: no computador o app ainda parecia espaçoso, com buracos (Início com a
coluna esquerda curta, Artigos centralizado com margens enormes e a rolagem só funcionando
com o mouse em cima da grade). Ele quer a tela preenchida, "imersiva".

## O que mudou
- `LAYOUT.pageMax` 1120 para 1600. `ui/Columns` agora reparte os blocos em quantas colunas
  couberem (`useColumnCount`, `spreadColumns` em `utils/layout.js`, com teste).
- Início em 3 colunas (o seu progresso | o dia | notícias); em janela média, 2.
- Artigos: a lista rola na largura toda (roda do mouse em qualquer ponto, barra na borda da
  janela), temas fixos à esquerda e a roda sobre eles também rola a grade. Até 4 colunas.
- Praticar: blocos de 3 por linha em cada seção. Bíblia: livros numa grade de até 6 colunas.
- Ajustes, Referências, Glossário, Debate, Diálogo, Busca, Meu Estudo, Plano, Quiz (menu),
  Exame, Perguntas que Expõem, Artigos por tema e Jornada em colunas ou grade; Rosário e Mapa
  em dois painéis; Liturgia em duas colunas.
- Botões do header nativo alinhados à borda da página (`chrome.js`).
- `capture-screens.mjs`: `HEIGHT` e `ALL=1`; os passos de categoria e artigo não usam mais a
  lista de temas que saiu da Início.

## Ficou como está
- Telas de leitura (artigo, capítulo, uma referência, pergunta e diálogo abertos) seguem em 720.
- Segmentos de Meu Estudo quebram linha a 390 (já era assim).
