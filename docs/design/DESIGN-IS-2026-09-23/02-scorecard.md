# 02. Scorecard (dez princípios de Dieter Rams)

Pontuação feita pelo orquestrador a partir de `01-evidence.md` (§1 estrutural, §2 peso, §3 copy, §4 visual, §5 acessibilidade). Regras aplicadas: nota pelo pior caso da superfície, não pela média; em dúvida entre duas notas, a menor; sem pesos nem bônus. Âncoras por princípio conforme a skill.

```
1. Good design is innovative: nota 2/3
   Evidence: o padrão "objeção do dia → resposta guiada com fonte" (§3 A, HomeScreen.jsx:105-120 → Dialogue) e o caderno com tokens @[…](v|a|r:…) (§1 C, 00-features F10) não existem em Hallow nem Capela (00-scope.md, referências); a forma visual, porém, é a genérica de app RN (tab bar padrão, cards com filete, §4 D e G).
   Justification: refresca um padrão existente (card diário) com melhoria clara, mas não o "envia com contenção" (o mesmo card tem kicker uppercase, filete e seta animada), então não chega a 3, e não é imitação com variação mínima, então não cai a 1.

2. Good design makes a product useful: nota 1/3
   Evidence: o gate de onboarding aparece em toda abertura para visitante (§2 E.2, App.js:384-388 "TEMPORÁRIO"); "Ver a resposta" e "Pular" caem no Login, não na resposta (§3 B1, E4, E6); favoritar exige conta para um recurso local (§3 E11, B12); "Continue lendo" reabre sem posição (§3 E2); Busca e Referências só existem no HomeStack (§1 C.13, 00-features fato 1); menu do versículo só por long-press sem dica na tela (§3 E18, §5 C).
   Justification: a tarefa primária (achar e ler uma resposta com fonte) completa, mas com desvios desnecessários a cada abertura e no primeiro uso, o que é a âncora de 1; não é 0 porque a tarefa é suportada diretamente nas telas auditadas.

3. Good design is aesthetic: nota 1/3
   Evidence: 24 valores de espaçamento, metade fora da grade de 4, com 14 px como o padding mais comum ao lado de 8 (§4 A); 13 raios no código e 4 raios diferentes na mesma dobra da Início (9, 10, 12, 14; §4 D, §1 E); 11 tamanhos de texto com 11 px como o mais frequente e 68% dos textos sem line-height (§4 B); 8 tratamentos de cabeçalho de seção (§1 C.6); 13 cores literais fora da paleta (§4 C); 4 tamanhos de cruz e 3 de título no bloco de marca (§1 C.10); título do header sobrepondo o botão "Ouvir" em 22 px (§4 F).
   Justification: há um sistema visível (paleta navy/dourado/creme, cards brancos sobre creme) mas com bem mais de 5 inconsistências, o que é a âncora de 1; não é 0 porque as capturas lêem como um produto coeso à primeira vista e não há ruído visual ativo.

4. Good design makes a product understandable: nota 1/3
   Evidence: ícone de alto-falante lê como "som ligado/desligado" (§3 E10); ícones das abas trocados: livro nos Artigos, marcador na Bíblia (§3 E15); "Ferramentas" abriga Rosário, Exame, Plano, Quiz e Caderno (§3 D); jargão de interface "Referências", "Objeção do dia", "Marcações", "Trilho" (§3 D); "Continue lendo" com dois significados (§3 E2); instrução do long-press só na lista de livros (§3 E18); 27 touchables sem role nem label e tab bar sem estado selecionado exposto (§5 D, F).
   Justification: 2 a 3 controles primários ficam pouco claros e há jargão, âncora exata de 1; a ação primária (abrir a objeção, abrir um artigo) é identificável, então não é 0.

5. Good design is unobtrusive: nota 1/3
   Evidence: na Bíblia o conteúdo ocupa 615 de 844 px (73%): header 64 + título duplicado + barra + prev/next 56 + tab bar 64 (§4 A, F); títulos repetidos no header e no conteúdo em Bíblia e Artigo (§1 C.14, §4 F); prefixo "Artigo - " empurra o título para a elipse (§3 E16); seta de scroll com loop infinito em 23 telas, 60 rAF/s na Início ociosa e 240 na Bíblia (§2 D); 43 kickers em caixa alta e 13 cards com filete lateral (§1 C.5, C.7); headers navy sólidos e opacos (§4 G).
   Justification: decoração e chrome competem com o conteúdo (âncora de 1); o chrome não chega a dominar o conteúdo, então não é 0.

6. Good design is honest: nota 1/3
   Evidence: "Seus favoritos ficam salvos e sincronizados entre dispositivos" e "Seus favoritos protegidos" são falsos, favoritos vivem só em AsyncStorage (§3 B12, favorites.js:1-29); "Baixe o app" sem nada para baixar (§3 B10, E19); "Vamos te preparar em menos de um minuto" e "Pronto. Aqui está sua primeira resposta" quando a tela seguinte é o Login (§3 B1, B2); pergunta do onboarding cujo resultado é descartado (§3 B3); 1 Pedro 3,15 em três redações, uma com intervalo errado (§3 B14); "Buscar em todo o app" indexa 4 de 15 fontes (§3 B6); rabo promocional no compartilhar sem aviso (§3 C).
   Justification: bem mais de 2 inflações e um padrão escuro contido (nag de conta para recurso local), âncora de 1. Considerei 0 pela promessa falsa de sincronização atrelada à criação de conta; não pontuei 0 porque não há continuidade forçada, custo escondido nem escassez falsa e a recusa "Agora não" é neutra. B12 é o item que impede o 2 e precisa ser corrigido independentemente do veredito.

7. Good design is long-lasting: nota 1/3
   Evidence: kickers em caixa alta com letter-spacing (43 ocorrências, §1 C.5); cards com filete lateral colorido como contêiner universal (§1 C.7); headers de cor sólida (§4 G); seta de scroll pulando (§2 D). Todos marcadores de uma época (web SaaS 2018 a 2022, Material 2014, landing pages 2015).
   Justification: 2 a 3 marcadores datados, âncora de 1; não é 0 porque a paleta e a tipografia de sistema não datam um ano específico.

8. Good design is thorough down to the last detail: nota 0/3
   Evidence: foco de teclado nunca desenhado pelo app, só o anel padrão do navegador, e removido nos inputs do Login e na busca da Bíblia via outlineStyle: 'none' (§4 F, §5 F); desabilitado sem estilo no Login (§4 F); carregando ausente na Início e no Artigo (imagem sem placeholder), erro ausente na Início e no Artigo (§4 F); header do Artigo com título sobreposto ao botão (§4 F); botão voltar "Go back" em inglês (§5 C); alvos abaixo de 44 px: voltar 30x30, ícones do header 22x24, olho da senha 20x23, "Esqueci a senha" 102x15 (§5 E); curvas e durações sem sistema (220, 180, 900 ms; §4 G); dois divisores "ou" diferentes na mesma tela (§1 C.15).
   Justification: quatro ou mais estados ausentes na pior tela e foco em padrão do navegador, que é a âncora explícita de 0.

9. Good design is environmentally friendly: nota 1/3
   Evidence: JS inicial 4.989.774 B brutos, 1.374.966 B gzip, num só arquivo (§2 A); animação ociosa sempre ligada, sem condição de reduce motion (§2 D, F); prefers-color-scheme ignorado pelo app (o modo escuro existe, mas o app não lê o sistema; §2 F); fonte MaterialCommunityIcons de 1,3 MB puxada por um único ícone da Início (§2 A).
   Justification: transferência entre 500 KB e 2 MB com movimento sempre ligado, âncora de 1. Contei bytes comprimidos, que é o que o GitHub Pages entrega; pelos bytes brutos (4,99 MB) seria 0, e registro isso como risco.

10. Good design is as little design as possible: nota 1/3
   Evidence: elementos removíveis na superfície: título duplicado em Bíblia e Artigo (§1 C.14), prefixo "Artigo - " (§3 E16), par de setas de scroll por tela (§1 C.12), segundo divisor "ou" (§1 C.15), kickers e contadores em caixa alta (§1 C.5), filetes laterais (§1 C.7), duas implementações de "Continue lendo" (§1 C.1), 3 formas de card de categoria com ícones divergentes (§1 C.4).
   Justification: mais de 5 elementos removíveis, âncora de 1; a tela não é dominada por decoração nem por affordances duplicadas, então não é 0.
```

## Total

| # | Princípio | Nota |
|---|---|---|
| 1 | Inovador | 2 |
| 2 | Útil | 1 |
| 3 | Estético | 1 |
| 4 | Compreensível | 1 |
| 5 | Discreto | 1 |
| 6 | Honesto | 1 |
| 7 | Duradouro | 1 |
| 8 | Minucioso | 0 |
| 9 | Ambientalmente responsável | 1 |
| 10 | O mínimo de design possível | 1 |
| | **Total** | **10 / 30** |
