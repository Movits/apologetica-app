# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npx expo start --tunnel        # quando o Wi-Fi bloqueia a conexão direta
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
npm run web                    # abrir no navegador
npm run lint                   # ESLint em src/ — precisa passar antes de commitar
npx expo export -p web         # build de verificação (mesmo comando do deploy)
```

**Não há suíte de testes.** A verificação determinística do projeto é o par
`npm run lint` + `npx expo export -p web`. Toda remoção de código precisa dos
dois verdes, mais um grep individual por símbolo removido.

Scripts de conversão de dados (Node puro, fora do app):
```bash
node scripts/convert-avemaria.mjs        # regera bibleAveMaria.js (fonte _avemaria_raw.json é gitignored; obter antes de rodar)
node scripts/convert-douay-rheims.mjs    # regera bibleDouayRheims.js (EN, fonte em scripts/source/)
node scripts/sync-bible-refs.mjs         # sincroniza referências bíblicas
node scripts/generate-icons.mjs          # gera ícones do app
node scripts/merge-accounts.mjs          # admin: junta dados de duas contas (precisa .secrets/)
node scripts/generate-brain.mjs          # regera o grafo de conteúdo do vault (brain/4-Conteúdo)
```
Os arquivos de artigos usam `require()` de imagens (resolvido pelo Metro, não
pelo Node). Qualquer script que importe `src/data/articles/` precisa neutralizar
o `require` antes — ver como `generate-brain.mjs` faz.

Build de loja via EAS (`eas.json`): perfis `development` (dev client),
`preview` (APK interno) e `production` (autoIncrement, `appVersionSource: remote`).

## Architecture

**React Native + Expo SDK 54**, React 19, com 5 tabs no bottom navigator.
**Tudo funciona offline** — o conteúdo é estático em `src/data/`. As únicas
chamadas de rede são Firebase (auth/Firestore), liturgia do dia e notícias RSS,
todas com fallback.

### Tabs
1. **Início** — `HomeScreen` (com HomeStack interno para telas secundárias)
2. **Artigos** — `ArticlesScreen` (com ArticlesStack: lista → detalhe)
3. **Bíblia** — `BibleScreen` — 73 livros Ave Maria (PT) + Douay-Rheims (EN), navegação prev/next entre capítulos
4. **Ferramentas** — `ToolsScreen` (com ToolsStack: menu de todas as ferramentas)
5. **Ajustes** — `SettingsScreen` (com SettingsStack)

### Navegação
Toda a árvore vive em `App.js`. O app usa quatro stacks internos dentro dos tabs
(tab bar permanece visível):

- **HomeStack** (`HomeStackScreen`): HomeMain → References, Tools, Today, Notebook, NotebookPage, CategoryArticles, Favorites, Glossary, ReadingPlan, Rosary, ExamConscience, Highlights, Notes, Search, Liturgy, ArticleFromSearch, RefDetail, Quiz, Dialogue, DebateStrategies, BibleMap, Legal.
- **ToolsStack** (`ToolsStackScreen`): ToolsMain → mesmas telas secundárias (Today, Notebook, Quiz, Dialogue, DebateStrategies, BibleMap etc.).
- **SettingsStack** (`SettingsStackScreen`): SettingsMain → Legal, Glossary, ReadingPlan, Rosary, ExamConscience, Favorites, ArticleFromSearch, RefDetail.
- **ArticlesStack** (`ArticlesStackScreen`): ArticlesList → ArticleDetail → RefDetail.
- **MainStack** (raiz): MainTabs + NoteEditor (modal full-screen sem tab bar).
- **AuthStack**: Login, Signup, ForgotPassword.
- **OnboardingScreen**: exibido antes das tabs enquanto deslogado.
- Rotas `ArticleFromSearch`/`RefDetail` são duplicadas de propósito nos stacks para o tap resolver dentro da aba ativa.

**Deep links** (`LINKING` em `App.js`, só nativo — `undefined` na web):
prefixos `appologetica://` e `https://movits.github.io/apologetica-app`.
Rotas: `artigo/:articleId`, `referencia/:highlightId`, `dialogo/:dialogueId`,
`biblia/:bookId/:chapter`. `articleId` e `chapter` são convertidos para número
no `parse` porque as telas comparam com `===`.

