# 03. Veredito

**REDESIGN.** O APPologética somou 10 de 30 na auditoria de Rams, com nota 0 em "minucioso" (estados de foco, carregamento, erro e desabilitado ausentes ou em padrão do navegador) e 1 em oito dos outros nove princípios: o conteúdo e o padrão "objeção → resposta com fonte" são a parte forte, mas a camada visual e de interação não tem sistema (espaço, raio, tipo, cor e movimento decididos tela a tela), o chrome compete com a leitura, e a copy promete o que o produto não faz.

Regra aplicada: REFINE exige total maior ou igual a 20 e nenhum 0. O total é 10 e há um 0. O veredito sai da tabela, não da preferência.

## O que o REDESIGN cobre e o que preserva

Redesenhar a partir do propósito significa aqui refazer o **sistema de design, o chrome e os templates de tela** (a "pele" e os estados), e não a arquitetura de informação: as 5 abas, os nomes de rota (deep links) e a estrutura de conteúdo (artigos com fontes, diálogos, Bíblia offline) são o que pontuou bem ou é decisão fechada da Fase 0, e ficam. Isso não é "portar a estrutura velha sob estilo novo": o que causou as notas baixas foi exatamente a camada que vai embora (estilos soltos por tela, headers sólidos com títulos duplicados, seta animada, kickers e filetes, gate de onboarding, nag de conta e copy inflada), e nenhuma dessas coisas é a arquitetura de informação.

## Os cinco movimentos de maior alavancagem

1. **Princípio 3 (estético) e 8 (minucioso): um sistema de tokens que toda tela usa.** Grade de 4 pt para espaço, três raios, escala tipográfica com line-height em todos os papéis, cores semânticas com versão escura (inclusive acento sobre superfície, que hoje dá 2,29:1 no claro), e estados de foco, desabilitado, carregando e erro definidos uma vez. Substituir os 48 `makeStyles(colors, fs)` com números soltos. Evidência: `01-evidence.md` §4 A (24 valores de espaço, 50% fora da grade), §4 B (68% sem line-height), §1 E (13 raios, 21 paddings), §4 C (13 cores literais), §4 F e §5 F (`outlineStyle: 'none'` em `LoginScreen.jsx:194`, `BibleScreen.jsx:1007`; nenhum estilo de foco no app).

2. **Princípio 5 (discreto): chrome que recua.** Tab bar translúcida com conteúdo passando por baixo, header com large title próprio que encolhe no scroll, um título só (remover a duplicata do conteúdo e o prefixo "Artigo - "), sem seta de scroll animada, leitura da Bíblia com mais de 85% da altura. Evidência: §4 A (615 de 844 px úteis), §4 F (título "João 3" duas vezes, `BibleScreen.jsx:180` e `:805`; sobreposição de 22 px no header do Artigo), §3 E16 (`ArticleDetailScreen.jsx:171`), §2 D (`ScrollHint.jsx:26-41` em 23 telas, 60 a 240 rAF/s ociosos).

3. **Princípios 2 (útil) e 4 (compreensível): primeiro uso sem desvio e controles que se explicam.** Persistir o onboarding (ler `hasSeenOnboarding`, `onboarding.js:6`), "Ver a resposta" abrindo a resposta como visitante, favoritos sem exigir conta, menu do versículo alcançável por toque simples e por teclado, ícones das abas corrigidos (livro na Bíblia, marcador nos Artigos), botão de ouvir com rótulo, jargão trocado ("Referências" → "Fontes", "Ferramentas" → "Praticar"). Evidência: §2 E.2 (`App.js:384-388`), §3 B1, E4, E6 (`OnboardingScreen.jsx:49-59` → `App.js:425`), E11 (`ArticleDetailScreen.jsx:199-214`), E15 (`App.js:288-289`), E10 (`BibleScreen.jsx:815-816`), §5 C (menu só por long-press, `BibleScreen.jsx:858-861`), §3 D.

4. **Princípio 6 (honesto): copy que só promete o que existe.** Remover a promessa de sincronização de favoritos (`ArticleDetailScreen.jsx:210`, `AccountPrompt.jsx:20, :104, :106`), tirar o banner "Baixe o app" até haver loja (`WebDownloadBanner.jsx`), apagar ou fazer funcionar a pergunta "Com quem você conversa" (`OnboardingScreen.jsx:122-129`), uma só redação correta de 1 Pedro 3,15 (a da Ave Maria embarcada), "Buscar em todo o app" só quando for verdade. Evidência: §3 B12, B10, B3, B14, B6.

5. **Princípio 9 (ambiental) e 8: movimento com regra e respeito ao sistema.** Um vocabulário de durações e curvas (toque, layout, tela), tudo condicionado a reduce motion, `prefers-color-scheme` honrado quando não há escolha explícita, e a fonte de 1,3 MB do MaterialCommunityIcons fora do caminho da Início. Evidência: §2 D e F (`ScrollHint.jsx:15-40`, 0 ocorrências de `isReduceMotionEnabled`, `prefers-color-scheme` ausente, `app.json:9` `userInterfaceStyle: light`), §2 A (`articleCategories.js:9` puxa `MaterialCommunityIcons.ttf` de 1.307.660 B), §4 G (220, 180, 900 ms sem sistema).

## Antipadrões que o veredito rejeita

- Recomendar REFINE porque o código é grande: custo afundado não é princípio de design.
- Recomendar REDESIGN da arquitetura de informação por causa de telas feias: o escopo é a camada visual e de interação, as abas e rotas ficam.
- Suavizar o 0 do princípio 8: os estados ausentes e o foco removido são fatos medidos, não gosto.
