---
tags: [memoria, diario]
atualizado: 2026-10-05
---
# 2026-10-05 - Correções do dono, aulas de arte e identidades

Continuação de [[2026-09-24 - Upgrade para o Expo SDK 57]]. O dono testou o
redesign no Expo Go e mandou uma lista de correções, pediu a funcionalidade das
lupas do Museu Virtual nas imagens dos artigos, uma varredura do app inteiro,
propostas de identidade visual e que tudo valesse também no site, na landing e
no computador (não só no Expo Go).

## Ferramentas instaladas

- Skills do Emil Kowalski (animate-expo, apple-design, emil-design-eng,
  mobile-native, break-ui...) e do Taste Skill (taste-skill, redesign-skill,
  brandkit, soft-skill...) em `~/.claude/skills`.
- MCP do Figma (escopo de usuário; falta o dono autenticar uma vez) e MCP do
  Playwright. Playwright também virou devDependency com `npm run capture`.

## O que entrou (branch `claude/funny-cray-ret9a0`)

1. Pedidos do dono: respiro sob a barra no topo do artigo; títulos de seção
   alinhados com o título da tela (o `SectionTitle` tinha 16 pt a mais); mapa
   de volta (a CARTO passou a exigir chave, trocado pelo mapa físico da Esri);
   fotos das 21 paradas em 1600 px da Commons, com crédito e contidas no quadro.
2. Visualizador de obras (motor do Museu Virtual, OpenSeadragon) com lupas,
   visita guiada e aula. 82 lições e 472 lupas cobrindo as 83 imagens: 7 obras
   importadas do Museu e 75 escritas por cinco agentes em paralelo, cada lupa
   conferida por recorte. As aulas são carregadas sob demanda (pedaço de 372 KB
   na web; o bundle principal ficou em +27 KB).
3. Zoom: o toque duplo era exclusivo e atrasava todo gesto, a pinça não seguia
   os dedos e `clamp` não era worklet (derrubaria a pinça no nativo). 66 de 83
   `imageHd` estavam quebrados (o wsrv.nl leva 429 da Wikimedia).
4. Auditoria com Playwright (216 capturas): coluna centrada no desktop, tab bar
   em cápsula, barras sem vazar texto, voltar único de 44 pt, liturgia sem
   cartão vazio, legendas e ícones alinhados, plurais, chips sem órfão.
5. Quatro identidades testáveis em Ajustes (Clássica padrão, Âncora, Basílica,
   Lumen), com painéis de marca gerados no Higgsfield e marcas em SVG.
6. Landing refeita no sistema do app, com as quatro identidades por parâmetro.
7. Desktop: PWA instalável pelo próprio app, que já se atualizava sozinho.
8. 13 créditos de imagem errados corrigidos (o artigo 64 nem era de Poussin).

## Verificado

- Lint 0 erros e 0 warnings, 121 testes, `check:refs` 0 erros.
- `npx expo export -p web` e `-p ios -p android` (este com `--no-bytecode`: o
  hermesc não sobe neste Windows, "spawn UNKNOWN").
- Visualizador testado com Playwright (Última Ceia pelo DZI do Museu e as
  Cruzadas pela pirâmide da Commons). Revisões de código em três partes.

## Pendências

- Escolha da identidade pelo dono; depois, ícone, splash e cor do manifesto.
- Publicar: o site só muda com merge no master (pedido de ok ao dono).
- Smoke no celular real: WebView do visualizador e do mapa, gestos da reserva
  sem rede, blur das barras.
- Artigo 53: a foto é uma cópia moderna do ícone de Vladimir (em Batumi). Trocar
  pelo original exige refazer as lupas.
- ChipRow: rolar até um chip que aparece depois da montagem (achado baixo da
  revisão, aberto).

## Publicação (fim do dia)

- O dono adiou a escolha da identidade ("vou testar e te digo") e autorizou
  "publicar tudo, inclusive para build. Quando for mudar algo tem que mudar em
  todo lugar."
- PR #2 saiu do rascunho e entrou no master (merge `09c0e4e`). O deploy do
  GitHub Pages passou (build e deploy verdes) e o teste de fumaça no site
  publicado abriu a Última Ceia com as lupas, sem erro de página.
- Build EAS Android `preview` (APK, mesmo perfil dos builds de junho):
  `5e41da1c`, concluído. O iOS segue sem credenciais (Expo Go cobre o iPhone).
