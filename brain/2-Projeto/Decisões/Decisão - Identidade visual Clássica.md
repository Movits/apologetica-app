---
tags: [decisao]
atualizado: 2026-10-13
---
# Decisão - Identidade visual Clássica

## Contexto

O redesign de setembro de 2026 manteve a identidade de sempre (navy e ouro,
Cormorant, cruz latina). O dono achou que "não é feio, mas não sei se é tão
bom" e pediu para guardar essa opção e ter outras, com logo e imagens, não só
cores.

Em 5 de outubro de 2026 entraram no app quatro identidades testáveis em
Ajustes > Identidade visual (e na web por `?identidade=`), com a landing
acompanhando:

- **Clássica** (padrão, a de sempre): navy, dourado e creme, títulos em
  Cormorant Garamond, cruz latina.
- **Âncora**: cruz-âncora das catacumbas (Hebreus 6,19), tinta marinha,
  terracota e marfim, títulos em EB Garamond.
- **Basílica**: Chi-Rho em mosaico, lápis-lazúli, ouro e pórfiro, capitulares
  em Cinzel, da mesma família do Museu Virtual.
- **Lumen**: balão de fala com a cruz recortada ("a resposta"), marfim, tinta
  e âmbar, títulos em Instrument Serif.

## Decisão

Em 13 de outubro de 2026, depois de testar, o dono escreveu: "Gostei do
clássico mesmo, pode publicar." A Clássica é a identidade do app e do site, e
as três propostas saem do que é publicado.

Para quem usa, nada muda além do seletor: o app e o site ficam exatamente como
a Clássica já era.

## O que saiu do app e do site

- `src/theme/identities.js` e `tests/identities.test.mjs`. A paleta ficou em
  `src/theme/palette.js` (puro, exporta `LIGHT`, `DARK` e `contrastRatio`),
  testada em `tests/palette.test.mjs`: mesmas chaves nas duas paletas e
  contraste AA nos 12 pares de texto e fundo. O `ThemeContext` reexporta
  `LIGHT` e `DARK`.
- No `ThemeContext`: o estado de identidade, as fontes de título carregadas sob
  demanda e o parâmetro `?identidade=` da web. A chave antiga
  `settings:identity` é apagada do AsyncStorage na hidratação (sem esperar a
  resposta), para quem testou outra identidade não ficar com lixo salvo.
- Em Ajustes: a seção "Identidade visual" (com o rodapé "Propostas em
  avaliação").
- No `BrandMark`: as três marcas novas. Ele desenha só a cruz latina.
- Em `assets/fonts/`: EB Garamond, Cinzel e Instrument Serif. Fica só a
  Cormorant Garamond.
- Na landing (`docs/*.html`): o suporte às quatro identidades por
  `<html data-identity>`. O site é só Clássica.

## Onde as propostas ficaram guardadas

- Painéis de marca gerados no Higgsfield (GPT Image 2) em
  `design/identidade/boards/`: A é a Clássica, B a Âncora, C a Basílica e D a
  Lumen.
- As três marcas em SVG em `design/identidade/marcas/`, ao lado dos painéis.
- A implementação completa no git: `1e777be` (feat(identidade), o app),
  `612d13f` (a landing com as quatro) e o merge do PR #2, `09c0e4e`, que tem
  tudo junto.

## Como restaurar uma proposta

1. Paleta, fonte e escala de cada uma: `git show 09c0e4e:src/theme/identities.js`.
   A paleta resgatada precisa ter as mesmas chaves de `palette.js` e passar no
   teste de contraste.
2. Fonte de títulos: `git checkout 09c0e4e -- assets/fonts/` traz de volta as
   três `.ttf`, as licenças OFL e a ficha em `CREDITOS.md`. Fica só a da
   proposta escolhida.
3. Marca: o SVG volta de `design/identidade/marcas/` para `assets/brand/`, e o
   desenho no `BrandMark` está em `git show 09c0e4e:src/components/BrandMark.jsx`
   (a versão final, com a cruz no tamanho corrigido depois de `1e777be`).
4. Seletor, fontes sob demanda e `?identidade=`: a versão final de cada arquivo
   em `09c0e4e` (`git show 09c0e4e:src/context/ThemeContext.jsx`, o mesmo para
   `src/screens/SettingsScreen.jsx` e `src/i18n/strings.js`). Ela já inclui as
   correções de `a7cdd11` (o `?identidade=` sai do endereço depois de lido).
   A landing com as quatro está em `612d13f`.

## Consequências

- Ícone, splash, cor do `index.html` da web e do manifesto não precisam mudar:
  sempre foram da Clássica (`#1a3a5c`). Era a pendência desta nota em 5 de
  outubro.
- Um tema só simplifica o `ThemeContext` e tira três fontes do pacote.
- O APK de 5 de outubro (build `5e41da1c`) ainda mostra o seletor. Some no
  próximo build, que só sai quando o dono pedir.

## Ligações

- [[2026-10-05 - Correções do dono, aulas de arte e identidades]]
- [[2026-10-13 - Identidade Clássica definida]]
- [[Estado Global e Tema]]
- [[Mapa do Projeto e Decisões]]
