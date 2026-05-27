# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
```

Scripts de conversão de dados:
```bash
node scripts/convert-avemaria.mjs        # regera bibleAveMaria.js a partir do JSON fonte
node scripts/convert-douay-rheims.mjs    # regera bibleDouayRheims.js (EN)
node scripts/convert-catechism.mjs       # regera dados do Catecismo
node scripts/split-articles.mjs          # divide artigos monolíticos em categorias
node scripts/sync-bible-refs.mjs         # sincroniza referências bíblicas
node scripts/generate-icons.mjs          # gera ícones do app
```

## Architecture

**React Native + Expo SDK 54** com 5 tabs no bottom navigator. **Tudo funciona offline** — sem chamadas de rede em tempo de execução (exceto auth Firebase).

### Tabs
1. **Início** — `HomeScreen` (com HomeStack interno para telas secundárias)
2. **Artigos** — `ArticlesScreen` (com ArticlesStack: lista → detalhe)
3. **Referências** — `ReferencesScreen`
4. **Bíblia** — `BibleScreen` — 73 livros Ave Maria (PT) + Douay-Rheims (EN), navegação prev/next entre capítulos
5. **Ajustes** — `SettingsScreen`

### Navegação
O app usa dois stacks internos dentro dos tabs (tab bar permanece visível):

- **HomeStack** (`HomeStackScreen`): HomeMain → Favorites, Glossary, ReadingPlan, Rosary, ExamConscience, Highlights, Notes, Search, Liturgy, ArticleFromSearch, RefDetail, Quiz, Dialogue, BibleMap, Legal.
- **ArticlesStack** (`ArticlesStackScreen`): ArticlesList → ArticleDetail → RefDetail, Glossary.
- **MainStack** (raiz): MainTabs + NoteEditor (modal full-screen sem tab bar).
- **AuthStack**: Login, Signup, ForgotPassword.
- **OnboardingScreen**: exibido uma vez antes das tabs.

### Estado global (Contexts)
- `ThemeContext` — `colors` (light/dark), `darkMode`, `fontSize`, `fs(n)` (escala). Persistido em AsyncStorage.
  - `primary` = cor de fundo principal, `primaryText` = texto enfatizado.
- `AuthContext` — estado de autenticação Firebase (`signedInOrGuest`, `loading`).
- `LanguageContext` — `t(key)` para internacionalização PT/EN.

### Bíblia: 100% offline (Ave Maria + Douay-Rheims)
`src/services/bibleApi.js` — `getChapter(bookId, chapter, language?)` síncrono.
- `language='pt'` → Ave Maria (`src/data/bibleAveMaria.js`, ~4 MB)
- `language='en'` → Douay-Rheims-Challoner (`src/data/bibleDouayRheims.js`, ~4.5 MB). Fallback automático para PT se EN indisponível.

### Navegação entre telas
- `ArticlesScreen` → tap em referência → `navigate('Referências', { highlightId })`.
- `ReferencesScreen` → "Ler no app" (refs com `bibleNav`) → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen`: deep link via `route.params`, prev/next dentro da tela de versículos.

### Dados (estáticos em `src/data/`)
- `articles/` — artigos divididos por categoria (existencia-deus, igreja-catolica, sagrada-escritura, moral, outras-religioes, historia-igreja). `articles/index.js` mescla tudo e aplica traduções EN.
- `articles-en.js` — traduções em inglês dos artigos (`{ [id]: { titleEn, summaryEn, bodyEn } }`).
- `articleRelations.js` — relações entre artigos para "Artigos relacionados".
- `references.js` — versículos/Catecismo/documentos. Refs bíblicas têm `bibleNav: { bookId, chapter, verse }`.
- `bible.js` — metadados dos 73 livros (id, apiId, name, short, testament, group, totalChapters, deutero).
- `bibleAveMaria.js` — Bíblia Ave Maria completa. Formato: `{ bookId: [[v1,v2,...], ...] }`.
- `bibleDouayRheims.js` — Douay-Rheims-Challoner (EN). Mesmo formato.
- `bibleMap.js` — mapa geográfico bíblico.
- `dailyVerses.js` — versículos do dia.
- `saints.js` — santos do dia.
- `glossary.js` — glossário apologético.
- `quiz.js` — questões para o quiz de fé.
- `dialogues.js` — diálogos apologéticos.
- `examConscience.js` — exame de consciência.
- `readingPlan.js` — plano de leitura bíblica.
- `jesusJourney.js` — mapa da jornada de Jesus.

### Serviços (`src/services/`)
- `bibleApi.js` — acesso síncrono à Bíblia (PT e EN).
- `firebase.js` — configuração do Firebase (auth, Firestore).
- `userData.js` — CRUD de dados do usuário no Firestore (notas, destaques, favoritos).
- `liturgyApi.js` — liturgia do dia.
- `notifications.js` — notificações push locais.

### Convenções de conteúdo
- **Sem travessões (—)**.
- **Linguagem natural** em português, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Dark mode: `primaryText` vira dourado claro (`#e6c878`).

Icons via `@expo/vector-icons` (Ionicons).

# Agent Instructions

You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture

**Layer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team

**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- Example: If you need to pull data from a website, don't attempt it directly. Read `workflows/scrape_website.md`, figure out the required inputs, then execute `tools/scrape_single_site.py`

**Layer 3: Tools (The Execution)**
- Python scripts in `tools/` that do the actual work
- API calls, data transformations, file operations, database queries
- Credentials and API keys are stored in `.env`
- These scripts are consistent, testable, and fast

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast. If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.

## How to Operate

**1. Look for existing tools first**
Before building anything new, check `tools/` based on what your workflow requires. Only create new scripts when nothing exists for that task.

**2. Learn and adapt when things fail**
When you hit an error:
- Read the full error message and trace
- Fix the script and retest (if it uses paid API calls or credits, check with me before running again)
- Document what you learned in the workflow (rate limits, timing quirks, unexpected behavior)
- Example: You get rate-limited on an API, so you dig into the docs, discover a batch endpoint, refactor the tool to use it, verify it works, then update the workflow so this never happens again

**3. Keep workflows current**
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. That said, don't create or overwrite workflows without asking unless I explicitly tell you to. These are your instructions and need to be preserved and refined, not tossed after one use.

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool
3. Verify the fix works
4. Update the workflow with the new approach
5. Move on with a more robust system

This loop is how the framework improves over time.

## File Structure

**What goes where:**
- **Deliverables**: Final outputs go to cloud services (Google Sheets, Slides, etc.) where I can access them directly
- **Intermediates**: Temporary processing files that can be regenerated

**Directory layout:**
```
.tmp/           # Temporary files (scraped data, intermediate exports). Regenerated as needed.
tools/          # Python scripts for deterministic execution
workflows/      # Markdown SOPs defining what to do and how
.env            # API keys and environment variables (NEVER store secrets anywhere else)
credentials.json, token.json  # Google OAuth (gitignored)
```

**Core principle:** Local files are just for processing. Anything I need to see or use lives in cloud services. Everything in `.tmp/` is disposable.

## Bottom Line

You sit between what I want (workflows) and what actually gets done (tools). Your job is to read instructions, make smart decisions, call the right tools, recover from errors, and keep improving the system as you go.

Stay pragmatic. Stay reliable. Keep learning.
