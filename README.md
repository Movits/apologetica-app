<div align="center">

<img src="assets/icon.png" alt="APPologética" width="120" />

# ✝ APPologética

**Evangelização e apologética católica no seu bolso — 100% offline.**

> *"Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós."*
>
> — 1 Pedro 3,15

<br />

![Expo](https://img.shields.io/badge/Expo-SDK%2054-1a3a5c?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-1a3a5c?style=for-the-badge&logo=react&logoColor=c9a84c)
![Android & iOS](https://img.shields.io/badge/Android%20%26%20iOS-1a3a5c?style=for-the-badge&logo=android&logoColor=white)
![Offline](https://img.shields.io/badge/100%25-Offline-c9a84c?style=for-the-badge&labelColor=1a3a5c)
![Licença MIT](https://img.shields.io/badge/Licença-MIT-c9a84c?style=for-the-badge&labelColor=1a3a5c)

</div>

---

## 📖 Sobre o app

**APPologética** é um aplicativo católico de evangelização e apologética. Reúne, num só lugar
e **funcionando sem internet**, os argumentos, versículos e documentos que você precisa para
explicar e defender a fé — além de ferramentas de oração e estudo para o dia a dia.

Disponível em **português e inglês**, com **modo claro e escuro**.

---

## ✨ Funcionalidades

- 🏠 **Início** — escolha um tema de apologética e comece a ler na hora.
- 📚 **Artigos** — textos organizados por seção: Existência de Deus, Igreja Católica, Sagrada
  Escritura, Moral, Outras Religiões e História da Igreja. Cada seção tem seu próprio cabeçalho ao rolar.
- 🔖 **Referências** — versículos bíblicos, parágrafos do Catecismo e documentos da Igreja,
  agrupados por fonte, com o texto original (grego/hebraico/latim) quando relevante.
- 📕 **Bíblia** — 73 livros completos: **Ave Maria** (PT) e **Douay-Rheims** (EN), navegação entre capítulos.
- 🌅 **Dia de Hoje** — versículo do dia, santo do dia e liturgia diária.
- 🧰 **Ferramentas** — Santo Rosário, Plano de Leitura, Exame de Consciência, Quiz da Fé,
  Modo Diálogo (treine respostas a objeções), Glossário e "Nos Passos de Jesus".
- ⭐ **Seu estudo** — favoritos, marcações e notas (sincronizados na sua conta).
- 🌐 **PT / EN** e 🌙 **modo escuro**.

---

## 🚀 Como baixar e testar no seu celular

A forma mais fácil de testar é com o app **Expo Go** — você roda o projeto direto no seu
telefone, **sem precisar instalar nada complicado nem gerar um APK**.

### 1. Instale o Node.js no computador
Baixe a versão **LTS** em [nodejs.org](https://nodejs.org/) e instale (next, next, finish).
Isso também instala o `npm`, que usamos abaixo.

### 2. Instale o app "Expo Go" no celular
- **Android:** [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 3. Baixe o projeto
Abra o **Terminal** (ou **Prompt de Comando** no Windows) e rode:

```bash
git clone https://github.com/Movits/apologetica-app.git
cd apologetica-app
```

> Não tem o Git? Dá pra baixar em [git-scm.com](https://git-scm.com/) — ou clique em
> **Code ▸ Download ZIP** aqui no GitHub, extraia e abra a pasta no terminal.

### 4. Instale as dependências (só na primeira vez)

```bash
npm install
```

### 5. Inicie o app

```bash
npx expo start
```

Vai aparecer um **QR Code** no terminal.

### 6. Abra no celular
- **Android:** abra o **Expo Go** ▸ *Scan QR code* e aponte para o QR do terminal.
- **iPhone:** abra a **Câmera** normal, aponte para o QR e toque na notificação.

Pronto! O app abre no seu celular. 🎉

> 💡 **O celular e o computador precisam estar no mesmo Wi-Fi.**
> Se o QR não conectar (Wi-Fi corporativo, etc.), rode `npx expo start --tunnel`.

> 🔑 **Não precisa criar conta para testar** — na tela inicial escolha **"Continuar como
> visitante"**. A conta só é necessária para salvar favoritos, marcações e notas.

---

## 🛠️ Rodando em emulador (opcional, para devs)

```bash
npm run android   # emulador Android (Android Studio instalado)
npm run ios       # simulador iOS (somente macOS, com Xcode)
```

---

## 🧱 Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Framework | React Native + **Expo SDK 54** |
| Navegação | React Navigation (bottom tabs + native stack) |
| Estado | Context API (tema, idioma, autenticação) |
| Auth / dados do usuário | Firebase (Auth + Firestore) |
| Conteúdo | Estático em `src/data/` — **roda offline** |
| Ícones | `@expo/vector-icons` (Ionicons + MaterialCommunityIcons) |

---

## 📂 Estrutura do projeto

```
App.js                 # navegação raiz (tabs + stacks)
src/
  screens/             # telas (Início, Artigos, Referências, Bíblia, Ferramentas...)
  components/           # componentes reutilizáveis (cards, banners, ícones)
  context/             # ThemeContext, LanguageContext, AuthContext
  data/                # artigos, referências, Bíblia, santos, quiz... (estático)
    articles/          # artigos divididos por categoria
  services/            # Firebase, liturgia, Bíblia, notificações
  i18n/                # textos em PT e EN
assets/                # ícones, splash e imagens
```

---

## 🤝 Como colaborar

Toda ajuda é bem-vinda! Você pode contribuir de três formas:

1. **Reportar um problema ou sugerir algo** — abra uma [Issue](https://github.com/Movits/apologetica-app/issues)
   descrevendo o bug ou a ideia (pode ser em português mesmo).
2. **Sugerir conteúdo** — novos artigos, referências ou correções teológicas.
3. **Mandar código** — faça um *fork*, crie um branch e abra um *Pull Request*:

```bash
git checkout -b minha-melhoria
# faça suas mudanças
git commit -m "descreve o que mudou"
git push origin minha-melhoria
```

### Onde mexer no conteúdo
- **Artigos:** `src/data/articles/<categoria>.js` (juntados por `src/data/articles/index.js`).
- **Referências (versículos / Catecismo / documentos):** `src/data/references.js`.
- **Traduções de textos da interface:** `src/i18n/strings.js`.

---

## 📜 Licença

Distribuído sob a licença **MIT**. Sinta-se livre para usar, estudar e contribuir.

<div align="center">

---

*Feito com fé. ✝*

</div>
