// Strings de UI traduzidas. Estrutura: STRINGS[lang][key].
// Chave segue padrão dot.case: 'screen.element'.
// Se uma chave faltar em EN, cai pro PT (definido em LanguageContext).

export const STRINGS = {
  pt: {
    // === Geral / botões ===
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.remove': 'Remover',
    'common.share': 'Compartilhar',
    'common.next': 'Próximo',
    'common.prev': 'Anterior',
    'common.back': 'Voltar',
    'common.close': 'Fechar',
    'common.open': 'Abrir',
    'common.confirm': 'Confirmar',
    'common.loading': 'Carregando...',
    'common.search': 'Buscar',
    'common.notFound': 'Não encontrado.',
    'common.tryAgain': 'Tentar novamente',
    'common.yes': 'Sim',
    'common.no': 'Não',

    // === Tabs ===
    'tab.home': 'Início',
    'tab.articles': 'Artigos',
    'tab.references': 'Referências',
    'tab.bible': 'Bíblia',
    'tab.settings': 'Ajustes',

    // === Headers de rotas (mostrados na navigation bar) ===
    'header.favorites': 'Meus Favoritos',
    'header.glossary': 'Glossário',
    'header.readingPlan': 'Plano de Leitura',
    'header.rosary': 'Santo Rosário',
    'header.exam': 'Exame de Consciência',
    'header.highlights': 'Minhas Marcações',
    'header.notes': 'Minhas Notas',
    'header.search': 'Buscar',
    'header.liturgy': 'Liturgia Diária',
    'header.article': 'Artigo',
    'header.reference': 'Referência',
    'header.quiz': 'Quiz Apologético',
    'header.dialogue': 'Modo Diálogo',
    'header.debate': 'Estratégias de Debate',
    'debate.all': 'Todas',
    'debate.tactics': 'Táticas',
    'debate.fallacies': 'Falácias',
    'debate.search': 'Buscar tática ou falácia...',
    'debate.example': 'Exemplo',
    'debate.respond': 'Como responder',
    'debate.use': 'Como usar',
    'header.catechism': 'Catecismo',
    'header.bibleMap': 'Nos Passos de Jesus',
    'header.articles': 'Artigos',
    'header.tools': 'Ferramentas',
    'header.today': 'Dia de Hoje',
    'header.notebook': 'Caderno',
    'header.noteEditor': 'Editar Nota',

    // === Home ===
    'home.search': 'Buscar em todo o app...',
    'home.section.learn': 'O que você quer aprender?',
    'home.section.spirituality': 'Espiritualidade',
    'home.section.training': 'Treino',
    'home.section.study': 'Meu Estudo',
    'home.card.tools': 'Ferramentas',
    'home.card.toolsSub': 'Orações, treino e estudo',
    'home.card.today': 'Dia de Hoje',
    'home.card.todaySub': 'Versículo e liturgia do dia',
    'home.card.notebook': 'Caderno',
    'home.card.notebookSub': 'Suas anotações livres com referências',
    'home.card.articles': 'Artigos de Apologética',
    'home.card.articlesSub': 'Textos para responder dúvidas',
    'home.card.references': 'Versículos e Referências',
    'home.card.referencesSub': 'Bíblia, Catecismo, documentos',
    'home.card.bible': 'Bíblia Sagrada',
    'home.card.bibleSub': 'Leia as Escrituras no app',
    'home.card.readingPlan': 'Plano de Leitura',
    'home.card.readingPlanSub': 'Fundamentos da fé em 30 dias',
    'home.card.rosary': 'Santo Rosário',
    'home.card.rosarySub': 'Mistérios e orações',
    'home.card.exam': 'Exame de Consciência',
    'home.card.examSub': 'Preparação para Confissão',
    'home.card.glossary': 'Glossário Teológico',
    'home.card.glossarySub': 'Termos explicados',
    'home.card.quiz': 'Quiz Apologético',
    'home.card.quizSub': 'Pergunta nova todo dia',
    'home.card.dialogue': 'Modo Diálogo',
    'home.card.dialogueSub': 'Treine respostas para objeções',
    'home.card.debate': 'Estratégias de Debate',
    'home.card.debateSub': 'Táticas e como rebater falácias',
    'home.card.map': 'Nos Passos de Jesus',
    'home.card.mapSub': 'Acompanhe o caminho de Cristo',
    'home.card.favorites': 'Meus Favoritos',
    'home.card.highlights': 'Minhas Marcações',
    'home.card.notes': 'Minhas Notas',
    'home.verse.label': 'Versículo do dia',
    'home.verse.readContext': 'Ler',
    'home.verse.shareText': 'Texto',
    'home.verse.shareImage': 'Imagem',
    'home.hero.verse': 'Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós.',
    'home.hero.ref': '1 Pedro 3,15',

    // === Settings ===
    'settings.section.appearance': 'Aparência',
    'settings.section.notifications': 'Notificações',
    'settings.section.content': 'Conteúdo e devoção',
    'settings.section.language': 'Idioma',
    'settings.section.account': 'Conta',
    'settings.section.diagnostic': 'Diagnóstico',
    'settings.section.donate': 'Apoie o projeto',
    'settings.section.privacy': 'Privacidade e Termos',
    'settings.section.about': 'Sobre',
    'settings.darkMode': 'Modo escuro',
    'settings.fontSize': 'Tamanho da fonte',
    'settings.voice': 'Voz',
    'settings.speed': 'Velocidade',
    'settings.notif.daily': 'Versículo do dia',
    'settings.notif.sunday': 'Liturgia de domingo',
    'settings.notif.friday': 'Sexta-feira de penitência',
    'settings.notif.quiz': 'Quiz apologético diário',
    'settings.notif.test': 'Enviar notificação de teste',
    'settings.language.label': 'Idioma do aplicativo',
    'settings.language.pt': 'Português',
    'settings.language.en': 'English',
    'settings.logout': 'Sair da conta',
    'settings.privacy': 'Política de Privacidade',
    'settings.terms': 'Termos de Uso',
    'settings.donate': 'Fazer uma doação',
    'settings.donateSub': 'Via PIX. Qualquer valor ajuda a manter o app gratuito.',
    'settings.sentry.test': 'Enviar erro de teste (Sentry)',
    'settings.sentry.testSub': 'Confirma que o crash reporting está ligado',

    // === Bible ===
    'bible.searchPlaceholder': 'Buscar versículo...',
    'bible.chapter': 'Capítulo',
    'bible.verse': 'Versículo',
    'bible.book': 'Livro',
    'bible.testament.ot': 'Antigo Testamento',
    'bible.testament.nt': 'Novo Testamento',

    // === Articles ===
    'articles.all': 'Todos',
    'articles.references': 'Referências',
    'articles.referencesHint': 'Toque em qualquer referência para abrir o texto completo.',
    'articles.continueReading': 'Continue lendo em',
    'articles.relatedTitle': 'Ver também',
    'articles.notAvailable': 'A tradução deste artigo para o inglês está em andamento.',

    // === Catechism ===
    'catechism.title': 'Catecismo da Igreja Católica',
    'catechism.subtitle': 'Texto oficial do Magistério',
    'catechism.searchPlaceholder': 'Buscar parágrafo ou tema...',
    'catechism.section': 'Seção',
    'catechism.paragraph': 'Parágrafo',
    'catechism.partial': 'Texto completo (2865 parágrafos) disponível em inglês. Tradução para português curada em parágrafos chave; o restante mostra o texto em inglês com indicação.',
    'catechism.openVatican': 'Abrir no site do Vaticano',

    // === Map ===
    'map.title': 'Mapa Bíblico',
    'map.subtitle': 'Toque em um lugar para ver detalhes',
    'map.history': 'História',
    'map.archaeology': 'Arqueologia',
    'map.related': 'Textos relacionados',

    // === Quiz ===
    'quiz.daily': 'Quiz do dia',
    'quiz.practice': 'Praticar com 10 perguntas',
    'quiz.streak': 'dias',
    'quiz.correct': 'Acertou',
    'quiz.wrong': 'Resposta correta:',
    'quiz.readArticle': 'Ler o artigo completo',
    'quiz.next': 'Próxima pergunta',
    'quiz.result': 'Resultado',
    'quiz.scoreText': 'Você acertou {{score}} de {{total}}',
    'quiz.practiceAgain': 'Praticar mais 10',

    // === Dialogue ===
    'dialogue.title': 'Modo Diálogo',
    'dialogue.subtitle': 'Treine respostas para as objeções mais comuns.',
    'dialogue.someoneSays': 'Alguém te diz',
    'dialogue.nextStep': 'Próximo passo',
    'dialogue.chooseOther': 'Escolher outra objeção',

    // === Onboarding ===
    'onboarding.skip': 'Pular',
    'onboarding.next': 'Próximo',
    'onboarding.start': 'Começar',

    // === Auth ===
    'auth.login': 'Entrar',
    'auth.signup': 'Criar conta',
    'auth.signupNew': 'Criar conta nova',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.guest': 'Continuar sem conta',
    'auth.forgotPassword': 'Esqueci a senha',
    'auth.createFree': 'Criar conta grátis',
    'auth.notNow': 'Agora não',
    'home.continueReading': 'Continue lendo',
    'home.todayLiturgy': 'Liturgia de hoje',
    'home.saintToday': 'Santo do dia',
    'auth.subtitle': 'Entre na sua conta para continuar',
    'auth.recoverTitle': 'Recuperar senha',
    'auth.sendLink': 'Enviar link',
    'auth.backToLogin': 'Voltar ao login',

    // === Bible Screen ===
    'bible.books': 'Livros',
    'bible.chapterPrep': 'Capítulo em preparação',
    'bible.markColor': 'Marcar com cor',
    'bible.annotate': 'Anotar',
    'bible.copy': 'Copiar',

    // === Catechism Screen ===
    'catechism.structure': 'Estrutura',
    'catechism.available': 'Parágrafos disponíveis',

    // === Search ===
    'search.recent': 'Buscas recentes',
    'search.clear': 'Limpar',
    'search.empty': 'Nada encontrado',
    'search.tapToOpen': 'Toque para abrir',

    // === Empty states ===
    'empty.favorites': 'Nenhum favorito ainda',
    'empty.highlights': 'Nenhuma marcação ainda',
    'empty.notes': 'Nenhuma nota ainda',
    'empty.createAccount': 'Crie uma conta',

    // === Reading Plan ===
    'plan.reset': 'Reiniciar progresso',

    // === References ===
    'ref.readInApp': 'Ler no app',
    'ref.openSource': 'Abrir fonte oficial',
    'ref.openCatechism': 'Abrir no Catecismo',

    // === Note Editor ===
    'note.delete': 'Excluir nota',

    // === Liturgy ===
    'liturgy.errorTitle': 'Não consegui carregar',

    // === Settings extras ===
    'settings.guest.title': 'Você está como visitante',
    'settings.guest.sub': 'Toque para criar uma conta',
    'settings.darkMode.label': 'Modo escuro',
    'settings.font.label': 'Tamanho da letra',

    // === Categorias dos artigos ===
    'category.Existência de Deus': 'Existência de Deus',
    'category.Igreja Católica': 'Igreja Católica',
    'category.Sagrada Escritura': 'Sagrada Escritura',
    'category.Moral': 'Moral',
    'category.Outras Religiões': 'Outras Religiões',
    'category.História da Igreja': 'História da Igreja',
    'category.Existência de Deus.desc': 'Argumentos racionais para a existência de Deus',
    'category.Igreja Católica.desc': 'Papado, sacramentos, Maria e os santos',
    'category.Sagrada Escritura.desc': 'Bíblia, Tradição e como interpretá-las',
    'category.Moral.desc': 'Vida, sexualidade e lei natural',
    'category.Outras Religiões.desc': 'Islã, espiritismo, ateísmo e mais',
    'category.História da Igreja.desc': 'Cruzadas, Inquisição e mitos comuns',

    // === Descrições das fontes de referência ===
    'source.Bíblia.desc': 'Versículos das Escrituras',
    'source.Catecismo.desc': 'Catecismo da Igreja Católica',
    'source.Documentos.desc': 'Concílios, encíclicas e documentos',
    'source.Teólogos.desc': 'Padres, doutores e estudiosos',
    'source.Outros.desc': 'Fontes históricas e externas',
  },

  en: {
    // === Common ===
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.remove': 'Remove',
    'common.share': 'Share',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.notFound': 'Not found.',
    'common.tryAgain': 'Try again',
    'common.yes': 'Yes',
    'common.no': 'No',

    // === Tabs ===
    'tab.home': 'Home',
    'tab.articles': 'Articles',
    'tab.references': 'References',
    'tab.bible': 'Bible',
    'tab.settings': 'Settings',

    // === Route headers ===
    'header.favorites': 'My Favorites',
    'header.glossary': 'Glossary',
    'header.readingPlan': 'Reading Plan',
    'header.rosary': 'Holy Rosary',
    'header.exam': 'Examination of Conscience',
    'header.highlights': 'My Highlights',
    'header.notes': 'My Notes',
    'header.search': 'Search',
    'header.liturgy': 'Daily Liturgy',
    'header.article': 'Article',
    'header.reference': 'Reference',
    'header.quiz': 'Apologetics Quiz',
    'header.dialogue': 'Dialogue Mode',
    'header.debate': 'Debate Strategies',
    'debate.all': 'All',
    'debate.tactics': 'Tactics',
    'debate.fallacies': 'Fallacies',
    'debate.search': 'Search tactic or fallacy...',
    'debate.example': 'Example',
    'debate.respond': 'How to respond',
    'debate.use': 'How to use',
    'header.catechism': 'Catechism',
    'header.bibleMap': 'In Jesus\' Footsteps',
    'header.articles': 'Articles',
    'header.tools': 'Tools',
    'header.today': 'Today',
    'header.notebook': 'Notebook',
    'header.noteEditor': 'Edit Note',

    // === Home ===
    'home.search': 'Search in the app...',
    'home.section.learn': 'What do you want to learn?',
    'home.section.spirituality': 'Spirituality',
    'home.section.training': 'Training',
    'home.section.study': 'My Study',
    'home.card.tools': 'Tools',
    'home.card.toolsSub': 'Prayers, practice and study',
    'home.card.today': 'Today',
    'home.card.todaySub': 'Verse and liturgy of the day',
    'home.card.notebook': 'Notebook',
    'home.card.notebookSub': 'Your free notes with references',
    'home.card.articles': 'Apologetics Articles',
    'home.card.articlesSub': 'Answers for common questions',
    'home.card.references': 'Verses and References',
    'home.card.referencesSub': 'Bible, Catechism, documents',
    'home.card.bible': 'Holy Bible',
    'home.card.bibleSub': 'Read Scripture in the app',
    'home.card.readingPlan': 'Reading Plan',
    'home.card.readingPlanSub': 'Faith foundations in 30 days',
    'home.card.rosary': 'Holy Rosary',
    'home.card.rosarySub': 'Mysteries and prayers',
    'home.card.exam': 'Examination of Conscience',
    'home.card.examSub': 'Preparation for Confession',
    'home.card.glossary': 'Theological Glossary',
    'home.card.glossarySub': 'Terms explained',
    'home.card.quiz': 'Apologetics Quiz',
    'home.card.quizSub': 'A new question every day',
    'home.card.dialogue': 'Dialogue Mode',
    'home.card.dialogueSub': 'Practice responses to objections',
    'home.card.debate': 'Debate Strategies',
    'home.card.debateSub': 'Tactics and how to counter fallacies',
    'home.card.map': 'In Jesus\' Footsteps',
    'home.card.mapSub': 'Follow the path of Christ',
    'home.card.favorites': 'My Favorites',
    'home.card.highlights': 'My Highlights',
    'home.card.notes': 'My Notes',
    'home.verse.label': 'Verse of the day',
    'home.verse.readContext': 'Read',
    'home.verse.shareText': 'Text',
    'home.verse.shareImage': 'Image',
    'home.hero.verse': 'Always be ready to give an answer to anyone who asks you the reason for the hope that is in you.',
    'home.hero.ref': '1 Peter 3:15',

    // === Settings ===
    'settings.section.appearance': 'Appearance',
    'settings.section.notifications': 'Notifications',
    'settings.section.content': 'Content and devotion',
    'settings.section.language': 'Language',
    'settings.section.account': 'Account',
    'settings.section.diagnostic': 'Diagnostic',
    'settings.section.donate': 'Support the project',
    'settings.section.privacy': 'Privacy and Terms',
    'settings.section.about': 'About',
    'settings.darkMode': 'Dark mode',
    'settings.fontSize': 'Font size',
    'settings.voice': 'Voice',
    'settings.speed': 'Speed',
    'settings.notif.daily': 'Verse of the day',
    'settings.notif.sunday': 'Sunday liturgy',
    'settings.notif.friday': 'Friday penance',
    'settings.notif.quiz': 'Daily apologetics quiz',
    'settings.notif.test': 'Send test notification',
    'settings.language.label': 'App language',
    'settings.language.pt': 'Português',
    'settings.language.en': 'English',
    'settings.logout': 'Sign out',
    'settings.privacy': 'Privacy Policy',
    'settings.terms': 'Terms of Use',
    'settings.donate': 'Donate',
    'settings.donateSub': 'Via PIX. Any amount helps keep the app free.',
    'settings.sentry.test': 'Send test error (Sentry)',
    'settings.sentry.testSub': 'Confirms that crash reporting is enabled',

    // === Bible ===
    'bible.searchPlaceholder': 'Search a verse...',
    'bible.chapter': 'Chapter',
    'bible.verse': 'Verse',
    'bible.book': 'Book',
    'bible.testament.ot': 'Old Testament',
    'bible.testament.nt': 'New Testament',

    // === Articles ===
    'articles.all': 'All',
    'articles.references': 'References',
    'articles.referencesHint': 'Tap any reference to see the full text.',
    'articles.continueReading': 'Continue reading in',
    'articles.relatedTitle': 'See also',
    'articles.notAvailable': 'English translation of this article is in progress.',

    // === Catechism ===
    'catechism.title': 'Catechism of the Catholic Church',
    'catechism.subtitle': 'Official text of the Magisterium',
    'catechism.searchPlaceholder': 'Search a paragraph or theme...',
    'catechism.section': 'Section',
    'catechism.paragraph': 'Paragraph',
    'catechism.partial': 'Full text (2865 paragraphs) available in English. Portuguese translation curated for key paragraphs; the rest shows English with an indication.',
    'catechism.openVatican': 'Open on the Vatican website',

    // === Map ===
    'map.title': 'Biblical Map',
    'map.subtitle': 'Tap a place to see details',
    'map.history': 'History',
    'map.archaeology': 'Archaeology',
    'map.related': 'Related texts',

    // === Quiz ===
    'quiz.daily': 'Daily quiz',
    'quiz.practice': 'Practice with 10 questions',
    'quiz.streak': 'days',
    'quiz.correct': 'Correct',
    'quiz.wrong': 'Correct answer:',
    'quiz.readArticle': 'Read the full article',
    'quiz.next': 'Next question',
    'quiz.result': 'Result',
    'quiz.scoreText': 'You got {{score}} out of {{total}} right',
    'quiz.practiceAgain': 'Practice 10 more',

    // === Dialogue ===
    'dialogue.title': 'Dialogue Mode',
    'dialogue.subtitle': 'Practice responses to the most common objections.',
    'dialogue.someoneSays': 'Someone tells you',
    'dialogue.nextStep': 'Next step',
    'dialogue.chooseOther': 'Choose another objection',

    // === Onboarding ===
    'onboarding.skip': 'Skip',
    'onboarding.next': 'Next',
    'onboarding.start': 'Start',

    // === Auth ===
    'auth.login': 'Sign in',
    'auth.signup': 'Sign up',
    'auth.signupNew': 'Create new account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.guest': 'Continue without account',
    'auth.forgotPassword': 'Forgot password',
    'auth.createFree': 'Create free account',
    'auth.notNow': 'Not now',
    'home.continueReading': 'Continue reading',
    'home.todayLiturgy': 'Today\'s liturgy',
    'home.saintToday': 'Saint of the day',
    'auth.subtitle': 'Sign in to your account to continue',
    'auth.recoverTitle': 'Recover password',
    'auth.sendLink': 'Send link',
    'auth.backToLogin': 'Back to login',

    // === Bible Screen ===
    'bible.books': 'Books',
    'bible.chapterPrep': 'Chapter in preparation',
    'bible.markColor': 'Mark with color',
    'bible.annotate': 'Note',
    'bible.copy': 'Copy',

    // === Catechism Screen ===
    'catechism.structure': 'Structure',
    'catechism.available': 'Available paragraphs',

    // === Search ===
    'search.recent': 'Recent searches',
    'search.clear': 'Clear',
    'search.empty': 'Nothing found',
    'search.tapToOpen': 'Tap to open',

    // === Empty states ===
    'empty.favorites': 'No favorites yet',
    'empty.highlights': 'No highlights yet',
    'empty.notes': 'No notes yet',
    'empty.createAccount': 'Create an account',

    // === Reading Plan ===
    'plan.reset': 'Reset progress',

    // === References ===
    'ref.readInApp': 'Read in app',
    'ref.openSource': 'Open official source',
    'ref.openCatechism': 'Open in Catechism',

    // === Note Editor ===
    'note.delete': 'Delete note',

    // === Liturgy ===
    'liturgy.errorTitle': 'Could not load',

    // === Settings extras ===
    'settings.guest.title': 'You are a guest',
    'settings.guest.sub': 'Tap to create an account',
    'settings.darkMode.label': 'Dark mode',
    'settings.font.label': 'Font size',

    // === Article categories ===
    'category.Existência de Deus': 'Existence of God',
    'category.Igreja Católica': 'Catholic Church',
    'category.Sagrada Escritura': 'Sacred Scripture',
    'category.Moral': 'Morality',
    'category.Outras Religiões': 'Other Religions',
    'category.História da Igreja': 'Church History',
    'category.Existência de Deus.desc': 'Rational arguments for God\'s existence',
    'category.Igreja Católica.desc': 'Papacy, sacraments, Mary and the saints',
    'category.Sagrada Escritura.desc': 'The Bible, Tradition and how to read them',
    'category.Moral.desc': 'Life, sexuality and natural law',
    'category.Outras Religiões.desc': 'Islam, spiritism, atheism and more',
    'category.História da Igreja.desc': 'Crusades, Inquisition and common myths',

    // === Reference source descriptions ===
    'source.Bíblia.desc': 'Verses from Scripture',
    'source.Catecismo.desc': 'Catechism of the Catholic Church',
    'source.Documentos.desc': 'Councils, encyclicals and documents',
    'source.Teólogos.desc': 'Fathers, doctors and scholars',
    'source.Outros.desc': 'Historical and external sources',
  },
};

// Substitui {{var}} pelos valores em opts.
function interpolate(str, opts) {
  if (!opts) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in opts ? String(opts[k]) : `{{${k}}}`));
}

export function translate(lang, key, opts) {
  const value = STRINGS[lang]?.[key] ?? STRINGS.pt[key] ?? key;
  return opts ? interpolate(value, opts) : value;
}
