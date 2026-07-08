---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Busca

Busca global do app: um só campo encontra artigos, referências e versículos populares, com tolerância a erros de digitação.

## Telas

- `src/screens/SearchScreen.jsx`

## Dados

- [[Catálogo de Dados]]
- Três índices em memória: artigos (`src/data/articles/`), referências (`src/data/references.js`) e os versículos curados de `src/data/dailyVerses.js`

## Serviços e utilitários

- Biblioteca Fuse.js para busca difusa, índices montados uma vez no módulo
- `src/utils/searchHistory.js` guarda o histórico recente em AsyncStorage (até 8 buscas, mínimo de 3 caracteres), ver [[Utilitários e Componentes]]

## Como funciona

Cada índice Fuse tem pesos por campo: nos artigos o título pesa mais que resumo e corpo, nas referências a sigla da passagem pesa mais que tópico e texto. O threshold de 0.35 com `ignoreLocation` corta matches absurdos sem exigir texto exato. Os resultados aparecem agrupados por tipo e cada um navega para o destino certo: artigo abre em `ArticleFromSearch`, referência abre em `RefDetail` e versículo abre a aba Bíblia no capítulo. Antes de digitar, a tela mostra o histórico recente, que o usuário pode limpar. Tudo roda offline porque os índices são construídos sobre os dados locais.

## Ligações

- [[Artigos]]
- [[Referências]]
- [[Leitor da Bíblia]]
- [[Navegação e Telas]]
