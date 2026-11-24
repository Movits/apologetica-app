# 2026-11-23 - Site mais leve e rápido

Pedido do Roberto: o site parecia lento. Medido no site publicado (desktop rápido e CPU 4x
mais lenta, como celular médio) e corrigido em quatro frentes.

## Causas e correções
1. **Imagens**: a aba Artigos baixava as 85 imagens inteiras (14,2 MB) para capas de 72 px e
   cartões de ~280 px. Agora há miniaturas de 480 px (`assets/articles/thumbs`, geradas por
   `scripts/generate-article-thumbs.mjs`, 3,7 MB no total) e a lista monta só ~5 telas
   (`LIST_WINDOW`). Abrir a aba: 1,5 MB no desktop, 0,8 MB no celular.
2. **Notícias**: na web, cada notícia sem foto no feed era raspada por até 4 serviços de
   terceiros (microlink, jina, allorigins, codetabs), com recusas 429 e o link enviado a eles.
   Isso saiu: na web, notícia sem foto no feed fica sem foto. Miniatura pelo wsrv em 168 px
   (era 1000).
3. **Script principal**: 6,4 MB para 5,7 MB. As traduções em inglês (articles-en e
   references-en, ~680 KB) viraram pedaços baixados só quando o idioma é inglês
   (`src/data/english.js`). Os maiores pesos que sobram: reanimated (750 KB), dados em PT
   (referências, quiz, lições) e Firestore.
4. **Troca de aba**: Artigos e Início re-renderizavam tudo a cada visita porque a releitura
   do "lido" e do "último artigo" criava objetos novos; agora mantêm o estado se nada mudou
   (`src/utils/sets.js`). Abas com `freezeOnBlur`. Em CPU 4x: Artigos ~1000 para ~750 ms,
   Bíblia ~500 para ~370 ms (medição ruidosa).

## Verificação
lint 0, `npm test` 223 pass, check:refs 0 erros, verify-journey e verify-bible sem falhas no
build exportado, inglês conferido (troca, busca, referências, recarregar).

## Pendências
- Troca de aba ainda ~350 ms em celular médio: custo da navegação (stack JS na web).
- Script ainda grande: dividir dados PT por tela seria o próximo passo, com mais risco.
