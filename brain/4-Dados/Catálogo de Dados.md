---
tags: [dado]
atualizado: 2026-07-08
---
# Catálogo de Dados

Tabela mestre de tudo que vive em `src/data/`. O app é [[Decisão - App 100% offline]], então esses arquivos estáticos são a única fonte de conteúdo em tempo de execução. Contagens de julho de 2026.

## Tabela mestre

| Arquivo | O que guarda | Aprox. (jul/2026) | Quem consome |
|---|---|---|---|
| `articles/` (6 arquivos) | Artigos de apologética por categoria | 83 artigos | `ArticlesScreen`, `ArticleDetailScreen`, busca, plano de leitura |
| `articles-en.js` | Traduções EN dos artigos | 1 entrada por artigo traduzido | mesclado em `articles/index.js` |
| `articleCategories.js` | Ordem e ícone das categorias, ranking de populares | 6 categorias | `ArticlesScreen`, `CategoryArticlesScreen` |
| `articleRelations.js` | Mapa "Ver também" entre artigos | 1 lista por artigo | `RelatedArticles.jsx` |
| `references.js` | Versículos, Catecismo, documentos e teólogos citados | 205 referências | `ReferencesScreen`, `RefDetailScreen`, `ArticleDetailScreen`, busca |
| `references-en.js` | Traduções EN das referências | 1 entrada por referência | mesclado nas telas de referência |
| `referenceSources.js` | Metadados das fontes (ordem, ícone) | 5 fontes | `ReferencesScreen` |
| `bible.js` | Metadados dos 73 livros do cânon católico | 73 livros | `BibleScreen`, `bibleApi.js` |
| `bibleAveMaria.js` | Bíblia Ave Maria completa (PT) | 73 livros, aprox. 4,5 MB | `src/services/bibleApi.js` |
| `bibleDouayRheims.js` | Douay-Rheims-Challoner completa (EN) | 73 livros, aprox. 4,7 MB | `src/services/bibleApi.js` |
| `dailyVerses.js` | Versículos curados para o card do dia | 89 versículos | `VerseOfDayCard.jsx`, notificações, busca |
| `saints.js` | Calendário de santos fixos + festas móveis | 142 santos (131 fixos, 11 móveis) | `SaintTodayCard.jsx` |
| `quiz.js` | Bancos de perguntas do quiz | 200 questões MC (100 + 100 diárias) e 100 V/F | `QuizScreen.jsx` |
| `dialogues.js` | Objeções comuns com roteiro de resposta | 53 diálogos | `DialogueScreen.jsx`, `HomeScreen.jsx` |
| `glossary.js` | Glossário de termos teológicos | 26 termos | `GlossaryScreen.jsx`, `MarkdownText.jsx` |
| `debateStrategies.js` | Táticas de debate e falácias | 20 estratégias | `DebateStrategiesScreen.jsx` |
| `examConscience.js` | Exame de consciência pelos 10 Mandamentos | 9 blocos de questões | `ExamConscienceScreen.jsx` |
| `readingPlan.js` | Planos de leitura guiada | 2 trilhos (Fundamentos 30 dias e Aprofundamento) | `ReadingPlanScreen.jsx` |
| `jesusJourney.js` | Mapa da jornada de Jesus | 21 paradas | `BibleMapScreen.jsx` |

## Observações

- Quase tudo é bilíngue PT/EN, ou no próprio arquivo (campos `*En`) ou em arquivo irmão `-en.js`.
- Os dois arquivos da Bíblia são gerados por script, nunca editar na mão. Detalhes em [[Bíblia (dados)]] e [[Scripts da Pasta scripts]].
- Artigos e referências têm nota própria com a estrutura interna: [[Artigos e Referências (dados)]].

## Ligações

- [[Mapa de Conteúdo e Dados]]
- [[Leitor da Bíblia]], [[Artigos]], [[Referências]], [[Quiz da Fé]], [[Diálogos e Objeção do Dia]]
- [[Conteúdo do Dia]], [[Glossário]], [[Estratégias de Debate]], [[Plano de Leitura]], [[Exame de Consciência]], [[Mapa Bíblico]]
