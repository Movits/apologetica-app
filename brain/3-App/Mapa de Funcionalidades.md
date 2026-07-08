---
tags: [mapa]
atualizado: 2026-07-08
---
# Mapa de Funcionalidades

Tudo que o usuário vê e usa no app, agrupado por propósito. São 16 funcionalidades (julho de 2026), cada uma com nota própria em `brain/3-Funcionalidades/`.

## Conteúdo

- [[Artigos]]: o coração do app, aprox. 83 artigos de apologética em 6 categorias.
- [[Referências]]: catálogo de aprox. 205 fontes citadas (Bíblia, Catecismo, documentos, teólogos).
- [[Glossário]]: termos teológicos explicados, com links automáticos dentro dos artigos.
- [[Estratégias de Debate]]: táticas de conversa e falácias comuns para debater com caridade.

## Oração e prática

- [[Leitor da Bíblia]]: as duas Bíblias completas offline (Ave Maria e Douay-Rheims) com destaques e notas.
- [[Santo Terço]]: terço guiado passo a passo com os mistérios do dia.
- [[Exame de Consciência]]: preparação para a confissão pelos 10 Mandamentos.
- [[Plano de Leitura]]: trilhas guiadas de leitura com progresso salvo.
- [[Conteúdo do Dia]]: versículo, santo, liturgia e notícias do dia em cards.

## Treino

- [[Quiz da Fé]]: aprox. 200 questões de múltipla escolha mais 100 de verdadeiro ou falso.
- [[Diálogos e Objeção do Dia]]: aprox. 53 objeções comuns com roteiro de resposta em formato de conversa.

## Pessoal

- [[Caderno, Notas e Favoritos]]: caderno livre, notas por versículo, destaques e artigos favoritos.
- [[Busca]]: busca unificada em artigos, referências, Bíblia e glossário.

## Transversais

- [[Leitura em Voz Alta (TTS)]]: narração de artigos e capítulos da Bíblia.
- [[Compartilhamento]]: compartilhar versículos e trechos como texto ou imagem.
- [[Mapa Bíblico]]: mapa interativo das terras bíblicas e da jornada de Jesus.

## Tabela tela por funcionalidade

Todas as telas de `src/screens/` (julho de 2026). A pasta `src/screens/bibleMap/` contém apenas arquivos de apoio do mapa (`MapView.native.jsx`, `MapView.web.jsx`, `mapHtml.js`), não telas.

| Tela | Funcionalidade |
| --- | --- |
| `ArticlesScreen.jsx` | [[Artigos]] |
| `CategoryArticlesScreen.jsx` | [[Artigos]] |
| `ArticleDetailScreen.jsx` | [[Artigos]] |
| `ReferencesScreen.jsx` | [[Referências]] |
| `RefDetailScreen.jsx` | [[Referências]] |
| `GlossaryScreen.jsx` | [[Glossário]] |
| `DebateStrategiesScreen.jsx` | [[Estratégias de Debate]] |
| `BibleScreen.jsx` | [[Leitor da Bíblia]] |
| `RosaryScreen.jsx` | [[Santo Terço]] |
| `ExamConscienceScreen.jsx` | [[Exame de Consciência]] |
| `ReadingPlanScreen.jsx` | [[Plano de Leitura]] |
| `TodayScreen.jsx` | [[Conteúdo do Dia]] |
| `LiturgyScreen.jsx` | [[Conteúdo do Dia]] |
| `QuizScreen.jsx` | [[Quiz da Fé]] |
| `DialogueScreen.jsx` | [[Diálogos e Objeção do Dia]] |
| `HomeScreen.jsx` | hub da aba Início, hospeda o card de [[Diálogos e Objeção do Dia]] |
| `NotebookScreen.jsx` | [[Caderno, Notas e Favoritos]] |
| `NotebookPageScreen.jsx` | [[Caderno, Notas e Favoritos]] |
| `NotesScreen.jsx` | [[Caderno, Notas e Favoritos]] |
| `NoteEditorScreen.jsx` | [[Caderno, Notas e Favoritos]] |
| `HighlightsScreen.jsx` | [[Caderno, Notas e Favoritos]] |
| `FavoritesScreen.jsx` | [[Caderno, Notas e Favoritos]] |
| `SearchScreen.jsx` | [[Busca]] |
| `BibleMapScreen.jsx` | [[Mapa Bíblico]] |
| `ToolsScreen.jsx` | hub da aba Ferramentas, ver [[Navegação e Telas]] |
| `SettingsScreen.jsx` | ajustes de tema, fonte, idioma e conta, ver [[Estado Global e Tema]] |
| `LegalScreen.jsx` | privacidade e termos embarcados, sub-tela de Ajustes, ver [[Navegação e Telas]] |
| `OnboardingScreen.jsx` | [[Contas e Sincronização]] |
| `auth/LoginScreen.jsx` | [[Contas e Sincronização]] |
| `auth/SignupScreen.jsx` | [[Contas e Sincronização]] |
| `auth/ForgotPasswordScreen.jsx` | [[Contas e Sincronização]] |
