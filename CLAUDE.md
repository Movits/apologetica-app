# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
npm run web                    # abrir no navegador (react-native-web)
npm run lint                   # ESLint em src/
npm run check:refs             # valida os dados de referência (fonte, EN, urls)
npx expo export -p web         # gera dist/ (o que o deploy publica)
```

**Não há suíte de testes** (nem Jest, nem testes de nenhum tipo). `npm run lint` e
`npm run check:refs` são as únicas checagens determinísticas, então não procure
por `npm test`.

**Builds EAS** (`eas.json`: development / preview / production) só devem ser
disparados quando o usuário pedir explicitamente. Para revisar mudanças, prefira
commit + push (o site web é reconstruído sozinho, ver "Web e deploy").

Scripts de conversão de dados:
```bash
node scripts/convert-avemaria.mjs        # regera bibleAveMaria.js (fonte _avemaria_raw.json é gitignored; obter antes de rodar)
node scripts/convert-douay-rheims.mjs    # regera bibleDouayRheims.js (EN, fonte em scripts/source/)
node scripts/sync-bible-refs.mjs         # sincroniza referências bíblicas
node scripts/generate-icons.mjs          # gera ícones do app
node scripts/merge-accounts.mjs          # admin: junta dados de duas contas (precisa .secrets/)
node scripts/generate-brain.mjs          # regera o grafo de conteúdo do vault (brain/4-Conteúdo)
```

## Architecture

**React Native + Expo SDK 54** com 5 tabs no bottom navigator. **Tudo funciona offline** — sem chamadas de rede em tempo de execução (exceto auth Firebase, liturgia e notícias, que têm fallback).

O mesmo código roda em **Android, iOS e web** (react-native-web). Toda mudança
precisa continuar funcionando nas três plataformas.

### Arquivos por plataforma (importante)
O Metro escolhe a variante automaticamente pelo sufixo do arquivo, e o import no
código nunca traz o sufixo (`import { initSentry } from './src/sentry'`). Ao mexer
num desses módulos, **atualize as duas variantes**:

| Base | Variante web/nativa |
|---|---|
| `src/sentry.js` | `src/sentry.web.js` (no-op) |
| `src/services/notifications.js` | `src/services/notifications.web.js` (no-op) |
| `src/hooks/useGoogleSignIn.js` | `src/hooks/useGoogleSignIn.web.js` |
| `src/utils/shareAsImage.js` | `src/utils/shareAsImage.web.js` |
| `src/components/StickySectionList.jsx` | `StickySectionList.web.jsx` |
| `src/screens/bibleMap/MapView.native.jsx` | `MapView.web.jsx` |

### Navegação
O app usa quatro stacks internos dentro dos tabs (tab bar permanece visível):

- **HomeStack** (`HomeStackScreen`): HomeMain → References, Tools, Today, Notebook, NotebookPage, CategoryArticles, Favorites, Glossary, ReadingPlan, Rosary, ExamConscience, Highlights, Notes, Search, Liturgy, ArticleFromSearch, RefDetail, Quiz, Dialogue, DebateStrategies, BibleMap, Legal.
- **ToolsStack** (`ToolsStackScreen`): ToolsMain → mesmas telas secundárias (Today, Notebook, Quiz, Dialogue, DebateStrategies, BibleMap etc.).
- **SettingsStack** (`SettingsStackScreen`): SettingsMain → Legal, Glossary, ReadingPlan, Rosary, ExamConscience, Favorites, ArticleFromSearch, RefDetail.
- **ArticlesStack** (`ArticlesStackScreen`): ArticlesList → ArticleDetail → RefDetail.
- **MainStack** (raiz): MainTabs + NoteEditor (modal full-screen sem tab bar).
- **AuthStack**: Login, Signup, ForgotPassword.
- **OnboardingScreen**: exibido antes das tabs enquanto deslogado.
- Rotas `ArticleFromSearch`/`RefDetail` são duplicadas de propósito nos stacks para o tap resolver dentro da aba ativa.
- **Os nomes das tabs são strings em português e fazem parte da API de navegação**: `'Início'`, `'Artigos'`, `'Bíblia'`, `'Ferramentas'`, `'Ajustes'`. É por isso que existe `navigate('Bíblia', ...)`. O label visível vem do `LABELS`/`ICONS` em `App.js` via `t('tab.*')`. Renomear a rota quebra todos os deep links; para traduzir, mexa só no label.
- `Tab.Navigator` usa `backBehavior="history"`, então o botão voltar percorre o histórico entre abas, não a ordem das abas.

### Estado global (`src/context/`)
Ordem dos providers em `App.js` (de fora pra dentro): `Language → Theme → Auth →
AccountPrompt`. Isso importa: `AuthContext` está **acima** do `LanguageContext`,
então não pode usar `useLanguage()`. Ele mantém o idioma por uma cache própria que
o `LanguageContext` alimenta chamando `setAuthLanguage(lang)` — se mexer em idioma,
mantenha esses dois em sincronia.

- `ThemeContext` — `colors` (light/dark), `darkMode`, `fontSize`, `fs(n)` (escala). Persistido em AsyncStorage.
  - `primary` = cor de fundo principal, `primaryText` = texto enfatizado.
- `AuthContext` — estado de autenticação Firebase (`user`, `signedInOrGuest`, `loading`) + modo visitante persistido. Traduz os códigos de erro do Firebase para PT/EN.
- `LanguageContext` — `t(key)`, `lang`, `setLang`, `isEn`/`isPt`, `hydrated`. Também exporta o atalho `useT()`.

### i18n (`src/i18n/strings.js`)
- Estrutura `STRINGS[lang][key]`, chaves em `dot.case` (`'header.quiz'`, `'tab.bible'`).
- Chave ausente em EN cai automaticamente pro PT. Ao adicionar uma string, **adicione nos dois idiomas**.
- Conteúdo (artigos e referências) NÃO passa por aqui: usa `articles-en.js` / `references-en.js`.
- Na web, a escolha de idioma feita na landing vive em `localStorage['appg_lang']` e tem prioridade sobre o AsyncStorage.

### Bíblia: 100% offline (Ave Maria + Douay-Rheims)
`src/services/bibleApi.js` — `getChapter(bookId, chapter, language?)` síncrono.
- `language='pt'` → Ave Maria (`src/data/bibleAveMaria.js`, ~4 MB)
- `language='en'` → Douay-Rheims-Challoner (`src/data/bibleDouayRheims.js`, ~4.5 MB). Fallback automático para PT se EN indisponível.

### Navegação entre telas
- Artigo → tap em referência → `navigate('RefDetail', { highlightId })` (tela dedicada de uma referência).
- Referências/RefDetail → "Ler no app" (refs com `bibleNav`) → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen`: deep link via `route.params`, prev/next dentro da tela de versículos.

