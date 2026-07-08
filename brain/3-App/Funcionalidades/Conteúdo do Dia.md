---
tags: [funcionalidade]
atualizado: 2026-07-08
aliases: [Dia de Hoje]
---
# Conteúdo do Dia

Página "Dia de Hoje" que reúne em cards tudo o que muda diariamente: versículo, santo, liturgia e notícias católicas.

## Telas

- `src/screens/TodayScreen.jsx` (agregadora dos cards)
- `src/screens/LiturgyScreen.jsx` (liturgia completa, aberta a partir do card)

## Dados

- [[Catálogo de Dados]]
- `src/data/dailyVerses.js` com aprox. 89 versículos curados em julho de 2026, escolha determinística pelo dia do ano (todo mundo vê o mesmo verso no mesmo dia)
- `src/data/saints.js` com aprox. 142 datas no formato MM-DD (aprox. 131 fixas mais as festas móveis calculadas pela data da Páscoa a cada ano)

## Serviços e utilitários

- `src/services/liturgyApi.js` busca a liturgia diária de uma API comunitária (scraping da CNBB) com cache diário em AsyncStorage e fallback para cache antigo quando offline, ver [[Serviços]]
- `src/services/newsApi.js` busca notícias católicas por RSS (ACI Digital, Vatican News, CNA) via rss2json, com cache de 3 horas e no máximo 6 itens
- Componentes: `src/components/VerseOfDayCard.jsx`, `SaintTodayCard.jsx`, `LiturgyCard.jsx`, `NewsCard.jsx`, ver [[Utilitários e Componentes]]

## Como funciona

A tela empilha os cards em uma coluna central com a data por extenso no topo. O versículo do dia e o santo do dia são 100% offline, vêm dos arquivos de dados locais. Liturgia e notícias são as duas exceções de rede do app: ambas usam a estratégia de cache primeiro, rede depois, e cache velho como último recurso, então o card degrada com elegância quando não há conexão. O card do versículo navega para o [[Leitor da Bíblia]] no capítulo certo e também permite compartilhar como imagem. As festas móveis dos santos (Páscoa, Pentecostes, Corpus Christi e outras) são calculadas pelo algoritmo de Meeus/Jones/Butcher dentro de `saints.js`.

## Ligações

- [[Leitor da Bíblia]]
- [[Compartilhamento]]
- [[Decisão - App 100% offline]] (liturgia e notícias são as exceções documentadas)
- [[Serviços]]
