/**
 * Monta a "Pesquisa de Público: Apologética App" no Google Forms
 * e move o formulário para uma pasta chamada "Apologética" no Drive.
 *
 * Como usar:
 * 1. Acesse https://script.google.com e clique em "Novo projeto".
 * 2. Apague o conteúdo padrão, cole TODO este código.
 * 3. Clique em "Executar" (ícone ▶). Autorize o acesso quando pedir
 *    (é o seu próprio script acessando seus Forms/Drive).
 * 4. Pronto: o formulário fica montado e dentro da pasta "Appologética".
 *
 * Obs.: o ID abaixo é o do formulário que já comecei a montar na sua conta.
 * Se quiser começar um novo, troque a linha por:
 *   var form = FormApp.create('Pesquisa de Público: Apologética App');
 */
function montarFormulario() {
  var form = FormApp.openById('1Ii_pVOBe8LhHttmvH3L8y1lQFbTXe4mMrLOJddNnBNE');

  form.setTitle('Pesquisa de Público: Apologética App');
  form.setDescription(
    'Estamos construindo um aplicativo católico de apologética (a defesa e explicação ' +
    'da fé) e queremos torná-lo realmente útil para você. Suas respostas vão nos ajudar ' +
    'a decidir quais conteúdos e formatos priorizar. São poucos minutos e as respostas ' +
    'são anônimas. Obrigado por contribuir!'
  );

  // Limpa itens existentes para reconstruir do zero
  var itens = form.getItems();
  for (var i = itens.length - 1; i >= 0; i--) form.deleteItem(itens[i]);

  // ---- Seção 1: Sobre você ----
  form.addSectionHeaderItem().setTitle('Sobre você');

  form.addMultipleChoiceItem().setTitle('Qual a sua faixa etária?')
    .setChoiceValues(['Menos de 18','18 a 24','25 a 34','35 a 44','45 a 54','55 ou mais'])
    .setRequired(true);

  form.addMultipleChoiceItem().setTitle('Gênero')
    .setChoiceValues(['Feminino','Masculino','Prefiro não responder','Outro']);

  form.addMultipleChoiceItem().setTitle('Em qual região do Brasil você mora?')
    .setChoiceValues(['Norte','Nordeste','Centro-Oeste','Sudeste','Sul','Fora do Brasil']);

  form.addMultipleChoiceItem().setTitle('Como você descreveria sua relação com a religião hoje?')
    .setChoiceValues(['Católico praticante','Católico não praticante','Cristão de outra denominação','Em busca ou explorando a fé','Sem religião','Outro'])
    .setRequired(true);

  // ---- Seção 2: Sua caminhada de fé ----
  form.addSectionHeaderItem().setTitle('Sua caminhada de fé');

  form.addCheckboxItem().setTitle('Como você chegou à fé (ou se reaproximou dela)?')
    .setChoiceValues(['Fui criado(a) na fé desde criança (família)','Por meio de um amigo ou parceiro(a)','Após uma experiência ou momento difícil na vida','Por conteúdo na internet (vídeos, podcasts, redes sociais)','Por leitura (Bíblia, livros)','Por uma comunidade ou paróquia','Ainda estou no começo dessa caminhada','Outro']);

  form.addMultipleChoiceItem().setTitle('Há quanto tempo você vive ou pratica sua fé de forma ativa?')
    .setChoiceValues(['Menos de 1 ano','1 a 3 anos','3 a 10 anos','Mais de 10 anos','Ainda não pratico de forma ativa']);

  form.addMultipleChoiceItem().setTitle('Com que frequência você participa de atividades religiosas (missa, oração, estudo)?')
    .setChoiceValues(['Diariamente','Algumas vezes por semana','Semanalmente','Esporadicamente','Raramente ou nunca']);

  form.addMultipleChoiceItem().setTitle('Você já passou por uma situação em que precisou explicar ou defender sua fé e não soube o que responder?')
    .setChoiceValues(['Sim, várias vezes','Sim, algumas vezes','Raramente','Nunca']);

  // ---- Seção 3: O que mais te interessa sobre a fé ----
  form.addSectionHeaderItem().setTitle('O que mais te interessa sobre a fé');

  form.addCheckboxItem().setTitle('Quais destes temas mais despertam seu interesse?')
    .setChoiceValues(['A existência de Deus (razão, ciência e fé, ateísmo)','A Igreja Católica (papado, sacramentos, autoridade, Maria e santos)','A Sagrada Escritura (como ler a Bíblia, interpretação, contradições aparentes)','Moral e ética (questões atuais, bioética, sexualidade, família)','Outras religiões e denominações (protestantismo, espiritismo, outras crenças)','História da Igreja (Inquisição, Cruzadas, escândalos, mártires)','Vida espiritual e oração'])
    .setRequired(true);

  form.addParagraphTextItem().setTitle('Se você pudesse ter resposta para UMA dúvida sobre a fé hoje, qual seria?');

  form.addMultipleChoiceItem().setTitle('Qual destes temas você sente que tem MAIS dificuldade de explicar para outras pessoas?')
    .setChoiceValues(['A existência de Deus','A Igreja Católica e suas doutrinas','A Bíblia e sua interpretação','Questões morais e atuais','Diferenças entre religiões','História da Igreja','Outro']);

  // ---- Seção 4: Como você prefere consumir conteúdo ----
  form.addSectionHeaderItem().setTitle('Como você prefere consumir conteúdo');

  form.addCheckboxItem().setTitle('Em que formato você prefere aprender sobre a fé?')
    .setChoiceValues(['Textos curtos (artigos objetivos)','Textos aprofundados','Áudio / podcast','Vídeos','Quiz e jogos de perguntas','Diálogos / perguntas e respostas','Infográficos e imagens']);

  form.addMultipleChoiceItem().setTitle('Quanto tempo por dia você dedicaria a um app de fé?')
    .setChoiceValues(['Menos de 5 minutos','5 a 15 minutos','15 a 30 minutos','Mais de 30 minutos']);

  form.addCheckboxItem().setTitle('Quais recursos você mais gostaria de ter num app de apologética?')
    .setChoiceValues(['Respostas rápidas a perguntas difíceis','Bíblia com busca e anotações','Plano de estudo / leitura guiada','Quiz para testar conhecimento','Glossário de termos','Notificações com versículo ou tema do dia','Conteúdo offline','Comunidade / fórum de dúvidas']);

  form.addTextItem().setTitle('Você já usa algum app de fé hoje? Quais? (ex.: Hallow, Bíblia Ave Maria, Pocket Terço, YouVersion)');

  // ---- Seção 5: Disposição e expectativas ----
  form.addSectionHeaderItem().setTitle('Disposição e expectativas');

  form.addMultipleChoiceItem().setTitle('Você pagaria por um app de apologética com conteúdo de qualidade?')
    .setChoiceValues(['Sim, assinatura mensal','Sim, pagamento único','Só se tivesse uma versão gratuita boa','Não, só usaria se fosse gratuito']);

  form.addMultipleChoiceItem().setTitle('Se sim, qual valor mensal pareceria justo?')
    .setChoiceValues(['Até R$ 5','R$ 5 a R$ 15','R$ 15 a R$ 30','Acima de R$ 30','Não pagaria']);

  form.addTextItem().setTitle('O que faria você recomendar um app de fé para um amigo?');

  form.addParagraphTextItem().setTitle('Tem alguma sugestão, dúvida ou tema que você gostaria de ver no app?');

  form.addTextItem().setTitle('Quer acompanhar o lançamento? Deixe seu e-mail (opcional).');

  // ---- Move o formulário para a pasta "Apologética" ----
  var arquivo = DriveApp.getFileById(form.getId());
  var pastas = DriveApp.getFoldersByName('Appologética');
  var pasta = pastas.hasNext() ? pastas.next() : DriveApp.createFolder('Appologética');
  arquivo.moveTo(pasta);

  Logger.log('Pronto! Editar: ' + form.getEditUrl());
  Logger.log('Responder: ' + form.getPublishedUrl());
}
