// Modo diálogo apologético: objeções comuns + roteiro de resposta.
// Cada objeção tem: pergunta provocadora ("a outra pessoa diz"),
// pontos de resposta em ordem (concordar → reformular → apresentar argumento → fechar),
// e link para o artigo completo. Bilíngue (PT/EN).

export const DIALOGUES = [
  {
    id: 'd-deus-criou',
    objection: '"Se Deus criou tudo, quem criou Deus?"',
    objectionEn: '"If God created everything, who created God?"',
    category: 'Existência de Deus', categoryEn: 'Existence of God',
    steps: [
      { label: 'Concordar com o que faz sentido', labelEn: 'Agree with what makes sense', text: 'Boa pergunta. Tudo no nosso mundo precisa de causa, faz sentido perguntar isso.', textEn: 'Good question. Everything in our world needs a cause, it makes sense to ask that.' },
      { label: 'Reformular o argumento', labelEn: 'Reframe the argument', text: 'Mas o argumento católico não é "tudo precisa de causa". É "tudo que começa a existir tem causa". Deus, por definição, não começou a existir. É eterno, necessário, não contingente.', textEn: 'But the Catholic argument is not "everything needs a cause". It is "whatever begins to exist has a cause". God, by definition, did not begin to exist. He is eternal, necessary, not contingent.' },
      { label: 'Mostrar a alternativa', labelEn: 'Show the alternative', text: 'Você mesmo precisa dizer que algo sempre existiu: ou o universo (contrário à cosmologia atual), ou um multiverso eterno (sem evidência), ou matéria primordial. Em qualquer cenário, alguma coisa é eterna. A pergunta é: o quê?', textEn: 'You yourself must say something has always existed: either the universe (contrary to current cosmology), or an eternal multiverse (without evidence), or primordial matter. In any scenario, something is eternal. The question is: what?' },
      { label: 'Fechar', labelEn: 'Close', text: 'Postular um Ser pessoal, fora do tempo e espaço, é resposta coerente. Postular matéria eterna sem causa é também afirmar algo "sem causa". A diferença é só em qual fundamento você escolhe.', textEn: 'Positing a personal Being outside time and space is a coherent answer. Positing eternal matter without cause is also asserting something "without cause". The difference is only in which foundation you choose.' },
    ],
    relatedArticle: 11,
  },
  {
    id: 'd-ciencia',
    objection: '"Ciência refutou a religião."',
    objectionEn: '"Science has refuted religion."',
    category: 'Existência de Deus', categoryEn: 'Existence of God',
    steps: [
      { label: 'Pedir precisão', labelEn: 'Ask for precision', text: 'Que pergunta científica refutou que crença religiosa? Vamos ser concretos.', textEn: 'Which scientific question refuted which religious belief? Let\'s be concrete.' },
      { label: 'Mostrar a base histórica', labelEn: 'Show the historical basis', text: 'A própria ciência moderna nasceu na civilização cristã. Universidades foram fundadas pela Igreja (Bolonha 1088, Oxford 1096, Paris 1150). Gregor Mendel (genética) era monge. Lemaître (Big Bang) era padre. Boscovich (física atômica), jesuíta. Não é só "compatível": é matriz histórica.', textEn: 'Modern science itself was born in Christian civilization. Universities were founded by the Church (Bologna 1088, Oxford 1096, Paris 1150). Gregor Mendel (genetics) was a monk. Lemaître (Big Bang) was a priest. Boscovich (atomic physics) was a Jesuit. It is not just "compatible": it is the historical matrix.' },
      { label: 'O Big Bang ajuda, não atrapalha', labelEn: 'The Big Bang helps, not hurts', text: 'A descoberta de que o universo teve início (Big Bang) é exatamente o que Gênesis 1,1 já dizia há três mil anos. Antes do Big Bang, a ciência defendia universo eterno. Agora se aproxima do Criar do nada.', textEn: 'The discovery that the universe had a beginning (Big Bang) is exactly what Genesis 1:1 already said three thousand years ago. Before the Big Bang, science held the universe to be eternal. Now it approaches creation from nothing.' },
      { label: 'Fechar', labelEn: 'Close', text: 'Pergunte: que descoberta científica concreta refuta a existência de Deus? Geralmente a resposta é "evolução". Mas evolução fala de como, não de por quê. Deus pode usar mecanismos naturais para criar.', textEn: 'Ask: what concrete scientific discovery refutes the existence of God? Usually the answer is "evolution". But evolution speaks of how, not why. God can use natural mechanisms to create.' },
    ],
    relatedArticle: 30,
  },
  {
    id: 'd-mal',
    objection: '"Se Deus é bom, por que há sofrimento?"',
    objectionEn: '"If God is good, why is there suffering?"',
    category: 'Existência de Deus', categoryEn: 'Existence of God',
    steps: [
      { label: 'Reconhecer o peso emocional', labelEn: 'Acknowledge the emotional weight', text: 'É a objeção mais sentida do mundo. Não vou tratar como argumento abstrato. Você está pensando em algo específico?', textEn: 'It\'s the most deeply felt objection in the world. I won\'t treat it as an abstract argument. Are you thinking of something specific?' },
      { label: 'Distinguir tipos de mal', labelEn: 'Distinguish types of evil', text: 'Há mal moral (causado por escolha humana) e mal natural (doenças, terremotos). O primeiro vem do fato de Deus ter criado seres livres. Liberdade real implica possibilidade real do mal. Sem liberdade, não há amor, virtude, mérito.', textEn: 'There is moral evil (caused by human choice) and natural evil (disease, earthquakes). The first comes from God creating free beings. Real freedom implies real possibility of evil. Without freedom, there is no love, virtue, or merit.' },
      { label: 'O argumento se autorrefuta', labelEn: 'The argument is self-refuting', text: 'Chamar algo de "mal" pressupõe um padrão objetivo de bem. Se Deus não existe, esse padrão não existe e o argumento colapsa. C. S. Lewis percebeu isso quando era ateu, e foi parte da sua conversão.', textEn: 'Calling something "evil" presupposes an objective standard of good. If God does not exist, that standard does not exist and the argument collapses. C. S. Lewis realized this when he was an atheist, and it was part of his conversion.' },
      { label: 'A resposta cristã específica', labelEn: 'The specific Christian answer', text: 'O cristianismo não esconde o sofrimento, ele o transforma. Deus mesmo entra no sofrimento na cruz. Nenhuma outra religião apresenta Deus crucificado. A Páscoa mostra que o pior crime da história tornou-se a fonte da redenção.', textEn: 'Christianity does not hide suffering, it transforms it. God himself enters suffering on the cross. No other religion presents a crucified God. Easter shows that the worst crime in history became the source of redemption.' },
    ],
    relatedArticle: 6,
  },
  {
    id: 'd-maria-adoracao',
    objection: '"Vocês adoram Maria como se fosse Deus."',
    objectionEn: '"You worship Mary as if she were God."',
    category: 'Igreja Católica', categoryEn: 'Catholic Church',
    steps: [
      { label: 'Esclarecer a distinção', labelEn: 'Clarify the distinction', text: 'A Igreja distingue há séculos três níveis: latria (adoração devida só a Deus), dulia (veneração dos santos), hiperdulia (veneração superior a Maria, pela sua dignidade). Confundi-los é a raiz do mal-entendido.', textEn: 'The Church has distinguished three levels for centuries: latria (worship due only to God), dulia (veneration of saints), hyperdulia (higher veneration of Mary, for her dignity). Confusing them is the root of the misunderstanding.' },
      { label: 'Mostrar o paralelo cotidiano', labelEn: 'Show the everyday parallel', text: 'Você pede que sua mãe ou um amigo ore por você? Por que pedir aos santos no céu seria pior do que pedir a um amigo vivo?', textEn: 'Do you ask your mother or a friend to pray for you? Why would asking the saints in heaven be worse than asking a living friend?' },
      { label: 'Base bíblica', labelEn: 'Biblical basis', text: 'Em Apocalipse 5,8 os anciãos no céu oferecem a Deus "as orações dos santos". Em Mateus 22,32 Jesus diz que "Deus não é Deus dos mortos, mas dos vivos". Os santos no céu estão vivos e intercedem.', textEn: 'In Revelation 5:8 the elders in heaven offer God "the prayers of the saints". In Matthew 22:32 Jesus says "God is not the God of the dead, but of the living". The saints in heaven are alive and intercede.' },
      { label: 'Fechar', labelEn: 'Close', text: 'Cristo é o único Mediador (1 Tm 2,5). Intercessão dos santos não substitui isso, depende disso. Como em Caná: Maria não substitui Jesus, aponta para ele e diz "fazei o que ele vos disser".', textEn: 'Christ is the only Mediator (1 Tim 2:5). Intercession of the saints does not replace this, it depends on it. Like at Cana: Mary does not replace Jesus, she points to him and says "do whatever he tells you".' },
    ],
    relatedArticle: 4,
  },
  {
    id: 'd-sola-scriptura',
    objection: '"A Bíblia é a única regra de fé."',
    objectionEn: '"The Bible is the only rule of faith."',
    category: 'Igreja Católica', categoryEn: 'Catholic Church',
    steps: [
      { label: 'Pedir o versículo', labelEn: 'Ask for the verse', text: 'Em que versículo, exatamente, a Bíblia ensina que ela é a única regra de fé?', textEn: 'In which verse, exactly, does the Bible teach that it is the only rule of faith?' },
      { label: 'Mostrar a contradição', labelEn: 'Show the contradiction', text: 'A própria Bíblia ensina o contrário. 2 Tessalonicenses 2,15: "conservai as tradições que aprendestes, seja por palavra, seja por carta nossa". Tradição oral em pé de igualdade com a escrita.', textEn: 'The Bible itself teaches the opposite. 2 Thessalonians 2:15: "hold the traditions which you have learned, whether by word, or by our epistle". Oral tradition on equal footing with writing.' },
      { label: 'O problema do cânon', labelEn: 'The canon problem', text: 'Quem decidiu quais livros pertencem à Bíblia? Não foi a Bíblia que decidiu isso. Foram concílios católicos (Hipona 393, Cartago 397). Aceitar a Bíblia rejeitando a autoridade que a definiu é contradição.', textEn: 'Who decided which books belong in the Bible? It was not the Bible that decided. It was Catholic councils (Hippo 393, Carthage 397). Accepting the Bible while rejecting the authority that defined it is contradiction.' },
      { label: 'O problema da prática', labelEn: 'The practical problem', text: 'Em 500 anos de protestantismo surgiram dezenas de milhares de denominações, todas dizendo "só a Bíblia", todas chegando a conclusões opostas. Sem autoridade interpretativa, cada cristão vira seu próprio papa.', textEn: 'In 500 years of Protestantism, tens of thousands of denominations have arisen, all saying "Bible alone", all reaching opposite conclusions. Without interpretive authority, every Christian becomes his own pope.' },
    ],
    relatedArticle: 3,
  },
  {
    id: 'd-eucaristia-simbolo',
    objection: '"A Eucaristia é só símbolo do Corpo de Cristo."',
    objectionEn: '"The Eucharist is only a symbol of the Body of Christ."',
    category: 'Igreja Católica', categoryEn: 'Catholic Church',
    steps: [
      { label: 'Voltar ao texto', labelEn: 'Back to the text', text: 'Em João 6, Jesus repete seis vezes que sua carne é verdadeira comida. Quando muitos discípulos vão embora pelo ensinamento (Jo 6,66), ele não os chama de volta dizendo "era só metáfora". Pergunta aos Doze se também querem partir.', textEn: 'In John 6, Jesus repeats six times that his flesh is true food. When many disciples leave because of the teaching (Jn 6:66), he does not call them back saying "it was just a metaphor". He asks the Twelve if they also want to leave.' },
      { label: 'O grego é específico', labelEn: 'The Greek is specific', text: 'Jesus usa o verbo trōgō, que significa "mastigar como animais comem". Era o termo mais físico possível. Se quisesse falar simbolicamente, usaria phágō ou outros verbos disponíveis. Não usou.', textEn: 'Jesus uses the verb trōgō, meaning "to chew as animals eat". It was the most physical term possible. If he meant symbolic speech, he would have used phagō or other available verbs. He didn\'t.' },
      { label: 'Paulo confirma', labelEn: 'Paul confirms', text: '1 Coríntios 11,27-29: comer indignamente "é réu do corpo e sangue do Senhor". E quem come "sem distinguir o Corpo" come a própria condenação. Símbolos não condenam, corpo real condena.', textEn: '1 Corinthians 11:27-29: eating unworthily is "guilty of the body and blood of the Lord". And whoever eats "not discerning the body" eats his own condemnation. Symbols do not condemn, a real body does.' },
      { label: 'Os Padres unânimes', labelEn: 'The Fathers are unanimous', text: 'Em mil anos não houve cristão sério defendendo que a Eucaristia fosse apenas símbolo. Inácio de Antioquia em 107, Justino Mártir em 155, Cirilo de Jerusalém em 350: todos confessam Presença Real. A leitura simbólica é inovação do séc. XVI.', textEn: 'In a thousand years, no serious Christian defended the Eucharist as merely symbolic. Ignatius of Antioch in 107, Justin Martyr in 155, Cyril of Jerusalem in 350: all confess the Real Presence. The symbolic reading is a 16th-century innovation.' },
    ],
    relatedArticle: 7,
  },
  {
    id: 'd-papado',
    objection: '"O Papa é invenção medieval, não está na Bíblia."',
    objectionEn: '"The Pope is a medieval invention, not in the Bible."',
    category: 'Igreja Católica', categoryEn: 'Catholic Church',
    steps: [
      { label: 'Mateus 16', labelEn: 'Matthew 16', text: 'Em Mateus 16,18-19 Jesus diz a Simão: "Tu és Pedro, e sobre esta pedra edificarei a minha Igreja". Muda o nome (de Simão para Rocha), promete edificar a Igreja sobre ele, dá as chaves do Reino. Três coisas únicas, só a Pedro.', textEn: 'In Matthew 16:18-19 Jesus says to Simon: "Thou art Peter, and upon this rock I will build my church". He changes his name (from Simon to Rock), promises to build the Church on him, gives him the keys of the Kingdom. Three unique things, only to Peter.' },
      { label: 'A história patrística', labelEn: 'Patristic history', text: 'Santo Inácio de Antioquia, em 107, já chama a Igreja de Roma de "a que preside". Santo Irineu (180) lista a sucessão dos bispos de Roma desde Pedro. Não é "invenção medieval", é continuidade desde o século I.', textEn: 'St. Ignatius of Antioch, in 107, already calls the Church of Rome "the one that presides". St. Irenaeus (180) lists the succession of Roman bishops from Peter. It is not "medieval invention", it is continuity since the 1st century.' },
      { label: 'Sucessão documentável', labelEn: 'Documentable succession', text: 'A sucessão papal pode ser traçada nome por nome: Pedro, Lino, Cleto, Clemente, Evaristo... até o atual Papa. Nenhuma outra igreja cristã tem essa continuidade documental.', textEn: 'The papal succession can be traced name by name: Peter, Linus, Cletus, Clement, Evaristus... down to the current Pope. No other Christian church has this documentary continuity.' },
      { label: 'Pergunta de fechamento', labelEn: 'Closing question', text: 'Se Pedro não tinha autoridade especial, por que Jesus mudou seu nome, lhe deu as chaves, orou só por ele para que sua fé não desfalecesse (Lc 22,32), e disse três vezes "apascenta minhas ovelhas" só a ele (Jo 21,15-17)?', textEn: 'If Peter had no special authority, why did Jesus change his name, give him the keys, pray only for him that his faith might not fail (Lk 22:32), and say three times "feed my sheep" only to him (Jn 21:15-17)?' },
    ],
    relatedArticle: 19,
  },
  {
    id: 'd-confissao-padre',
    objection: '"Confesso direto a Deus, não preciso de padre."',
    objectionEn: '"I confess directly to God, I don\'t need a priest."',
    category: 'Igreja Católica', categoryEn: 'Catholic Church',
    steps: [
      { label: 'Resposta direta', labelEn: 'Direct answer', text: 'Porque foi Jesus que ordenou assim. Em João 20,21-23 ele dá poder de perdoar e reter pecados aos apóstolos. Não a si mesmos, a outros.', textEn: 'Because Jesus commanded it this way. In John 20:21-23 he gives the apostles the power to forgive and retain sins. Not to themselves, but to others.' },
      { label: 'Como reter sem ouvir?', labelEn: 'How to retain without hearing?', text: 'Se Jesus deu poder de perdoar E reter, é necessário conhecer os pecados. Daí a confissão. Não é "intermediário entre você e Deus", é o ministro que age in persona Christi.', textEn: 'If Jesus gave power to forgive AND retain, the sins must be known. Hence confession. It is not "intermediary between you and God", it is the minister acting in persona Christi.' },
      { label: 'Quem perdoa', labelEn: 'Who forgives', text: 'Quem perdoa o pecado é Deus, não o sacerdote. O sacerdote é instrumento. Como o cano que leva água: a água vem da fonte, mas passa pelo cano. A absolvição vem de Deus, declarada pelo ministro.', textEn: 'It is God who forgives sin, not the priest. The priest is the instrument. Like the pipe that carries water: the water comes from the source, but flows through the pipe. Absolution comes from God, declared by the minister.' },
      { label: 'Toda Igreja antiga praticava', labelEn: 'The whole early Church practiced it', text: 'Didaqué (séc. I-II), Tertuliano, Orígenes, Cipriano: todos descrevem confissão a sacerdote. Se isso é erro, então a Igreja inteira errou nos primeiros 1500 anos.', textEn: 'Didache (1st-2nd century), Tertullian, Origen, Cyprian: all describe confession to a priest. If this is wrong, then the entire Church was wrong for the first 1500 years.' },
    ],
    relatedArticle: 21,
  },
  {
    id: 'd-jesus-mito',
    objection: '"Jesus nunca existiu, é mito."',
    objectionEn: '"Jesus never existed, he is a myth."',
    category: 'Existência de Deus', categoryEn: 'Existence of God',
    steps: [
      { label: 'Posição acadêmica real', labelEn: 'Actual academic position', text: 'Praticamente nenhum historiador acadêmico defende isso. Mesmo Bart Ehrman, agnóstico e crítico do cristianismo, escreveu um livro inteiro ("Did Jesus Exist?", 2012) defendendo a existência histórica de Jesus.', textEn: 'Virtually no academic historian defends this. Even Bart Ehrman, agnostic and critic of Christianity, wrote an entire book ("Did Jesus Exist?", 2012) defending the historical existence of Jesus.' },
      { label: 'Fontes pagãs', labelEn: 'Pagan sources', text: 'Tácito (historiador romano, 116), Plínio o Jovem (governador romano, 112), Suetônio (historiador, 121): três fontes pagãs independentes mencionam Cristo, sua execução por Pilatos, ou cristãos. Todos hostis ou neutros.', textEn: 'Tacitus (Roman historian, 116), Pliny the Younger (Roman governor, 112), Suetonius (historian, 121): three independent pagan sources mention Christ, his execution by Pilate, or Christians. All hostile or neutral.' },
      { label: 'Fonte judaica', labelEn: 'Jewish source', text: 'Flávio Josefo, em "Antiguidades Judaicas" (93-94), menciona "Tiago, irmão de Jesus chamado Cristo" em passagem nunca disputada. Josefo era judeu, não tinha motivo para inventar.', textEn: 'Flavius Josephus, in "Jewish Antiquities" (93-94), mentions "James, brother of Jesus called Christ" in a passage never disputed. Josephus was Jewish and had no motive to invent.' },
      { label: 'Fechar', labelEn: 'Close', text: 'A tese mítica precisa explicar como em 49 d.C., poucos anos após a suposta "invenção", o imperador Cláudio já expulsou judeus de Roma por agitações sobre "Chrestus". Comunidades cristãs já existiam pelo Mediterrâneo.', textEn: 'The myth thesis needs to explain how in 49 AD, a few years after the supposed "invention", Emperor Claudius already expelled Jews from Rome over agitations about "Chrestus". Christian communities already existed across the Mediterranean.' },
    ],
    relatedArticle: 35,
  },
  {
    id: 'd-aborto',
    objection: '"Aborto é direito da mulher, é o corpo dela."',
    objectionEn: '"Abortion is a woman\'s right, it\'s her body."',
    category: 'Moral', categoryEn: 'Morality',
    steps: [
      { label: 'Pedir precisão', labelEn: 'Ask for precision', text: 'Vamos por partes. Você concorda que o que está no útero é vivo? E é humano? Tem DNA distinto, sexo próprio, sistema imunológico próprio.', textEn: 'Let\'s go step by step. Do you agree that what is in the womb is alive? And is human? It has distinct DNA, its own sex, its own immune system.' },
      { label: 'Dois corpos', labelEn: 'Two bodies', text: 'O feto está dentro da mãe mas não é a mãe. Tem coração próprio que bate aos 21 dias, sistema nervoso próprio, e em muitos casos tipo sanguíneo diferente. É outro ser humano, hospedado.', textEn: 'The fetus is inside the mother but is not the mother. It has its own heart beating at 21 days, its own nervous system, and in many cases a different blood type. It is another human being, hosted.' },
      { label: 'Dignidade não depende de capacidades', labelEn: 'Dignity does not depend on capacities', text: 'Se dignidade dependesse de consciência ou autonomia, recém-nascidos e adultos em coma também perderiam dignidade. Mas você não defende matá-los. Por que aplicar critério diferente ao nascituro?', textEn: 'If dignity depended on consciousness or autonomy, newborns and adults in coma would also lose dignity. But you don\'t defend killing them. Why apply a different criterion to the unborn?' },
      { label: 'A Igreja sempre condenou', labelEn: 'The Church always condemned it', text: 'A Didaqué, manual cristão do séc. I, já dizia: "Não matarás a criança no seio materno". Tertuliano (197): "Para nós, é homicídio precoce impedir o nascimento". Não é doutrina nova nem cultural.', textEn: 'The Didache, a 1st-century Christian manual, already said: "You shall not kill the child in the womb". Tertullian (197): "For us, preventing birth is early homicide". This is not a new or cultural doctrine.' },
    ],
    relatedArticle: 25,
  },
  {
    id: 'd-inquisicao',
    objection: '"A Igreja matou milhões na Inquisição."',
    objectionEn: '"The Church killed millions in the Inquisition."',
    category: 'História', categoryEn: 'History',
    steps: [
      { label: 'Pedir o número real', labelEn: 'Ask for the actual number', text: 'Quantos exatamente? A Inquisição Espanhola, a mais famosa, em mais de 350 anos (1478-1834), executou cerca de 3.000 a 5.000 pessoas, segundo Henry Kamen, historiador britânico que pesquisou arquivos primários.', textEn: 'How many exactly? The Spanish Inquisition, the most famous, in over 350 years (1478-1834), executed about 3,000 to 5,000 people, according to Henry Kamen, British historian who researched primary archives.' },
      { label: 'Comparar com tribunais civis', labelEn: 'Compare with civil courts', text: 'No mesmo período, tribunais civis europeus (especialmente em terras protestantes) executaram dezenas de milhares por bruxaria. A Inquisição Espanhola foi cética sobre bruxaria desde 1610.', textEn: 'In the same period, European civil courts (especially in Protestant lands) executed tens of thousands for witchcraft. The Spanish Inquisition was skeptical about witchcraft from 1610.' },
      { label: 'Garantias processuais', labelEn: 'Procedural guarantees', text: 'A Inquisição tinha regras formais: direito de defesa, taxa de absolvição de 40-70%, limite no uso de tortura. Comparada à justiça civil da época (que torturava livre e executava por suspeita), era reformista.', textEn: 'The Inquisition had formal rules: right to defense, 40-70% acquittal rate, limits on the use of torture. Compared to civil justice of the time (which tortured freely and executed on suspicion), it was reformist.' },
      { label: 'Reconhecer o erro real', labelEn: 'Acknowledge the real error', text: 'Houve excessos e erros reais. São João Paulo II, em 2000, pediu publicamente perdão. Mas reconhecer erros não é o mesmo que aceitar caricatura. A história real é grave, mas muito diferente do mito de "milhões".', textEn: 'There were excesses and real errors. St. John Paul II, in 2000, publicly asked forgiveness. But acknowledging errors is not the same as accepting caricature. The real history is grave, but very different from the myth of "millions".' },
    ],
    relatedArticle: 28,
  },
  {
    id: 'd-cruzadas',
    objection: '"Cristãos invadiram terras muçulmanas pacíficas nas Cruzadas."',
    objectionEn: '"Christians invaded peaceful Muslim lands in the Crusades."',
    category: 'História', categoryEn: 'History',
    steps: [
      { label: 'Pergunta histórica', labelEn: 'Historical question', text: 'Antes do ano 632, Síria, Egito, Norte da África, Espanha e Anatólia eram cristãos. Quem os conquistou entre 632 e 732?', textEn: 'Before the year 632, Syria, Egypt, North Africa, Spain, and Anatolia were Christian. Who conquered them between 632 and 732?' },
      { label: 'A expansão islâmica', labelEn: 'The Islamic expansion', text: 'Exércitos muçulmanos, pela espada. Em 100 anos: Damasco, Jerusalém, Alexandria, Cartago, Espanha. Quatro séculos de conquista militar antes da Primeira Cruzada (1095).', textEn: 'Muslim armies, by the sword. In 100 years: Damascus, Jerusalem, Alexandria, Carthage, Spain. Four centuries of military conquest before the First Crusade (1095).' },
      { label: 'O pedido bizantino', labelEn: 'The Byzantine appeal', text: 'O imperador bizantino Aleixo I pediu socorro ao Papa Urbano II contra os turcos seljúcidas, que tinham tomado Jerusalém em 1071 e ameaçavam Constantinopla. As Cruzadas foram resposta defensiva tardia.', textEn: 'Byzantine emperor Alexios I asked Pope Urban II for help against the Seljuk Turks, who had taken Jerusalem in 1071 and threatened Constantinople. The Crusades were a late defensive response.' },
      { label: 'Atrocidades dos dois lados', labelEn: 'Atrocities on both sides', text: 'Houve excessos. O massacre de Jerusalém em 1099 é o mais conhecido. Mas tribos muçulmanas também massacraram cristãos (Tiro 1124). Era guerra cruel, prática militar antiga, não monopólio de um lado.', textEn: 'There were excesses. The massacre of Jerusalem in 1099 is the most well-known. But Muslim tribes also massacred Christians (Tyre 1124). It was cruel war, ancient military practice, not the monopoly of one side.' },
    ],
    relatedArticle: 29,
  },
  {
    id: 'd-galileu',
    objection: '"A Igreja torturou Galileu por defender a ciência."',
    objectionEn: '"The Church tortured Galileo for defending science."',
    category: 'História', categoryEn: 'History',
    steps: [
      { label: 'Fato 1: não foi torturado', labelEn: 'Fact 1: he was not tortured', text: 'Galileu não foi torturado. Não foi morto. Foi condenado a prisão domiciliar em sua confortável villa em Arcetri, onde continuou publicando ciência. Morreu velho, em casa, em 1642.', textEn: 'Galileo was not tortured. He was not killed. He was sentenced to house arrest in his comfortable villa in Arcetri, where he continued publishing science. He died old, at home, in 1642.' },
      { label: 'Fato 2: o que aconteceu', labelEn: 'Fact 2: what actually happened', text: 'Em 1616 a Igreja pediu que ele ensinasse heliocentrismo como hipótese matemática, não como verdade física comprovada (faltavam evidências, só viriam com Newton). Galileu aceitou. Em 1632 publicou um livro ridicularizando o Papa Urbano VIII, que era seu amigo. Aí o caso reabriu.', textEn: 'In 1616 the Church asked him to teach heliocentrism as a mathematical hypothesis, not as proven physical truth (evidence was missing, would only come with Newton). Galileo agreed. In 1632 he published a book ridiculing Pope Urban VIII, who was his friend. Then the case reopened.' },
      { label: 'A Igreja reconheceu o erro', labelEn: 'The Church acknowledged the error', text: 'Em 1992, João Paulo II reconheceu publicamente, depois de comissão de estudo, que a condenação foi erro humano de juízo. Falou de "doloroso mal-entendido".', textEn: 'In 1992, John Paul II publicly acknowledged, after a study commission, that the condemnation was a human error of judgment. He spoke of "painful misunderstanding".' },
      { label: 'Comparar com a Reforma', labelEn: 'Compare with the Reformation', text: 'Lutero chamou Copérnico de "tolo". Calvino rejeitou o heliocentrismo. Os reformadores protestantes do séc. XVI foram mais hostis a Copérnico que os católicos. E Copérnico era um padre católico.', textEn: 'Luther called Copernicus "a fool". Calvin rejected heliocentrism. The 16th-century Protestant reformers were more hostile to Copernicus than the Catholics. And Copernicus was a Catholic priest.' },
    ],
    relatedArticle: 30,
  },
  {
    id: 'd-religiao-pagao',
    objection: '"Cristianismo é cópia de Hórus, Mitra, Dionísio."',
    objectionEn: '"Christianity is a copy of Horus, Mithras, Dionysus."',
    category: 'Outras Religiões', categoryEn: 'Other Religions',
    steps: [
      { label: 'Pedir as fontes', labelEn: 'Ask for sources', text: 'Vamos checar. Cite uma fonte primária (texto egípcio, romano, grego) que confirme isso. Hórus, segundo textos egípcios reais, não nasceu de virgem, não foi crucificado, não ressuscitou ao terceiro dia.', textEn: 'Let\'s check. Cite a primary source (Egyptian, Roman, Greek text) that confirms this. Horus, according to actual Egyptian texts, was not born of a virgin, was not crucified, did not rise on the third day.' },
      { label: 'Cronologia', labelEn: 'Chronology', text: 'O mitraísmo romano com paralelos surge no séc. II d.C., depois do cristianismo já estar formado. A direção de influência (se houve) é a inversa. Ronald Nash demonstrou isso em "The Gospel and the Greeks" (1992).', textEn: 'Roman Mithraism with parallels emerges in the 2nd century AD, after Christianity was already formed. The direction of influence (if any) is the reverse. Ronald Nash demonstrated this in "The Gospel and the Greeks" (1992).' },
      { label: 'Diferença qualitativa', labelEn: 'Qualitative difference', text: 'Mitos pagãos são intemporais, sem testemunhas datáveis, sem ancoragem histórica. O cristianismo afirma evento datado, com testemunhas nomeadas (Pilatos, Caifás, Tibério), em local específico. É outro tipo de afirmação.', textEn: 'Pagan myths are timeless, without datable witnesses, without historical anchoring. Christianity affirms a dated event, with named witnesses (Pilate, Caiaphas, Tiberius), in a specific place. It is another type of claim.' },
      { label: 'Resposta de Lewis', labelEn: 'Lewis\'s answer', text: 'C. S. Lewis aceitou as similaridades reais e disse: "os mitos pagãos eram sonhos de Deus preparando a humanidade para o fato histórico em Cristo. O mito se fez fato".', textEn: 'C. S. Lewis accepted the real similarities and said: "the pagan myths were God\'s dreams preparing humanity for the historical fact in Christ. The myth became fact".' },
    ],
    relatedArticle: 36,
  },
];

export function getDialogueById(id) {
  return DIALOGUES.find((d) => d.id === id);
}

export function getDialoguesByCategory(category) {
  return DIALOGUES.filter((d) => d.category === category);
}
