---
tags: [memoria, diario]
atualizado: 2026-10-13
---
# 2026-10-13 - Identidade Clássica definida

Continuação de [[2026-10-05 - Correções do dono, aulas de arte e identidades]],
que deixou quatro identidades testáveis em Ajustes (Clássica, Âncora, Basílica e
Lumen) à espera da escolha do dono.

## Decisão

Depois de testar, o dono escreveu: "Gostei do clássico mesmo, pode publicar."
A Clássica (navy, dourado e creme, títulos em Cormorant Garamond, cruz latina)
passa a ser a identidade do app e do site, e as três propostas saem do que é
publicado. Registro completo, com o passo a passo para restaurar uma proposta,
em [[Decisão - Identidade visual Clássica]].

Para quem usa, o resultado é a Clássica de sempre, só sem o seletor.

## Limpeza (branch `claude/identidade-classica`)

- `src/theme/identities.js` e `tests/identities.test.mjs` saíram. A paleta foi
  para `src/theme/palette.js` (puro: `LIGHT`, `DARK` e `contrastRatio`),
  testada em `tests/palette.test.mjs` com contraste AA nos mesmos 12 pares de
  texto e fundo. O `ThemeContext` reexporta `LIGHT` e `DARK`.
- O `ThemeContext` perdeu o estado de identidade, as fontes de título sob
  demanda e o parâmetro `?identidade=` da web. A chave antiga
  `settings:identity` é apagada do AsyncStorage na hidratação.
- Ajustes perdeu a seção "Identidade visual" ("Propostas em avaliação").
- O `BrandMark` desenha só a cruz latina.
- EB Garamond, Cinzel e Instrument Serif saíram de `assets/fonts/`.
- A landing (`docs/*.html`) é só Clássica, sem `data-identity`.

## O que ficou guardado

- Os painéis do Higgsfield em `design/identidade/boards/` e as três marcas em
  SVG em `design/identidade/marcas/`.
- A implementação inteira no git: `1e777be` (app), `612d13f` (landing) e o
  merge do PR #2, `09c0e4e`.

## Documentação atualizada

- `CLAUDE.md`: a lista de módulos testáveis aponta `palette.js`, a seção de
  identidades virou uma linha sobre a Clássica e as paletas `LIGHT`/`DARK`
  passaram a ser apontadas em `src/theme/palette.js`.
- A nota "Identidades visuais em avaliação" virou
  [[Decisão - Identidade visual Clássica]] e entrou no
  [[Mapa do Projeto e Decisões]].
- [[Estado Global e Tema]] diz de onde vêm as cores.
- `GUIA-DO-PROJETO.md` explica a pasta `design/identidade/`.

## Pendências

- Publicar o site: o dono autorizou ("pode publicar"). O site muda com o merge
  no master, que dispara o deploy do GitHub Pages.
- O APK de 5 de outubro (`5e41da1c`) ainda tem o seletor. Em 5 de outubro o
  dono definiu que publicar é "tudo, inclusive para build", então um APK novo
  sai junto com esta publicação.
- Ícone, splash e cor do manifesto, pendentes desde 5 de outubro, não precisam
  mudar: sempre foram da Clássica.

## Aprendizado

Proposta visual que vai ao app para o dono testar deve nascer isolada atrás de
uma chave, com a opção de sempre como padrão e sem mexer nas telas. Se o dono
fica com a de sempre, a volta é apagar e arquivar, sem reescrever nada.
