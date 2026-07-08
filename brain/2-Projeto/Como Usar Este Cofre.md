---
tags: [manutencao]
atualizado: 2026-07-08
---
# Como Usar Este Cofre

Guia rápido para o dono do projeto usar este segundo cérebro sem precisar entender de código.

## Como abrir

Abra o Obsidian e aponte para a pasta do projeto (ou só para a pasta `brain/`, se preferir ver apenas as notas). Comece sempre pela nota [[Início]], que é a porta de entrada.

## Como navegar

Quatro áreas, do mais vivo pro mais estável:

1. `1-Memória`: diário de sessões, [[Aprendizados]] e pendências. É o que a IA
   lê primeiro ao retomar o trabalho e atualiza ao terminar.
2. `2-Projeto`: decisões, convenções, verificação, pesquisas, site e deploy.
3. `3-App`: arquitetura e funcionalidades, com a tabela tela por tela.
4. `4-Conteúdo`: catálogo curado + grafo gerado (pastas "... do App" e
   "Termos do Glossário" são geradas por script, não editar à mão).

## Vocabulário de tags

Cada nota tem tags no topo que dizem o tipo dela: `mapa`, `arquitetura`, `funcionalidade`, `dado`, `servico`, `site`, `pesquisa`, `decisao`, `manutencao` e `ideia`. No Obsidian dá para clicar numa tag e ver todas as notas daquele tipo.

## Quando atualizar

Mudou a estrutura do projeto ou tomou uma decisão importante? Atualize a nota correspondente e o campo `atualizado` do topo dela. Para registrar uma decisão nova, crie uma nota em `brain/7-Decisões/` seguindo o modelo fixo das existentes: Contexto, Decisão, Motivo e Consequências.

## O grafo de conteúdo (pasta 9-Conteúdo)

As notas de artigos, referências e diálogos são GERADAS pelos dados do app, não escritas à mão. Mudou um artigo, adicionou referência ou diálogo? Rode no terminal do projeto:

```
node scripts/generate-brain.mjs
```

As subpastas geradas de 4-Conteúdo são recriadas inteiras. Por isso, nunca edite essas notas diretamente: anote ideias nas áreas 1 a 3 (ou nas notas curadas de 4-Conteúdo), ou mude os dados do app e regenere.

## Detalhe técnico único

A pasta `brain/.obsidian/` (configuração pessoal do Obsidian, tema, atalhos) fica fora do git de propósito. Pode personalizar à vontade que nada disso vai para o repositório.

## Ligações

- [[Início]]
- [[Convenções do Projeto]]
- [[Decisão - Pastas fotos e documentos na raiz]]
