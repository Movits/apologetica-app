# 2026-11-21 · Gnosticismo e Perguntas que expõem

## O que foi feito
- Dois artigos novos em Outras Religiões, com lição da Jornada, tradução EN e referências:
  - **84 · Gnosticismo: o Demiurgo, Sophia e a Resposta Cristã** (mito do Pleroma, Sophia e Ialdabaoth, as três classes de Valentino, Nag Hammadi, resposta pela criação boa, Encarnação, ensino público, o mito que só empurra o mal para cima). Imagem: gravura do Ancião dos Dias, de Blake.
  - **85 · Gnose Racial: Quando a Heresia Vira Racismo** (a gnose antiga não fala de cor de pele, mas a lógica de salvação por natureza facilita o enxerto; ariosofia, Miguel Serrano e Nimrod de Rosario, virya e pasú; Atos 17,26, Mit brennender Sorge, Catecismo 1934-1935; genética de Lewontin e Rosenberg, efeito Flynn, dignidade que não vem do QI). Imagem: São Paulo Pregando em Atenas, de Rafael.
- 20 referências novas (Bíblia, Catecismo, Pio XI, Irineu, Apócrifo de João, Goodrick-Clarke, Lewontin, Rosenberg, Flynn). `check:refs` com 0 erros e dívida legada igual.
- Ferramenta nova **Perguntas que expõem** (Praticar > Treino): `src/data/questionPaths.js` (11 roteiros: moral subjetiva, aborto, deus imperfeito, gnose racial, relativismo, naturalismo, Sola Scriptura, Islã, Jesus mito, ressurreição como ilusão, reencarnação), `src/utils/questionPaths.js` (puro, testado), telas `QuestionPathsScreen` e `QuestionPathScreen` (rotas em sharedScreens), strings `qp.*`.

## Decisões
- A parte racial virou artigo próprio: ela tem raiz real (hitlerismo esotérico, Sabedoria Hiperbórea), não é só conexão do amigo do Roberto.
- Marcações dos roteiros ficam só no estado da tela, como no Exame de Consciência.

## Pendências
- `src/data/artImages.js` não foi regenerado para 84 e 85 (o script depende da API da Wikimedia, que estava limitando o container).
- Relações dos artigos 56 a 83 continuam pendentes.
