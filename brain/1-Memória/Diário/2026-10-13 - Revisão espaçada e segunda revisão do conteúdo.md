---
tags: [diario, gamificacao, conteudo]
data: 2026-10-13
---
# Revisão espaçada, fim do chute até acertar e segunda revisão do conteúdo

Continuação de [[2026-10-07 - Jornada gamificada e revisão dos 83 artigos]].

## O que o dono pediu

Na revisão do artefato, as fotos 06 e 07 eram iguais (a do teste rápido não
mostrava a primeira pergunta). Ele perguntou o que acontece quando a pessoa
erra (dá para trocar a resposta e ganhar pontos? a pergunta volta depois, como
no Duolingo?), o que querem dizer Catecúmeno e Neófito, disse que não conferiu
as lições e as correções e confia que estão certas, e pediu: corrija tudo,
aperfeiçoe tudo e publique.

## O que foi feito

- **Brechas de XP fechadas.** Refazer o teste pagava os acertos novos (errar,
  ver a certa, refazer). Agora só a primeira tentativa paga, e cada resposta
  dela é gravada na hora (`checkAnswer`), então sair do artigo e voltar não
  recomeça o teste valendo (achado da revisão de código). A pergunta do dia
  podia ser respondida de novo e o acerto repetido somava XP e sequência:
  agora a primeira resposta do dia fica, com a opção escolhida.
- **Revisão espaçada** (`src/utils/review.js`, tela `ReviewScreen`): errou
  (teste, previsão ou pergunta do dia), volta amanhã; acertou no teste, volta
  em 7 dias; acertos empurram para 3, 7, 16 e 35 dias; só etapa nova vale 5 XP.
  Contagem na Início e seção em Minha Jornada.
- **Opções embaralhadas** em toda pergunta: a resposta certa estava no meio em
  75 das 83 previsões e na segunda posição em 73 das 100 perguntas da prática.
- **Níveis com significado** (`LEVELS[].desc`), com as passagens conferidas
  nas Bíblias do app: catecúmeno (katēchein, Lucas 1,4), neófito ("plantado há
  pouco", 1 Timóteo 3,6), discípulo (mathētēs), apologista (1 Pedro 3,15),
  defensor da fé, mestre (2 Timóteo 2,2). Folha "O que os níveis querem dizer".
- **Segunda revisão do conteúdo**: sete revisores por tema, um do quiz e um
  das referências, cada um com validador que simula a aplicação e confere a
  sintaxe. 1.504 alterações, as 22 dúvidas da primeira rodada decididas (todas
  corrigidas), 106 referências novas, 37 entradas antigas corrigidas (Lanciano
  sem a falsa confirmação da OMS, Paulo VI santo, textos literais do Vaticano).
  Das 233 correções da primeira rodada, 169 estavam certas e 64 foram
  ajustadas. Quiz: 248 perguntas ajustadas, 3 novas no lugar das duplicadas,
  gabaritos errados corrigidos, zero travessões.
- **Bugs de código**: `dayOfYear` no horário de verão, fonte bíblica em inglês
  ("verse53-55").
- **Verificação**: roteiro do Playwright com 27 etapas que exigem o texto certo
  na tela; 108 fotos conferidas também a olho (a olho apareceram três falhas que
  a checagem automática não pegou).

## Decisões

- XP só na primeira tentativa e na revisão espaçada; a previsão continua
  valendo 5 XP mesmo errada (efeito de pré-teste).
- Perguntas de lição publicadas não se reordenam nem se removem (a revisão as
  guarda pelo índice).

## Pendências

- Teste num aparelho real.
- Bíblia Ave Maria com versículos faltando em alguns capítulos do Novo
  Testamento (ver [[Roteiro de Ideias (Roadmap)]]).
- Um revisor de conteúdo mandou por engano o e-mail do dono no cabeçalho
  User-Agent de uma consulta à Wikipédia; trocou depois por um genérico. Nos
  prompts seguintes ficou a regra de nunca mandar dado pessoal em requisição.
