---
tags: [site]
atualizado: 2026-07-08
---
# Site (Landing Page)

Página de apresentação do app hospedada no GitHub Pages. É HTML puro num arquivo só, sem framework nem build, ver [[Decisão - Landing em HTML puro]].

## Arquivos

- `docs/index.html` é a landing inteira (aprox. 690 linhas em julho de 2026): CSS, HTML e JS inline.
- `docs/privacy.html`, `docs/terms.html` e `docs/donate.html` são as páginas de privacidade, termos e apoio, linkadas no rodapé.
- A versão web do app (export do Expo) fica publicada em `/app`, os botões "Abrir app" apontam para `app/`.

## Hero

- Imagem de fundo: São Miguel Arcanjo de Guido Reni (1635, domínio público), servida do arquivo local `fotos/sao-miguel.jpg` (a pasta `fotos/` é copiada no deploy, ver [[Decisão - Pastas fotos e documentos na raiz]]).
- Se o arquivo local faltar, o `onerror` da imagem chama `artFallback` e cai para cópias remotas da mesma obra.
- Efeito de god-rays (feixes de luz) via a classe `.rays`, com parallax suave no scroll e respeito a `prefers-reduced-motion`.

## Seções

- Contadores animados que sobem quando entram na tela: 73 livros bíblicos, 85+ artigos com fontes, 2 idiomas, 100% offline e gratuito.
- Grid de features com 6 cards (Bíblia, artigos, quiz, diálogos, ferramentas de oração etc.), com hover e animação de reveal.
- CTAs para abrir a versão web e footer com links legais e de apoio.

## Tema e idioma sincronizados com o app

A landing lê e grava as mesmas chaves de `localStorage` que a versão web do app usa:

- `appg_theme` (claro ou escuro)
- `appg_lang` (pt ou en)

Assim, quem troca o tema ou idioma na landing abre o app web já do jeito certo, e vice-versa. Todos os textos da página têm versão PT e EN via atributos `data-i18n`.

## Ligações

- [[Deploy e Publicação]] (como a página vai ao ar)
- [[Decisão - Landing em HTML puro]]
- [[Decisão - Pastas fotos e documentos na raiz]]
