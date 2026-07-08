---
tags: [pesquisa]
atualizado: 2026-07-08
---
# Pesquisa de Concorrência - Capela e Hallow (UI-UX)

Pesquisa profunda feita em julho de 2026 (23 fontes lidas, 20 alegações extraídas,
cada uma verificada por 3 agentes céticos: 18 confirmadas, 2 refutadas e excluídas).
Objetivo: o que copiar de UI/UX e o que adicionar no APPologética, mantendo o foco
em apologética.

## O que ficou provado

### Hallow (líder global, freemium)

- Mantém camada gratuita permanente (rosário diário, evangelho do dia, mais de mil
  sessões), mas avaliações independentes estimam que aprox. 85% da biblioteca fica
  atrás do paywall, apresentado de forma agressiva na primeira semana.
- Justifica a cobrança publicamente num texto transparente ("por que cobramos"):
  app sem anúncios como "lugar de paz", conteúdo custa equipe. Dado interno (auto
  reportado, tratar como afirmação da empresa): quem faz um investimento inicial,
  mesmo só iniciar um trial, fica até 2,4x mais propenso a criar hábito diário.
- Mitiga a exclusão: doa 1 assinatura a cada 1 vendida, clero tem acesso gratuito,
  existe caminho de bolsa pra quem pedir.
- **Anti-padrão documentado (não copiar)**: reclamações recorrentes no BBB de
  cobrança do plano anual (US$ 69,99) durante o trial, antes do fim do período em
  pelo menos um caso, reembolso negado até escalar em reclamação formal, política
  "all sales final" e conversão automática se não cancelar 24h antes. A fricção de
  cobrança domina os reviews negativos do Hallow.

### Capela (Minha Biblioteca Católica, lançado em out/2025, 100% gratuito)

- App devocional (oração, liturgia, Bíblia com busca/notas/destaques, 300+ orações,
  novenas, exame de consciência), meta declarada de 1 milhão de usuários. Não é
  concorrente de conteúdo do APPologética (não faz apologética), só de padrões de UX.
- Home montada por painel administrativo no-code: a equipe edita banners, atalhos e
  listas sem lançar versão nova, cronometrado pelo calendário litúrgico. (Fonte é o
  case da agência que construiu o app, ou seja, marketing: tratar com sal.)
- Retenção central: plano de vida espiritual personalizável com metas e progresso,
  incluindo adotar planos criados por outros. Sem streak (nenhuma fonte achou).
  Deeplinks de compartilhamento e dark mode desde o lançamento.

## O que NÃO ficou provado (perguntas abertas)

- Como é visualmente a UI do Hallow (home, player, tipografia, o que dá a sensação
  "premium"): nenhuma alegação visual sobreviveu à verificação. Fechar esse buraco
  exige usar os apps de verdade e analisar capturas de tela.
- Se o Hallow usa streaks, widgets, desafios (Pray40) e comunidade com eficácia.
- Como o Capela se sustenta sendo gratuito (hipótese de funil pro clube de livros
  da MBC foi refutada por falta de evidência).
- Preço real do Hallow Plus no Brasil em reais.

## Síntese acionável para o APPologética

### Copiar ou adaptar (prioridade)

1. **Plano com metas e progresso adotável**: evoluir os 2 trilhos do
   [[Plano de Leitura]] para planos com meta, progresso visível e trilhas temáticas
   adotáveis (ex.: "30 dias respondendo objeções protestantes"). Retenção sem
   gamificação forçada, comprovada no Capela.
2. **Busca full-text offline na Bíblia**: o Capela anuncia busca na Bíblia inteira;
   a nossa [[Busca]] só cobre versículos curados. Os dados já estão no bundle,
   é lacuna concreta e viável.
3. **Deeplinks de compartilhamento** de artigos e referências (aquisição orgânica,
   presente no Capela desde o dia 1).
4. **Bloco dinâmico na home por calendário litúrgico local**: versão offline-first
   da home editável do Capela (JSON versionado + tempo litúrgico calculado no
   aparelho reordenando destaques, sem servidor).
5. **Transparência de modelo**: página "por que é grátis" hoje e, se o premium
   vier, um "por que cobramos" ao estilo Hallow, com camada gratuita generosa
   incluindo o núcleo apologético (artigos, Bíblia, referências).

### Evitar

- Trial com conversão automática opaca, reembolso discricionário e paywall
  agressivo na primeira semana (a fonte dominante de reviews negativos do Hallow).
- Virar app devocional genérico: Capela e Hallow já dominam oração. O diferencial
  defensável é apologética (artigos com fontes, diálogos de objeção e resposta,
  quiz), nicho que nenhum dos dois cobre.

## Ligações

- [[Roteiro de Ideias (Roadmap)]]
- [[Pesquisa de Mercado (resumo)]]
- [[Plano de Leitura]] | [[Busca]] | [[Conteúdo do Dia]]

## Fontes principais

- hallow.com/blog/why-do-we-charge-for-hallow-plus (texto oficial do paywall)
- help.hallow.com (políticas de trial, cancelamento e reembolso)
- bbb.org: reclamações contra o Hallow (2023-2026)
- vaticannews.va (out/2025): lançamento do Capela
- bibliotecacatolica.com.br/capela e case da agência Fleye (marketing do vendor)