### Dados (estáticos em `src/data/`)
- `articles/` — artigos divididos por categoria (existencia-deus, igreja-catolica, sagrada-escritura, moral, outras-religioes, historia-igreja). `articles/index.js` mescla tudo e aplica traduções EN. Cada artigo: `{ id (numérico, único no app inteiro), title, category, image (require local), imageAlt, imageCredit, imageAspect, imageHd (URL), summary, body (Markdown), references: [ids] }`.
- `articles-en.js` — traduções em inglês dos artigos (`{ [id]: { titleEn, summaryEn, bodyEn } }`).
- `articleRelations.js` — relações entre artigos para "Artigos relacionados".
- `references.js` — versículos/Catecismo/documentos, com `id` em kebab-case (`'mt-16-18'`, `'cic-309'`). Refs bíblicas têm `bibleNav: { bookId, chapter, verse, verseEnd? }`; as não-bíblicas têm `url` para a fonte oficial. `originalLanguage` (opcional) traz palavra no original, transliteração, Strong's e significado. `citation` (opcional) traz os dados bibliográficos de um paper de forma estruturada e neutra de idioma (`{ kind, container, volume, pages, doi, arxiv, ... }`), e `media` (opcional) a ficha de uma foto ou vídeo histórico (`{ type, publishedIn, archive, license, viewUrl }`). O app não exibe a imagem: mídia é referência textual com link para o acervo.
- `references-en.js` — traduções EN das referências (`{ [id]: { textEn, topicEn, ... } }`).
- `referenceSources.js` — as 7 categorias de fonte (Bíblia, Catecismo, Documentos, Teólogos, Ciência, Mídia, Outros) mais `translateSource` e `SOURCE_IDS`. **Uma referência com `source` fora dessa lista não aparece em lugar nenhum da tela, sem erro nem warning**, e é para isso que existe `npm run check:refs`.
- `articleCategories.js` — categorias, ranking e "mais buscados" dos artigos.
- `bible.js` — metadados dos 73 livros (id, apiId, name, short, testament, group, totalChapters, deutero).
- `bibleAveMaria.js` — Bíblia Ave Maria completa. Formato: `{ bookId: [[v1,v2,...], ...] }`.
- `bibleDouayRheims.js` — Douay-Rheims-Challoner (EN). Mesmo formato.
- `dailyVerses.js` — versículos do dia.
- `saints.js` — santos do dia.
- `glossary.js` — glossário apologético.
- `quiz.js` — questões para o quiz de fé.
- `dialogues.js` — diálogos apologéticos.
- `examConscience.js` — exame de consciência.
- `readingPlan.js` — plano de leitura em dois trilhos (Fundamentos + Aprofundamento).
- `jesusJourney.js` — mapa da jornada de Jesus (21 paradas, usado pelo BibleMapScreen).
- `debateStrategies.js` — táticas de debate e falácias.

