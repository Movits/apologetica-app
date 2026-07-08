# Guia do projeto (para humanos)

Mapa de tudo que existe nesta pasta, em linguagem simples.

> ⚠️ **Importante:** as pastas e arquivos com nome técnico têm esse nome
> porque as ferramentas (Expo, Google, GitHub) **exigem** exatamente esse
> nome. Renomear qualquer um deles quebra o app ou o site. As pastas que
> são suas de verdade, com nome em português, são `fotos/` e `documentos/`.

## Suas pastas (pode mexer à vontade)

| Pasta | O que é |
|---|---|
| `fotos/` | Fotos que VOCÊ adiciona para o site (a landing page). Tem um LEIA-ME dentro explicando. |
| `documentos/` | Suas pesquisas e anotações: pesquisa de mercado, pesquisa de público, lista dos 100 tópicos, créditos das imagens, rascunhos. Nada daqui afeta o app. |
| `brain/` | Seu segundo cérebro: notas em português que explicam o projeto inteiro, conectadas entre si. Abra com o Obsidian apontando para esta pasta (ou para a raiz do projeto). Comece pela nota `Início`. |

## O aplicativo

| Item | O que é |
|---|---|
| `src/` | O código do aplicativo em si: telas, navegação, Bíblia, artigos, quiz, tudo. |
| `assets/` | Imagens e ícones que vão DENTRO do app (ícone do app, obras dos artigos, mapa). Não renomear nada aqui: o código aponta para cada arquivo pelo nome. |
| `App.js` | A "porta de entrada" do app: monta as abas e as telas. |
| `scripts/` | Ferramentas internas usadas de vez em quando (converter a Bíblia, gerar ícones). Não rodam dentro do app. |

## O site (landing page)

| Item | O que é |
|---|---|
| `docs/` | As páginas do site: landing (`index.html`), privacidade, termos e doação. |
| `.github/` | O "robô" do GitHub: a cada push no master, ele monta e publica o site sozinho. |

## Configurações (não mexer sem avisar)

| Item | O que é |
|---|---|
| `app.json` / `app.config.js` | Identidade do app pro Expo: nome, ícone, cores da splash. |
| `eas.json` | Configuração pra gerar o app de loja (Android/iOS). |
| `package.json` / `package-lock.json` | Lista de bibliotecas que o app usa e seus comandos. |
| `babel.config.js` / `metro.config.js` | Como o código é traduzido/empacotado pro celular. |
| `firestore.rules` | Regras de segurança do banco de dados (notas, favoritos). |
| `.eslintrc.json` | Regras do verificador de qualidade do código (`npm run lint`). |
| `.npmrc` / `.gitignore` | Miudezas: config do npm e lista do que o git deve ignorar. |
| `CLAUDE.md` | Instruções para o Claude (eu) trabalhar neste projeto. |
| `README.md` | A vitrine do projeto no GitHub. |

## Pastas geradas automaticamente (podem até ser apagadas, voltam sozinhas)

| Item | O que é |
|---|---|
| `node_modules/` | As bibliotecas instaladas (`npm install` recria). |
| `.expo/`, `.tmp/`, `dist/` | Caches e builds temporários. |
| `.secrets/`, `.env.local` | Chaves privadas (Firebase). NUNCA commitar nem compartilhar. |

## Onde colocar coisas novas

- **Foto para o site** → `fotos/` (e me avisa pra eu usar)
- **Documento, pesquisa, anotação** → `documentos/`
- **Qualquer dúvida** → me pergunta antes de mover arquivo de outra pasta
