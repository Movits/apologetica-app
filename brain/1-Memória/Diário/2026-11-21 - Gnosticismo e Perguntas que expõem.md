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

## 2026-11-22 · Reescrita a pedido do Roberto
- Crítica dele: os roteiros citavam a Bíblia para quem não aceita a Bíblia. Regra nova: argumentar a partir do que o outro aceita (lógica, os textos dele, dados verificados) e prever as saídas ("é verdade pra mim").
- Reescritos os roteiros da moral, do relativismo (com a autorrefutação da "verdade subjetiva" que o Roberto usou com um amigo), da gnose e da gnose racial. Naturalismo e reencarnação ganharam ajustes.
- Artigos 84 e 85 reescritos: Irineu II,1 (Pleroma com lado de fora), I,18 (cada mestre inventa algo novo), Plotino, Enéadas II,9, e a contradição espírito contra biologia. QI com dados conferidos na fonte: Neisser 1996, Dickens e Flynn 2006, Nisbett 2012 (Moore 1986, Eyferth), Wicherts 2010, STAT e Retraction Watch sobre Lynn, Sociedade Americana de Genética Humana 2018.
- Corrigido: a frase "duas pessoas do mesmo grupo podem diferir mais que de outro continente" (falsa com muitos marcadores).