### Serviços (`src/services/`)
- **Únicos serviços que usam rede**: `liturgyApi.js` (liturgia do dia, com cache e fallback offline) e `newsApi.js` (notícias católicas via RSS, cache de 3h por idioma). Todo o resto é local.
- `userData.js` cobre marcações, notas e caderno. **Favoritos NÃO estão aqui**, ver abaixo.

### Firebase e dados do usuário
- `src/services/firebase.js` — projeto `appologetica7`. As chaves do client são públicas por design; a segurança está em `firestore.rules` (raiz do repo). A persistência do auth muda por plataforma: IndexedDB/localStorage na web (com `popupRedirectResolver`, senão `signInWithPopup` quebra), AsyncStorage no nativo.
- `src/services/userData.js` — tudo fica sob `users/{uid}/…`, em três coleções:
  - `highlights` — `{ bookId, chapter, verse, color, createdAt }` (um doc por versículo).
  - `notes` — `{ bookId, chapter, verseStart, verseEnd, text, createdAt, updatedAt }`.
  - `notebook` — `{ title, text, ... }` (páginas do caderno).
  - As funções `watch*` retornam `onSnapshot` em tempo real e devolvem o `unsubscribe`; sempre chame no cleanup do `useEffect`.
- Favoritos e progresso de leitura NÃO estão no Firestore: são locais, em AsyncStorage (`src/utils/favorites.js`, `readingProgress.js`, `lastRead.js`, `bibleProgress.js`). É de propósito: progresso muda a cada scroll, precisa valer no modo visitante e não vale uma escrita de rede.
  - `readingProgress.js` e `lastRead.js` são de **artigos** (marcados como lidos, plano de leitura, último artigo aberto); `bibleProgress.js` é da **Bíblia** (capítulos lidos por livro e o ponto onde parou). São arquivos diferentes com nomes parecidos.
- Modo visitante é suportado em todo o app: código que toca Firestore precisa tolerar `auth.currentUser === null` (as `watch*` já devolvem lista vazia).
- Ao mudar a forma dos dados, revise `firestore.rules` junto.

### Sentry
`src/sentry.js` expõe `initSentry()`, `wrap(App)` e `captureException(err)`. Só
roda em build standalone: no Expo Go é desligado (módulo nativo ausente) e na web
`sentry.web.js` é no-op. Não importe `@sentry/react-native` direto em outro
arquivo, senão o pacote nativo vaza pro bundle web.

### Web e deploy
- Push em `master` que toque `src/`, `assets/`, `docs/`, `fotos/`, `App.js`, `app.json`, `app.config.js` ou `package*.json` dispara `.github/workflows/deploy-web.yml`, que roda `npx expo export -p web` e publica no GitHub Pages.
- O site montado é: `docs/*.html` na raiz (landing, privacidade, termos, doação) + `fotos/` + o app web exportado em `/app`.
- `app.config.js` injeta `experiments.baseUrl` a partir da env `PAGES_BASE_URL` (`/apologetica-app/app`) só no build do workflow. Em dev local, sem a env, o app serve na raiz.
- `dist/` é gerado e gitignored.

