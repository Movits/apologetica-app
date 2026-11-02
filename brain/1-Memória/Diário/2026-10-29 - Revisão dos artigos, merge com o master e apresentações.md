---
tags: [diario, conteudo, referencias, apresentacoes]
data: 2026-10-29
---
# Revisão dos artigos, merge com a revisão do master e apresentações para vídeo

Começou em 28/10 e terminou em 29/10. Depois de
[[2026-10-13 - Revisão espaçada e segunda revisão do conteúdo]].

## O que o dono pediu

Revisar todos os artigos: se estão didáticos, se a informação está correta, se
os argumentos convencem, se as referências batem com o texto e se os links e
dados delas são reais. Depois, criar apresentações bonitas, personalizáveis e
animadas sobre os temas, num repositório novo, para gravar vídeos (YouTube,
TikTok, Instagram) no estilo do canal Jesus and Whatnot: a referência, o texto
citado e um visual na tela enquanto ele narra.

Decisões dele: erro claro entra direto, mudança de argumento vai para
aprovação; só deck HTML no navegador; 16:9; repositório público com site.

## O que foi feito

- **Revisão em lotes** (seis de artigos, três de referências), cada achado
  conferido por um verificador adversarial na fonte primária. 526 erros claros
  aplicados, 123 propostas de argumento para o dono decidir, 4 descartados.
  Checagens determinísticas: texto bíblico contra a Ave Maria e a
  Douay-Rheims, todos os links abertos, refs listadas x citadas.
- **O master tinha recebido outra revisão do mesmo conteúdo** (duas rodadas,
  106 refs novas) mais as lições da Jornada, em outra sessão. O PR ficou com
  conflito em 430 blocos. Solução: o texto do master como base e esta revisão
  reaplicada por cima. 613 trocas entraram limpas, 143 já estavam iguais, e os
  286 achados que caíam em trechos reescritos foram adjudicados um a um
  (124 o master já resolvia, 160 viraram patch novo sobre o texto dele, 1
  descartado), cada decisão com verificador. Depois, uma passada de coerência
  nos 83 artigos corrigiu 119 sobras do merge: lições que repetiam o que o
  artigo corrigiu, pontos ditos duas vezes, refs da lista, citações não
  literais nos diálogos e no quiz.
- **Código**: tradutores de fullSource, ano e autor no EN; RefDetail abrindo o
  Catecismo em português no app em inglês; Jó e Jonas (o master fez o mesmo
  conserto). Links do papalencyclicals.net, que recusa conexão do Brasil,
  trocados por New Advent, Hanover College, UNED e vatican.va.
- **Dívida do check:refs**: 16 sem url, 0 sem EN, 1 na Wikipédia (o master
  estava em 40, 56 e 15). Lint 0, testes 191/191.
- **Relatório** como Artifact, com aprovar/recusar por proposta (as decisões
  ficam na base de dados do artifact): 113 propostas a decidir, readaptadas ao
  texto mesclado; as que o master já resolveu foram para "Descartadas".
- **Apresentações**: repositório novo
  [Movits/apologetica-apresentacoes](https://github.com/Movits/apologetica-apresentacoes),
  site em https://movits.github.io/apologetica-apresentacoes/. Motor em
  HTML/CSS/JS puro (palco 1920×1080, 12 tipos de slide, quatro temas, janela do
  apresentador, modo gravação, painel de personalização) e cinco decks:
  Papado (19), Eucaristia (7), Ressurreição (5), Jesus histórico (35) e cânon
  de 73 livros (18), com roteiro de narração por passo e textos citados direto
  das refs do app. Conferidos slide a slide no navegador, local e publicado.

## Pendências

- PR [Movits/apologetica-app#7](https://github.com/Movits/apologetica-app/pull/7)
  aguardando o OK do dono para o merge (o merge publica o site).
- O dono decide as 113 propostas no relatório; depois aplicar as aprovadas.
- `dialogues.js` ainda tem 34 travessões, herdados do master (fora do escopo
  desta revisão).
- As 144 observações sem patch da passada de coerência (sugestões, não erros)
  ficaram fora; vale olhar numa próxima rodada.
- Para gravar: as obras vindas do app têm 1000 px; para tela cheia, salvar a
  versão grande (imageHd) em `assets/art/` do repositório das apresentações.
