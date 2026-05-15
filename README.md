# APPologética

App mobile de evangelização e apologética católica, desenvolvido com React Native (Expo).

## Funcionalidades

- **Biblioteca de Artigos** — textos sobre existência de Deus, Igreja Católica, Escritura, moral e mais. Busca por texto e filtro por categoria.
- **Versículos e Referências** — versículos bíblicos, parágrafos do CIC e documentos da Igreja organizados por tema. Busca e filtro por fonte.
- **Tela Inicial** — acesso rápido às seções com versículo de apresentação.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g expo-cli
```

## Rodando o projeto

```bash
npm install
npm start          # abre o Expo DevTools
npm run android    # abre no emulador Android
npm run ios        # abre no simulador iOS (requer macOS)
```

Escaneie o QR code com o app **Expo Go** no seu celular para testar em dispositivo físico.

## Estrutura

```
src/
  screens/       # telas do app
  data/          # artigos e referências (dados estáticos)
  components/    # componentes reutilizáveis
assets/          # ícones e splash screen
```

## Expandindo o conteúdo

Para adicionar artigos, edite [`src/data/articles.js`](src/data/articles.js) seguindo o modelo existente.  
Para adicionar referências bíblicas ou do CIC, edite [`src/data/references.js`](src/data/references.js).

## Licença

MIT