### Estado global (Contexts)
Ordem dos providers importa: `ThemeProvider` → `AuthProvider` → `LanguageProvider`.

- `ThemeContext` — `colors` (light/dark), `darkMode`, `fontSize`, `fs(n)` (escala). Persistido em AsyncStorage.
  - `primary` = cor de fundo principal, `primaryText` = texto enfatizado.
  - `colors.mode` só existe no tema escuro: para saber o tema use `darkMode`, nunca `colors.mode`.
- `AuthContext` — Firebase Auth + **modo visitante**. `signedInOrGuest` (logado OU visitante) é o que libera as tabs; `guest` é persistido em AsyncStorage e some ao logar. Também expõe `deleteAccount()`, que apaga Firestore + mirrors locais + a conta (exigência das lojas/LGPD).
- `LanguageContext` — `t(key)` para PT/EN.

`AuthContext` fica **acima** de `LanguageContext` na árvore, então não pode usar
`useLanguage()`. A ponte é `setAuthLanguage(lang)`, exportada pelo AuthContext e
chamada pelo LanguageContext para manter em cache o idioma das mensagens de erro
do Firebase.

### i18n (`src/i18n/strings.js`)
`STRINGS[lang][key]`, chaves em dot.case (`'screen.element'`). Chave ausente em
EN cai para PT automaticamente. **Cuidado ao limpar chaves**: prefixos dinâmicos
(`category.*`, `source.*`, `plan.track.*`) são montados em runtime e não aparecem
num grep pela chave completa. Na web, a escolha de idioma feita na landing fica
em `localStorage.appg_lang` (mesmo domínio) e tem prioridade sobre o AsyncStorage.

### Arquivos por plataforma (`.web.js` / `.web.jsx`)
O Metro resolve automaticamente a variante web quando existe. Ao mexer num
desses módulos, mexa nos dois lados:
`sentry.js` / `sentry.web.js`, `services/notifications.js` (web é no-op),
`hooks/useGoogleSignIn.js` (web usa `signInWithPopup`),
`utils/shareAsImage.js` (web sem `react-native-view-shot`),
`components/StickySectionList.jsx`.

### Bíblia: 100% offline (Ave Maria + Douay-Rheims)
`src/services/bibleApi.js` — `getChapter(bookId, chapter, language?)` síncrono.
- `language='pt'` → Ave Maria (`src/data/bibleAveMaria.js`, ~4 MB)
- `language='en'` → Douay-Rheims-Challoner (`src/data/bibleDouayRheims.js`, ~4.5 MB). Fallback automático para PT se EN indisponível.

**A aba Bíblia nunca desmonta** ao trocar de aba. Limpeza por unmount não roda:
use o evento `blur` da navegação (foi a causa de um bug de TTS fantasma).