### Convenções de conteúdo
- **Sem travessões (—)**.
- **Evitar ponto e vírgula (;)** no corpo dos artigos: usar vírgula ou ponto final, que soa mais natural e menos "AI-like".
- **Linguagem natural** em português, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.
- **Referências batem com o texto**: todo versículo citado de forma central no corpo deve ter uma entrada correspondente em `references`; não deixar refs que não são citadas.

### Pastas do usuário (não código)
- `documentos/` — pesquisas e anotações do usuário (mercado, público, top100, créditos de imagens, previews antigos). Nada referencia no código.
- `fotos/` — imagens do site adicionadas pelo usuário. `fotos/sao-miguel.jpg` é o fundo do hero da landing (`docs/index.html`); o deploy copia a pasta inteira pro site. Fallback remoto se o arquivo faltar.
- `brain/` — second brain do projeto (vault do Obsidian, versionado), em 4 áreas: `1-Memória` (diário de sessões, aprendizados, backlog vivo), `2-Projeto` (decisões, convenções, pesquisas, site), `3-App` (arquitetura e funcionalidades), `4-Conteúdo` (catálogo + grafo gerado por `scripts/generate-brain.mjs`; as subpastas "... do App" e "Termos do Glossário" não se editam à mão). `brain/.obsidian/` fica fora do git.
  - **Ritual de memória**: ao concluir uma sessão de trabalho significativa, criar `brain/1-Memória/Diário/AAAA-MM-DD - resumo.md` (o que foi feito, decisões, pendências) e acrescentar lições permanentes em `brain/1-Memória/Aprendizados.md`. Ao retomar trabalho, ler a entrada mais recente do Diário.
- `GUIA-DO-PROJETO.md` — mapa da raiz em linguagem leiga; manter atualizado ao criar/mover pastas.

Cores: as paletas `LIGHT`/`DARK` completas estão em `src/context/ThemeContext.jsx`.
Ícones via `@expo/vector-icons` (Ionicons).

## Fluxo de revisão e verificação

Antes de dar uma mudança como concluída, siga este fluxo leve. Ele substitui, de
forma adaptada ao app (JS/RN), a ideia de "agentes para verificar e aperfeiçoar o
código": a verificação determinística aqui é o lint e o build, não scripts Python.

**1. Lint (verificação determinística):**
```bash
npm run lint          # ESLint em src/ — precisa passar antes de commitar
npm run check:refs    # obrigatório ao mexer em references.js ou references-en.js
```
Baseline atual: **0 erros e 14 warnings** (todos `react-hooks/exhaustive-deps`,
pré-existentes). O que não pode subir é erro, e sua mudança não deve aumentar a
contagem de warnings.

`npm run check:refs` precisa terminar com 0 erros. Ele também imprime a dívida
legada (hoje: 44 refs não bíblicas sem url, 75 sem tradução EN, 17 apontando para
a Wikipédia). Esses números **só podem cair**.

**2. Revisão por agente — para mudanças não triviais (lógica, navegação, telas):**
- `/code-review` — revisa o diff atual em busca de bugs de correção.
- `/simplify` — limpa duplicação e simplifica o que foi alterado (só qualidade, não bugs).
- `/security-review` — quando a mudança toca auth, Firebase ou dados do usuário.

**3. Verificação de comportamento — quando a mudança é visível ao usuário:**
- `/run` — sobe o app e confirma que a alteração funciona de verdade, não só que compila.

**Regras práticas:**
- Mudança só de conteúdo (texto de artigo, referência, tradução em `strings.js`):
  basta o lint. Não precisa de review nem build.
- Mudança em tela, navegação, contexto ou serviço: lint + `/code-review`, e `/run`
  se houver impacto visual.
- Nunca dar como "pronto e testado" o que só compilou — diga o que foi de fato
  verificado e o que ficou de fora.
