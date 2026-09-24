---
tags: [memoria, diario]
atualizado: 2026-09-24
---
# 2026-09-24 - Redesign nível Apple, Fase 5 no código

Continuação de [[2026-09-23 - Redesign nivel Apple, Fases 0 a 4]]. Com o "Aprovo,
pode ir para a Fase 5" do dono, o plano em ondas (`docs/design/plano-fase-5.md`,
feito com `make-plan` e quatro subagentes de descoberta de API em `node_modules`)
foi executado com a skill `do`: um subagente de implementação por onda ou por
grupo de telas, todos com conjuntos de arquivos disjuntos rodando em paralelo
(até cinco de cada vez), verificação (lint, `npm test`, `check:refs`, `npx expo
export -p web`, Playwright no Chromium) e commit pelo orquestrador.

## O que entrou (PR #2, branch `claude/funny-cray-ret9a0`, 43 commits)

1. **Infraestrutura**: `expo-blur` e `expo-linear-gradient` (únicas dependências
   novas), Cormorant Garamond SemiBold embarcada (79 KB, subset, OFL), primeira
   suíte de testes (`npm test` com `node --test`, 60 testes) ligada ao deploy,
   `haptics.js`, chaves novas no tema, tema inicial pelo sistema.
2. **Honestidade e primeiro uso**: favoritos não prometem sincronia, onboarding
   uma vez só com "Pular" caindo no app como visitante, favoritar sem conta,
   ScrollHint apagado das 24 telas, aba ativa em navy, MaterialCommunityIcons
   fora do bundle.
3. **Design system**: `src/theme/tokens.js` (puro, testado), `useTheme()` com
   `tokens` e `text(role)`, `src/components/ui/` (15 blocos), `BrandMark`.
4. **Chrome e navegação**: tab bar própria translúcida com `role=tab`,
   `chrome.js` com header opaco por padrão e translúcido opt-in, stack JS na web
   para animar o push, `sharedScreens()` no lugar das 4 cópias, `links.js`.
5. **Telas**: Início, Artigo, Bíblia, Onboarding e conta iguais aos mocks
   aprovados; Ajustes, Praticar, Artigos, Categoria, Hoje, Referências, RefDetail,
   Busca, Quiz, Diálogo, Debate, Glossário, Rosário, Exame, Mapa, Liturgia, Plano,
   Favoritos, Marcações, Notas, Caderno, editor de nota e Legal com a pele nova.
6. **Helpers puros com TDD**: `daily.js` (com testes de caracterização que fixam
   o item do dia), `verseRef.js`, `i18nData.js`, `tts.js` + `speakLong.js`,
   `refLabel.js`; Firestore só via `userData.js`.
7. **Varredura final**: hex, negrito e `hitSlop` zerados fora das exceções,
   quatro componentes mortos apagados, `ErrorBoundary` e splash pela paleta.

## Números da verificação final

- Lint: 0 erros, 5 warnings (eram 14). Testes: 60 verdes. `check:refs`: 0 erros.
- Bundle web: +19 KB gzip (teto era +150 KB).
- Playwright: 26 capturas em `design/preview/depois/`, 0 erros de página, 5 abas
  com 1 selecionada, blur na barra, contraste do rótulo ativo 10,3 (claro) e 9,3
  (escuro), nenhum botão abaixo de 44 na Início, 0 quadros de animação com a
  tela parada.

## Decisões tomadas no caminho

- Header dos stacks opaco na cor do fundo por padrão; translúcido só nas telas
  que compensam a altura (Artigo). Evitou reescrever dezenas de telas de uma vez.
- `setBackgroundColorAsync` e `edgeToEdgeEnabled` ficaram como estão até uma onda
  própria (regrediria o tema escuro no build EAS sem edge-to-edge).
- Cruz do onboarding e do login em dourado, como no mock aprovado (o navy
  tinha sido uma interpretação minha e voltou atrás).
- Artigo marca como lido ao passar de 90% (o selo "Lido" nunca era gravado).

## Pendências

- Smoke no Android e no iPhone pelo dono (blur nativo, gesto de voltar,
  haptics, TTS, `useFonts`, Firestore com conta real): só a web foi verificada.
- `edgeToEdgeEnabled: true` + remoção de `setBackgroundColorAsync` (onda futura).
- ~150 strings de UI ainda inline em `isEn ? :` (onda de i18n própria).
- PR #2 fica em rascunho até o dono pedir para abrir.
