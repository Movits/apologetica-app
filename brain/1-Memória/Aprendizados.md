---
tags: [memoria]
atualizado: 2026-07-08
---
# Aprendizados

Lições permanentes do projeto. Cada item é algo que já custou tempo uma vez e
não precisa custar de novo. A IA e o dono do projeto adicionam aqui sempre que
uma descoberta valer pra sempre. Nunca apagar itens, só marcar como obsoletos.

## Sobre o código

- Os arquivos de artigos usam `require()` de imagens, coisa do Metro. Node puro
  não roda: qualquer script que leia esses dados precisa trocar o `require` por
  null antes de importar (o `scripts/generate-brain.mjs` faz isso).
- A aba Bíblia nunca desmonta ao trocar de aba. Efeito de limpeza por unmount
  não basta: usar o evento `blur` da navegação (foi a causa do TTS fantasma).
- `colors.mode` só existe no tema escuro. Usar `darkMode` do `useTheme()`.
- A fonte da Bíblia Ave Maria (`_avemaria_raw.json`) é gitignored de propósito.
  O script `convert-avemaria.mjs` não está quebrado, só precisa da fonte.
- Chaves do i18n com prefixo dinâmico (`category.*`, `source.*`, `plan.track.*`)
  não aparecem em grep por chave completa. Proteger antes de limpar.

## Sobre o site e deploy

- O workflow copia apenas `docs/*.html` e as pastas `fotos/` e `dist/`. Asset
  novo no site exige ajuste no workflow ou ficar inline no HTML.
- O nome de arquivo da obra de São Miguel no Wikimedia é `Guido Reni 031.jpg`.
  O nome do Google Art Project não existe (deu requisições falhas por dias).
- Imagem local carrega antes do primeiro frame: efeito de fade precisa esperar
  dois `requestAnimationFrame` pra ter de onde partir.

## Sobre o vault (este cofre)

- Links `[[assim]]` apontam pra NOMES de nota, não caminhos. Mover pastas é de
  graça, renomear notas quebra links.
- Nome de cofre diferente do nome da pasta é sinal de cofre criado no lugar
  errado (cofre novo copia nada e vive em outra pasta, congelado no tempo).
- Windows não aceita `\\ / : * ? " < > |` em nomes de arquivo. O gerador saneia.

## Sobre o processo

- Toda remoção de código precisa de: grep individual, lint 0 erros e
  `npx expo export -p web` verde. O trio pegou tudo até hoje.
- Relatórios de agentes exploradores podem errar em detalhe. Reverificar cada
  achado no código atual antes de corrigir (dois "bugs" já estavam corrigidos).

## Sobre design e auditorias (2026-09-23)

- O container de sessão tem 4 núcleos: um Workflow roda só 2 agentes por vez.
  Coletas grandes rendem mais com o Agent tool em paralelo (12 rodaram juntos).
- Agentes herdam o diretório de trabalho da sessão no momento em que nascem.
  Fazer `cd` numa pasta do repositório antes de lançar agentes faz downloads
  deles caírem lá (aconteceu com JSONs da Apple em `design/preview/antes/`).
- O ffmpeg do Playwright é uma build enxuta: não abre PNG nem MP4. Para
  converter e redimensionar imagem sem PIL, o canvas do Chromium via Playwright
  resolve (PNG 2K de 4 MB vira JPEG de 40 KB).
- O Chromium do container não decodifica H.264: vídeo gerado só se confere no
  navegador do usuário ou no widget do Higgsfield.
- Na web, `hitSlop` não tem efeito no react-native-web 0.21: alvo pequeno
  precisa de `minHeight`/`minWidth` de 44 de verdade.
- Dourado `#c9a84c` sobre branco dá 2,29:1: nunca como texto ou rótulo de aba
  ativa no tema claro. O token `accentText` (`#806418`) existe para isso.

## Sobre execução em ondas com subagentes (2026-09-24)

- Subagentes paralelos só funcionam com conjuntos de arquivos disjuntos
  declarados no prompt. `strings.js` e `ui/index.js` são os pontos de colisão:
  regra "só acrescentar, numa edição, relendo antes" resolveu.
- `git add` de caminhos específicos não protege de um `git rm` que outro agente
  deixou no índice: o commit leva a exclusão junto (aconteceu com `CrossMark`).
  Conferir `git diff --cached --stat` antes de cada commit parcial.
- O modo plano do harness volta a ficar ativo depois de um reinício do container
  e bloqueia os subagentes (eles escrevem o roteiro num arquivo e param). O Bash
  do orquestrador não é bloqueado, mas o caminho certo é `ExitPlanMode` de novo.
- O `native-stack` não anima na web; para o push deslizar é preciso o stack JS
  com `animationEnabled: true` e `cardStyle: { flex: 1 }`, senão as ScrollViews
  param de rolar dentro do CardSheet.
- O `Header` do elements com título centrado reserva só 72 pt à direita: três
  ações de 44 exigem `headerTitleAlign: 'left'`.
- Testes de caracterização antes de extrair uma fórmula (índice do dia, Páscoa)
  são a única prova de que "o item do dia não mudou".
- Cada agente deve exportar para o próprio `--output-dir` e servir numa porta
  própria: um `expo export` concorrente apaga os assets com hash do `dist/` que
  outro Playwright está lendo.

## Sobre versões do Expo (2026-09-24)

- O Expo Go da App Store e da Play Store só abre o SDK mais recente. Ficar um
  SDK atrás já obriga a instalar um Expo Go antigo (Android) ou a usar build
  de desenvolvimento (iPhone). Manter o SDK atualizado é o que deixa o teste no
  celular barato.
- Upgrade em três passos: `npx expo install expo@^N.0.0 --fix`, depois
  `npx expo-doctor@latest` (é ele que aponta os campos removidos do `app.json`),
  depois ler o módulo em `node_modules` antes de trocar uma chamada (o
  changelog diz "deprecado", o código diz se a função ainda existe).
- Com `app.config.js` dinâmico a CLI não consegue gravar plugins sozinha: ela
  lista o que quer e o plugin entra à mão no `app.json`.
- Prova barata de que um upgrade não mudou nada visível: as capturas do
  Playwright saírem byte a byte iguais (`cmp`) às da versão anterior.
- `npx expo export -p ios -p android` compila os bundles nativos sem Xcode nem
  Android Studio: pega import quebrado em módulo só nativo que o export web
  nunca vê.
