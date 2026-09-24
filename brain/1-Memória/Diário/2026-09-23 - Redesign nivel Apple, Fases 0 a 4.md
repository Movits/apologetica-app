---
tags: [memoria, diario]
atualizado: 2026-09-23
---
# 2026-09-23 - Redesign nível Apple, Fases 0 a 4

Sessão longa de design, sem tocar em código do app (`src/`, `App.js`,
`package.json` intactos, lint e `check:refs` na baseline). Tudo commitado na
branch `claude/funny-cray-ret9a0` e no PR #2 (rascunho).

## O que foi feito

1. **Fase 0, alinhamento** (skill grilling, 2 rodadas, 15 decisões): tokens antes
   de chrome antes de microinterações; iOS como referência com uma linguagem nas
   3 plataformas; direção híbrida (estrutura Apple + navy, dourado e creme);
   Cormorant Garamond SemiBold só em títulos, sans do sistema na interface,
   serifa do sistema na leitura; tab bar com blur e large title próprio;
   `ios_from_right` em tudo; haptics leves em seleção; Ionicons mantidos; só
   expo-blur, expo-linear-gradient e expo-font como dependências novas;
   Higgsfield só para material atmosférico, teto de 300 créditos.
2. **Fase 1, pesquisa** (Workflow multiagente: 8 pesquisadores, 8 verificadores,
   2 adaptações, síntese, crítica): `docs/design/pesquisa-apple.md`, 295
   afirmações do HIG conferidas na fonte, adaptação para react-native-web e
   Android, proposta de tokens (§12).
3. **Fase 2, diagnóstico** (skills design-is e pathfinder):
   - Rams: **10 de 30, veredito REDESIGN** da camada visual (nota 0 em
     "minucioso"), preservando marca, abas, rotas e conteúdo.
     `docs/design/DESIGN-IS-2026-09-23/`.
   - Pathfinder: 14 features, 12 fluxogramas, 137 duplicações internas e 37
     entre features, proposta em 6 sistemas (tokens, componentes base, chrome
     e navegação, helpers bilíngues, datas, correções pontuais).
     `docs/design/PATHFINDER-2026-09-23/`.
   - Consolidado por impacto x esforço: `docs/design/diagnostico.md`.
4. **Fase 3, assets** (Higgsfield, 31 créditos com ok prévio, saldo 1000 → 969):
   8 fundos atmosféricos e 1 loop de luz em `assets/design/` com `CREDITOS.md`.
5. **Fase 4, protótipo** (skill frontend-design): `design/preview/index.html`,
   antes (captura real) e depois (mock com tokens) das 5 telas e do chrome,
   claro e escuro, demos de large title, push e sheet. Verificado no Chromium
   em 360, 390 e 1280 px. Capturas "antes" em `design/preview/antes/`.

## Decisões

- O veredito de Rams sai da tabela, não da preferência: REDESIGN da pele, não da
  arquitetura de informação. As 5 abas e os nomes de rota ficam.
- Dourado nunca como texto sobre claro (2,3:1). Tint é navy no claro e dourado
  no escuro.
- Kickers em caixa alta, filetes laterais e a seta de scroll animada saem como
  linguagem.
- Assets gerados só atmosféricos; figurativo sagrado continua de domínio público.

## Pendências

- Aprovação do protótipo (fim da Fase 4) antes de qualquer código.
- Fase 5: `make-plan` a partir de `DESIGN-IS-2026-09-23/04-handoff-prompt.md` e
  `PATHFINDER-2026-09-23/04-handoff-prompts.md`, em ondas com lint, export web e
  commit cada; primeira suíte de testes mínima para tokens e utilitários.
- Decisões de produto que a auditoria apontou e ficam com o dono: onboarding
  uma vez só, "Ver a resposta" abrindo a resposta como visitante, favoritar sem
  conta, copy de sincronização, busca acessível de todas as abas (backlog).
- Textos legais em 3 cópias divergentes (`LegalScreen` vs `docs/privacy.html` e
  `docs/terms.html`): revisão humana.
- O vídeo `splash-loop.mp4` (2,9 MB) não foi pré-visualizado no container
  (sem H.264); conferir no navegador antes de usar.
