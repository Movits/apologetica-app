---
tags: [memoria]
atualizado: 2026-07-08
---
# Aprendizados

Lições permanentes do projeto. Cada item é algo que já custou tempo uma vez e
não precisa custar de novo. A IA e o dono do projeto adicionam aqui sempre que
uma descoberta valer pra sempre. Nunca apagar itens, só marcar como obsoletos.

## Sobre o código

- Os arquivos de artigos usam `require()` de imagens, coisa do Metro. Node puro
  não roda: qualquer script que leia esses dados precisa trocar o `require` por
  null antes de importar (o `scripts/generate-brain.mjs` faz isso).
- A aba Bíblia nunca desmonta ao trocar de aba. Efeito de limpeza por unmount
  não basta: usar o evento `blur` da navegação (foi a causa do TTS fantasma).
- `colors.mode` só existe no tema escuro. Usar `darkMode` do `useTheme()`.
- A fonte da Bíblia Ave Maria (`_avemaria_raw.json`) é gitignored de propósito.
  O script `convert-avemaria.mjs` não está quebrado, só precisa da fonte.
- Chaves do i18n com prefixo dinâmico (`category.*`, `source.*`, `plan.track.*`)
  não aparecem em grep por chave completa. Proteger antes de limpar.

## Sobre o site e deploy

- O workflow copia apenas `docs/*.html` e as pastas `fotos/` e `dist/`. Asset
  novo no site exige ajuste no workflow ou ficar inline no HTML.
- O nome de arquivo da obra de São Miguel no Wikimedia é `Guido Reni 031.jpg`.
  O nome do Google Art Project não existe (deu requisições falhas por dias).
- Imagem local carrega antes do primeiro frame: efeito de fade precisa esperar
  dois `requestAnimationFrame` pra ter de onde partir.

## Sobre o vault (este cofre)

- Links `[[assim]]` apontam pra NOMES de nota, não caminhos. Mover pastas é de
  graça, renomear notas quebra links.
- Nome de cofre diferente do nome da pasta é sinal de cofre criado no lugar
  errado (cofre novo copia nada e vive em outra pasta, congelado no tempo).
- Windows não aceita `\\ / : * ? " < > |` em nomes de arquivo. O gerador saneia.

## Sobre o processo

- Toda remoção de código precisa de: grep individual, lint 0 erros e
  `npx expo export -p web` verde. O trio pegou tudo até hoje.
- Relatórios de agentes exploradores podem errar em detalhe. Reverificar cada
  achado no código atual antes de corrigir (dois "bugs" já estavam corrigidos).