### Navegação entre telas
- Artigo → tap em referência → `navigate('RefDetail', { highlightId })` (tela dedicada de uma referência).
- Referências/RefDetail → "Ler no app" (refs com `bibleNav`) → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen`: deep link via `route.params`, prev/next dentro da tela de versículos.

### Dados (estáticos em `src/data/`)
- `articles/` — artigos divididos por categoria (existencia-deus, igreja-catolica, sagrada-escritura, moral, outras-religioes, historia-igreja). `articles/index.js` mescla tudo e aplica traduções EN.
- `articles-en.js` — traduções em inglês dos artigos (`{ [id]: { titleEn, summaryEn, bodyEn } }`).
- `articleRelations.js` — relações entre artigos para "Artigos relacionados".
- `references.js` — versículos/Catecismo/documentos. Refs bíblicas têm `bibleNav: { bookId, chapter, verse }`.
- `references-en.js` — traduções EN das referências (`{ [id]: { textEn, topicEn, ... } }`).
- `referenceSources.js` — categorias de fonte das referências (Bíblia, Catecismo, ...).
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
- `readingPlan.js` — plano de leitura em trilhos (Fundamentos, Aprofundamento, Objeções protestantes).
- `jesusJourney.js` — mapa da jornada de Jesus (21 paradas, usado pelo BibleMapScreen).
- `debateStrategies.js` — táticas de debate e falácias.

### Serviços (`src/services/`)
- `bibleApi.js` — acesso síncrono à Bíblia (PT e EN).
- `firebase.js` — projeto `appologetica7`. As chaves de client são públicas por design; a segurança vem de `firestore.rules`. A persistência é escolhida por plataforma (IndexedDB/localStorage na web, AsyncStorage no nativo) e a web ainda injeta `browserPopupRedirectResolver`, sem o qual `signInWithPopup` lança `auth/argument-error`.
- `userData.js` — CRUD do usuário no Firestore. Só existem **três** subcoleções: `users/{uid}/highlights`, `/notes`, `/notebook`. Leituras são em tempo real (`watch*` devolvem unsubscribe).
- `liturgyApi.js` — liturgia do dia (rede, com cache e fallback offline).
- `newsApi.js` — notícias católicas via RSS (rede, cache de 3h por idioma).
- `notifications.js` — notificações push locais (`.web.js` é no-op).

Dados que ficam **só no dispositivo** (AsyncStorage, não no Firestore):
favoritos de artigos, progresso de leitura/plano, histórico de busca,
preferências de notificação, tema, idioma, modo visitante.

### Sentry
`src/sentry.js` é crash-only por decisão de privacidade: `sendDefaultPii: false`,
sem logs e sem session replay. Não inicializa no Expo Go (módulo nativo ausente)
e `sentry.web.js` é a versão neutra da web. Mantenha o `@sentry/react-native`
isolado nesse módulo para não arrastar o pacote nativo pro bundle web.
`metro.config.js` usa `getSentryExpoConfig` e desliga `unstable_enablePackageExports`.

### Site e deploy (`docs/` + GitHub Actions)
`.github/workflows/deploy-web.yml` roda a cada push no `master` e publica no
GitHub Pages: `npx expo export -p web` com `PAGES_BASE_URL=/apologetica-app/app`
(injetado em `app.config.js` como `experiments.baseUrl`), depois monta o site com
`docs/*.html` + `fotos/` + `dist/` em `/app`. **O workflow copia apenas
`docs/*.html`, `fotos/` e `dist/`** — asset novo do site exige ajustar o workflow
ou ficar inline no HTML.

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
  - Links `[[assim]]` apontam para NOMES de nota, não caminhos: mover pastas é de graça, renomear notas quebra links.
  - **Ritual de memória**: ao concluir uma sessão de trabalho significativa, criar `brain/1-Memória/Diário/AAAA-MM-DD - resumo.md` (o que foi feito, decisões, pendências) e acrescentar lições permanentes em `brain/1-Memória/Aprendizados.md`. Ao retomar trabalho, ler a entrada mais recente do Diário e o `Aprendizados.md`.
- `GUIA-DO-PROJETO.md` — mapa da raiz em linguagem leiga; manter atualizado ao criar/mover pastas.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Dark mode: `primaryText` vira dourado claro (`#e6c878`).

Icons via `@expo/vector-icons` (Ionicons).

## Fluxo de revisão e verificação

Antes de dar uma mudança como concluída, siga este fluxo leve. Ele substitui, de
forma adaptada ao app (JS/RN), a ideia de "agentes para verificar e aperfeiçoar o
código": a verificação determinística aqui é o lint e o build, não scripts Python.

**1. Lint (verificação determinística):**
```bash
npm run lint    # ESLint em src/ — precisa passar antes de commitar
```

**2. Revisão por agente — para mudanças não triviais (lógica, navegação, telas):**
- `/code-review` — revisa o diff atual em busca de bugs de correção.
- `/simplify` — limpa duplicação e simplifica o que foi alterado (só qualidade, não bugs).
- `/security-review` — quando a mudança toca auth, Firebase ou dados do usuário.

**3. Verificação de comportamento — quando a mudança é visível ao usuário:**
- `/verify` ou `/run` — sobe o app e confirma que a alteração funciona de verdade,
  não só que compila.

**Regras práticas:**
- Mudança só de conteúdo (texto de artigo, referência, tradução em `strings.js`):
  basta o lint. Não precisa de review nem build.
- Mudança em tela, navegação, contexto ou serviço: lint + `/code-review`, e `/verify`
  se houver impacto visual.
- Nunca dar como "pronto e testado" o que só compilou — diga o que foi de fato
  verificado e o que ficou de fora.
- Relatórios de agentes exploradores erram em detalhe: reverificar cada achado no
  código atual antes de corrigir.
