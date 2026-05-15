// Campo `references` contém IDs que apontam para entradas em references.js.
// Isso permite que o app navegue do artigo direto à referência ao tocar nela.

export const articles = [
  {
    id: 1,
    title: 'A Existência de Deus: o Argumento Cosmológico',
    category: 'Existência de Deus',
    summary: 'Por que precisa existir uma causa primeira não causada para explicar tudo que existe.',
    body: `Tudo que existe tem uma causa. O universo, com toda sua ordem e complexidade, não surgiu do nada. A primeira lei da termodinâmica diz que a energia total de um sistema isolado é constante, e isso já pressupõe que existe algo. A pergunta de fundo é outra: por que existe algo em vez de nada?

Aristóteles formulou o problema, e Santo Tomás de Aquino aprofundou a resposta. Toda série de causas precisa ter um início. Uma regressão infinita de causas não explicaria nada, porque nunca chegaríamos ao motivo de qualquer coisa existir. Então tem que haver um ser que exista por si mesmo, sem depender de causa externa. Esse ser é o fundamento de tudo, e nós o chamamos de Deus.

Santo Tomás chama essa demonstração de "Primeira Via" na Suma Teológica. Tudo que se move, é movido por outro. Como a cadeia de movimentos não pode ser infinita, há um Primeiro Motor Imóvel. Esse é o argumento mais clássico da filosofia cristã para a existência de Deus, e continua de pé até hoje.`,
    references: ['suma-i-q2-a3', 'cic-31-35', 'rm-1-20'],
  },
  {
    id: 2,
    title: 'Por que Ser Católico e Não Somente Cristão?',
    category: 'Igreja Católica',
    summary: 'A Igreja fundada por Cristo é uma só, e ela subsiste na Igreja Católica.',
    body: `Jesus fundou uma Igreja, não igrejas. Em Mateus 16,18 ele diz "sobre esta pedra edificarei a minha Igreja", no singular. E entregou as chaves do Reino a Pedro, estabelecendo uma estrutura de autoridade visível, não uma rede invisível de crentes desorganizados.

A continuidade apostólica é o que diferencia a Igreja Católica de denominações que surgiram séculos depois. Os bispos católicos traçam sua linha de ordenação ininterrupta até os Apóstolos. Isso é a sucessão apostólica, e ela é histórica, documentável. Não é metáfora.

O Concílio Vaticano II foi explícito ao ensinar que "a única Igreja de Cristo subsiste na Igreja Católica, governada pelo sucessor de Pedro e pelos bispos em comunhão com ele" (Lumen Gentium §8). Reconhece elementos de santificação e verdade fora dela, mas a plenitude está na Igreja una, santa, católica e apostólica.

Há também uma razão histórica simples e contundente. O cânon da Bíblia (a lista de livros inspirados) foi definido por concílios católicos, em Hipona em 393 e Cartago em 397. A Igreja precede a Bíblia como instituição. Foi ela quem discerniu, com autoridade vinda de Cristo, quais livros são Palavra de Deus. Quem rejeita a Igreja, mas aceita a Bíblia, está em contradição lógica.`,
    references: ['mt-16-18', 'lumen-gentium-8', 'cic-816', 'jo-17-20'],
  },
  {
    id: 3,
    title: 'A Sagrada Tradição e o Sola Scriptura',
    category: 'Sagrada Escritura',
    summary: 'A Bíblia sozinha não se interpreta a si mesma. A Tradição e o Magistério são necessários.',
    body: `O princípio protestante do Sola Scriptura afirma que a Bíblia é a única regra de fé. Mas o princípio tem problemas sérios que ele próprio não resolve.

O primeiro é que a própria Bíblia não diz isso de si mesma. Ao contrário, São Paulo escreve aos Tessalonicenses: "permanecei firmes e conservai as tradições que aprendestes, seja por palavra, seja por carta nossa" (2 Ts 2,15). A Tradição oral é colocada lado a lado com a Tradição escrita.

O segundo problema é que a Bíblia precisa ser interpretada. Quem decide qual interpretação é correta? Na ausência de autoridade interpretativa, cada cristão se torna seu próprio papa. O resultado prático foi que, em 500 anos de protestantismo, surgiram dezenas de milhares de denominações, todas dizendo seguir "só a Bíblia" e chegando a conclusões opostas sobre batismo, Eucaristia, salvação, moral, ministério.

O terceiro problema é que o cânon bíblico foi definido pela Igreja. Sem confiar na autoridade da Igreja, não há como saber quais livros pertencem à Bíblia. O próprio livro não traz índice. Foram concílios católicos que estabeleceram esse índice.

A solução católica é coerente: a Revelação de Deus se transmite pela Sagrada Escritura e pela Sagrada Tradição, ambas interpretadas pelo Magistério vivo da Igreja. As três coisas se sustentam mutuamente.`,
    references: ['2ts-2-15', '2pd-1-20', 'cic-80-83', 'dei-verbum-9'],
  },
  {
    id: 4,
    title: 'Maria: Intercessora, Não Mediadora',
    category: 'Igreja Católica',
    summary: 'Pedir intercessão aos santos não é idolatria, é o mesmo que pedir a um amigo que ore por nós.',
    body: `Uma das objeções mais comuns ao catolicismo é a devoção a Maria e aos santos. "Por que não ir diretamente a Jesus?" é a pergunta clássica.

Essa objeção confunde mediação com intercessão. Cristo é o único mediador entre Deus e os homens, como ensina São Paulo em 1 Timóteo 2,5. Ele é a fonte de toda graça. Mas assim como pedimos a um amigo aqui na terra que ore por nós, podemos pedir aos santos no céu que intercedam junto a Deus. Isso não substitui Cristo, depende dele.

A objeção de que os santos estão mortos não vale, porque Jesus mesmo disse que "Deus não é Deus dos mortos, mas dos vivos" (Mt 22,32). Os santos vivem em Cristo. O Apocalipse mostra isso em imagem: os anciãos no céu oferecem a Deus "taças de ouro cheias de incenso, que são as orações dos santos" (Ap 5,8). A intercessão dos santos é Escritura, não invenção tardia.

Maria, como Mãe de Cristo, tem uma intercessão única. Nas Bodas de Caná, ela percebe a falta de vinho e intercede. Jesus atende, mesmo antes de "sua hora". Essa cena é o modelo bíblico da intercessão mariana. Ela aponta para Cristo, e o que ela diz aos serventes vale para todo cristão: "Fazei o que ele vos disser."`,
    references: ['1tm-2-5', 'jo-2-1', 'ap-5-8', 'mt-22-32', 'cic-966', 'lumen-gentium-60'],
  },
  {
    id: 5,
    title: 'A Ressurreição de Jesus: Fato Histórico',
    category: 'Existência de Deus',
    summary: 'A ressurreição não é mito. Há evidências históricas robustas que a sustentam.',
    body: `A ressurreição de Jesus não é apenas crença religiosa, é evento histórico com evidências substanciais que precisam ser explicadas.

O túmulo estava vazio. Tanto judeus quanto romanos tinham interesse claro em produzir o corpo de Jesus para suprimir o cristianismo no nascedouro. Nunca conseguiram, porque o corpo não estava lá.

As aparições foram públicas e múltiplas. São Paulo lista mais de quinhentas pessoas que viram Cristo ressuscitado em 1 Coríntios 15,3-8, muitas delas ainda vivas quando ele escreveu a carta. Podiam ser interrogadas. Ele convida o leitor a verificar.

A transformação dos apóstolos é talvez a evidência mais forte. Homens que fugiram com medo na noite da prisão de Jesus, todos exceto João morreram mártires proclamando a ressurreição. Ninguém morre torturado por algo que sabe ser mentira.

Mesmo fontes pagãs e judaicas hostis ao cristianismo, como o historiador Flávio Josefo, atestam a existência e a execução de Jesus. Gary Habermas, pesquisador especializado no tema, identificou "fatos mínimos" sobre a ressurreição que cerca de 95% dos historiadores críticos aceitam, mesmo os não-crentes: morte por crucificação, túmulo vazio, aparições percebidas como reais pelos discípulos, conversão de Paulo de perseguidor a apóstolo, e conversão de Tiago, irmão de Jesus, que antes não cria.

A questão não é "houve evidências?", mas "qual explicação dá conta de todas elas?". A explicação cristã é que ele realmente ressuscitou.`,
    references: ['1cor-15-3', 'mt-28-1', 'josefo-antiguidades-20', 'cic-638'],
  },
  {
    id: 6,
    title: 'Ateísmo e o Problema do Mal',
    category: 'Existência de Deus',
    summary: 'O sofrimento no mundo não refuta Deus. Pode ser compreendido dentro da fé cristã.',
    body: `"Se Deus existe, por que há sofrimento?" Essa é talvez a objeção mais emotiva ao teísmo. Não é uma objeção fraca, e a fé cristã não a evita.

Primeiro, é preciso distinguir o mal moral, causado pela liberdade humana, do mal natural, que envolve doenças, terremotos, sofrimento físico. Deus criou seres livres porque o amor exige liberdade. A liberdade implica a possibilidade real do mal moral. Sem liberdade, não há virtude, nem amor verdadeiro, nem mérito.

Segundo, Deus pode ter razões suficientes para permitir sofrimentos que não compreendemos. Um cirurgião causa dor para curar. Isso não o torna mau, embora a criança no momento da injeção possa achar que sim. Nossa perspectiva é limitada.

Terceiro, o cristianismo não ignora o sofrimento, ele o transforma. Deus mesmo entrou no sofrimento humano na cruz. O Cristo crucificado não é um Deus distante e indiferente. É um Deus que sofre junto, que assume o pior da existência humana, e que mostra que o sofrimento pode ter sentido redentor.

Há ainda um problema filosófico que ateus raramente percebem. O argumento do mal pressupõe um padrão objetivo de bem e mal. Se não há Deus, não há padrão objetivo. O próprio argumento colapsa: o ateísmo não tem base para chamar nada de "mau", apenas de desagradável. Como C. S. Lewis observou, quando tentou usar o argumento do mal contra Deus, percebeu que toda sua noção de "mal" pressupunha o "bem" que ele queria negar.`,
    references: ['rm-8-28', 'cic-309', 'lewis-problema-dor'],
  },
  {
    id: 7,
    title: 'A Eucaristia: Presença Real de Cristo',
    category: 'Igreja Católica',
    summary: 'A Eucaristia não é símbolo. É o Corpo, Sangue, Alma e Divindade de Jesus Cristo.',
    body: `No capítulo 6 do Evangelho de João, Jesus diz seis vezes que sua carne é verdadeira comida e seu sangue é verdadeira bebida. Quando muitos discípulos murmuram contra o ensinamento e deixam de segui-lo, Jesus não os chama de volta dizendo "era só metáfora". Ele pergunta aos Doze: "Também vós quereis ir-vos embora?" (Jo 6,67). Se fosse linguagem figurada, faria sentido perder discípulos por um mal-entendido? Não.

Na Última Ceia, ele diz "Isto é o meu corpo" (Mt 26,26). Em grego, a palavra usada é estin, que significa "é", não "representa" ou "significa". Os termos para "simbolizar" existiam no grego do Novo Testamento, e Jesus não os usou.

São Paulo confirma a Presença Real ao advertir os Coríntios de que comer o pão ou beber o cálice "indignamente" é ser "réu do corpo e sangue do Senhor" (1 Cor 11,27). Essa linguagem só faz sentido se houver corpo e sangue de fato presentes.

Os Padres da Igreja são unânimes nos primeiros séculos. Santo Inácio de Antioquia, ainda no ano 107, escreve que "a Eucaristia é a carne de nosso Salvador Jesus Cristo". Justino Mártir, em meados do século II, diz a mesma coisa. Cirilo de Jerusalém, no século IV, idem. Em mil anos não houve cristão sério defendendo que fosse apenas símbolo. A leitura simbólica é inovação tardia, do século XVI.`,
    references: ['jo-6-53', 'jo-6-67', 'mt-26-26', '1cor-11-27', 'cic-1373', 'inacio-esmirnenses-7'],
  },
  {
    id: 8,
    title: 'Homossexualidade e Doutrina Católica',
    category: 'Moral',
    summary: 'A Igreja distingue entre a inclinação e o ato, e chama todos a viver em dignidade e castidade.',
    body: `A doutrina católica sobre sexualidade humana é baseada em antropologia e lei natural, não em preconceito. É importante entender essa distinção para discutir o tema com clareza.

A Igreja ensina, sem ambiguidade, que toda pessoa possui dignidade inalienável, independente de orientação sexual. Pessoas com tendência homossexual devem ser acolhidas com respeito, compaixão e delicadeza, e qualquer discriminação injusta deve ser rejeitada (Catecismo §2358).

A distinção crucial é entre a inclinação e o ato. A Igreja não condena a tendência homossexual em si mesma. O que ela ensina ser contrário à lei natural são os atos homossexuais. A razão é antropológica: a sexualidade humana, na visão cristã, está ordenada à união entre homem e mulher e à transmissão da vida. Atos que excluem essa finalidade por princípio se afastam da ordem para a qual a sexualidade foi criada.

Essa posição não é discriminação. A Igreja pede castidade a todos, casados e solteiros. Um homem ou mulher heterossexual solteiro também é chamado à castidade. O ensinamento é universal, exigente, e o mesmo para todos. Não há um padrão moral para uns e outro para outros.

A objeção popular de que "o amor é amor" ignora uma distinção essencial. A Igreja afirma profundamente o amor entre pessoas do mesmo sexo, na forma de amizade, fraternidade, solidariedade. O que ela distingue é o amor da sua expressão sexual ordenada. O Papa Francisco, em Amoris Laetitia, reforçou tanto o respeito devido a essas pessoas quanto a continuidade do ensinamento doutrinal.`,
    references: ['cic-2357', 'gn-1-27', 'rm-1-26', 'amoris-laetitia-250'],
  },
];
