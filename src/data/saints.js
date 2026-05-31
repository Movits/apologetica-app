// Calendário de santos por dia (Calendário Romano Geral + devoções do Brasil).
// Bilíngue (PT/EN). Para datas sem santo destacado, o app omite o card.
//
// Formato: { 'MM-DD': { name, nameEn, kind, summary, summaryEn } }
// kind: 'solenidade' | 'festa' | 'memoria' | 'opcional' | 'feria'

export const saints = {
  // ============ JANEIRO ============
  '01-01': { name: 'Santa Maria, Mãe de Deus', nameEn: 'Mary, Mother of God', kind: 'solenidade', summary: 'Oitava do Natal. Maternidade divina de Maria, definida em Éfeso (431).', summaryEn: 'Octave of Christmas. The divine motherhood of Mary, defined at Ephesus (431).' },
  '01-02': { name: 'Santos Basílio Magno e Gregório Nazianzeno', nameEn: 'Sts. Basil the Great and Gregory Nazianzen', kind: 'memoria', summary: 'Doutores da Igreja, capadócios, defensores da divindade do Espírito Santo no séc. IV.', summaryEn: 'Doctors of the Church, Cappadocians, defenders of the divinity of the Holy Spirit in the 4th century.' },
  '01-03': { name: 'Santíssimo Nome de Jesus', nameEn: 'The Most Holy Name of Jesus', kind: 'opcional', summary: 'Devoção ao nome de Jesus, "no qual há salvação" (At 4,12).', summaryEn: 'Devotion to the name of Jesus, "in which there is salvation" (Acts 4:12).' },
  '01-06': { name: 'Epifania do Senhor', nameEn: 'Epiphany of the Lord', kind: 'solenidade', summary: 'Manifestação de Jesus aos magos do oriente: a salvação chega a todas as nações.', summaryEn: 'Manifestation of Jesus to the Magi: salvation reaches all nations.' },
  '01-13': { name: 'Santo Hilário de Poitiers', nameEn: 'St. Hilary of Poitiers', kind: 'opcional', summary: 'Bispo e doutor da Igreja, defensor da fé contra o arianismo.', summaryEn: 'Bishop and Doctor of the Church, defender of the faith against Arianism.' },
  '01-17': { name: 'Santo Antão', nameEn: 'St. Anthony of Egypt', kind: 'memoria', summary: 'Pai dos monges do deserto. Abandonou tudo para seguir Cristo no séc. III-IV.', summaryEn: 'Father of desert monasticism. Left everything to follow Christ in the 3rd-4th century.' },
  '01-20': { name: 'São Sebastião', nameEn: 'St. Sebastian', kind: 'opcional', summary: 'Soldado romano mártir. Padroeiro do Rio de Janeiro. No mesmo dia, São Fabião, papa.', summaryEn: 'Roman soldier and martyr. Patron of Rio de Janeiro. Same day: St. Fabian, pope.' },
  '01-21': { name: 'Santa Inês', nameEn: 'St. Agnes', kind: 'memoria', summary: 'Virgem e mártir romana, morta aos 12-13 anos por sua fé.', summaryEn: 'Roman virgin and martyr, killed at age 12-13 for her faith.' },
  '01-24': { name: 'São Francisco de Sales', nameEn: 'St. Francis de Sales', kind: 'memoria', summary: 'Bispo e doutor da Igreja, padroeiro dos jornalistas e escritores.', summaryEn: 'Bishop and Doctor of the Church, patron of journalists and writers.' },
  '01-25': { name: 'Conversão de São Paulo', nameEn: 'Conversion of St. Paul', kind: 'festa', summary: 'O perseguidor de cristãos torna-se apóstolo dos gentios na estrada de Damasco.', summaryEn: 'The persecutor of Christians becomes the apostle to the Gentiles on the road to Damascus.' },
  '01-26': { name: 'Santos Timóteo e Tito', nameEn: 'Sts. Timothy and Titus', kind: 'memoria', summary: 'Discípulos e companheiros de São Paulo, destinatários de suas cartas.', summaryEn: 'Disciples and companions of St. Paul, recipients of his letters.' },
  '01-28': { name: 'Santo Tomás de Aquino', nameEn: 'St. Thomas Aquinas', kind: 'memoria', summary: 'Doutor Angélico, autor da Suma Teológica. Síntese máxima entre fé e razão.', summaryEn: 'The Angelic Doctor, author of the Summa Theologica. The supreme synthesis of faith and reason.' },
  '01-31': { name: 'São João Bosco', nameEn: 'St. John Bosco', kind: 'memoria', summary: 'Fundador dos salesianos, dedicou a vida à educação cristã da juventude.', summaryEn: 'Founder of the Salesians, devoted his life to the Christian education of youth.' },

  // ============ FEVEREIRO ============
  '02-02': { name: 'Apresentação do Senhor', nameEn: 'Presentation of the Lord', kind: 'festa', summary: 'Festa das Candeias. Jesus apresentado no Templo conforme a Lei.', summaryEn: 'Candlemas. Jesus presented in the Temple according to the Law.' },
  '02-05': { name: 'Santa Águeda', nameEn: 'St. Agatha', kind: 'memoria', summary: 'Virgem e mártir da Sicília, séc. III.', summaryEn: 'Virgin and martyr of Sicily, 3rd century.' },
  '02-06': { name: 'São Paulo Miki e companheiros', nameEn: 'St. Paul Miki and Companions', kind: 'memoria', summary: 'Mártires do Japão, crucificados em Nagasaki em 1597.', summaryEn: 'Martyrs of Japan, crucified at Nagasaki in 1597.' },
  '02-08': { name: 'Santa Josefina Bakhita', nameEn: 'St. Josephine Bakhita', kind: 'opcional', summary: 'Ex-escrava sudanesa, religiosa canossiana. Padroeira contra o tráfico humano.', summaryEn: 'Former Sudanese slave, Canossian sister. Patron against human trafficking.' },
  '02-10': { name: 'Santa Escolástica', nameEn: 'St. Scholastica', kind: 'memoria', summary: 'Irmã de São Bento, fundadora do ramo feminino beneditino.', summaryEn: 'Sister of St. Benedict, foundress of the Benedictine nuns.' },
  '02-11': { name: 'Nossa Senhora de Lourdes', nameEn: 'Our Lady of Lourdes', kind: 'opcional', summary: 'Aparições de Maria a Santa Bernadette em 1858. Dia Mundial do Doente.', summaryEn: 'Apparitions of Mary to St. Bernadette in 1858. World Day of the Sick.' },
  '02-14': { name: 'Santos Cirilo e Metódio', nameEn: 'Sts. Cyril and Methodius', kind: 'memoria', summary: 'Apóstolos dos eslavos, copadroeiros da Europa.', summaryEn: 'Apostles to the Slavs, co-patrons of Europe.' },
  '02-22': { name: 'Cátedra de São Pedro', nameEn: 'Chair of St. Peter', kind: 'festa', summary: 'Festa do primado petrino e da autoridade da Igreja.', summaryEn: 'Feast of the Petrine primacy and the authority of the Church.' },
  '02-23': { name: 'São Policarpo', nameEn: 'St. Polycarp', kind: 'memoria', summary: 'Bispo de Esmirna, discípulo de São João, mártir no séc. II.', summaryEn: 'Bishop of Smyrna, disciple of St. John, martyred in the 2nd century.' },

  // ============ MARÇO ============
  '03-07': { name: 'Santas Perpétua e Felicidade', nameEn: 'Sts. Perpetua and Felicity', kind: 'memoria', summary: 'Mártires de Cartago (203), cujo relato de prisão sobreviveu até hoje.', summaryEn: 'Martyrs of Carthage (203), whose prison account survives to this day.' },
  '03-08': { name: 'São João de Deus', nameEn: 'St. John of God', kind: 'opcional', summary: 'Fundador dos Irmãos Hospitaleiros, padroeiro dos enfermos e enfermeiros.', summaryEn: 'Founder of the Brothers Hospitallers, patron of the sick and of nurses.' },
  '03-17': { name: 'São Patrício', nameEn: 'St. Patrick', kind: 'opcional', summary: 'Bispo que evangelizou a Irlanda no séc. V.', summaryEn: 'Bishop who evangelized Ireland in the 5th century.' },
  '03-18': { name: 'São Cirilo de Jerusalém', nameEn: 'St. Cyril of Jerusalem', kind: 'opcional', summary: 'Bispo e doutor da Igreja, autor das Catequeses Mistagógicas.', summaryEn: 'Bishop and Doctor of the Church, author of the Mystagogical Catecheses.' },
  '03-19': { name: 'São José, Esposo de Maria', nameEn: 'St. Joseph, Spouse of Mary', kind: 'solenidade', summary: 'Pai virginal de Jesus, padroeiro da Igreja universal e dos trabalhadores.', summaryEn: 'Virginal father of Jesus, patron of the universal Church and of workers.' },
  '03-23': { name: 'São Toríbio de Mogrovejo', nameEn: 'St. Turibius of Mogrovejo', kind: 'opcional', summary: 'Arcebispo de Lima, evangelizador da América do Sul.', summaryEn: 'Archbishop of Lima, evangelizer of South America.' },
  '03-25': { name: 'Anunciação do Senhor', nameEn: 'Annunciation of the Lord', kind: 'solenidade', summary: 'Encarnação do Verbo no ventre de Maria. Nove meses antes do Natal.', summaryEn: 'The Incarnation of the Word in Mary\'s womb. Nine months before Christmas.' },

  // ============ ABRIL ============
  '04-02': { name: 'São Francisco de Paula', nameEn: 'St. Francis of Paola', kind: 'opcional', summary: 'Eremita italiano, fundador dos Mínimos.', summaryEn: 'Italian hermit, founder of the Order of Minims.' },
  '04-04': { name: 'Santo Isidoro de Sevilha', nameEn: 'St. Isidore of Seville', kind: 'opcional', summary: 'Bispo e doutor da Igreja, último dos Padres latinos.', summaryEn: 'Bishop and Doctor of the Church, last of the Latin Fathers.' },
  '04-07': { name: 'São João Batista de La Salle', nameEn: 'St. John Baptist de La Salle', kind: 'memoria', summary: 'Fundador dos Irmãos das Escolas Cristãs, padroeiro dos professores.', summaryEn: 'Founder of the Brothers of the Christian Schools, patron of teachers.' },
  '04-23': { name: 'São Jorge', nameEn: 'St. George', kind: 'opcional', summary: 'Mártir soldado, muito venerado no Oriente e no Brasil.', summaryEn: 'Soldier martyr, greatly venerated in the East and in Brazil.' },
  '04-25': { name: 'São Marcos, Evangelista', nameEn: 'St. Mark, Evangelist', kind: 'festa', summary: 'Companheiro de Pedro, escreveu o segundo Evangelho a partir da pregação petrina.', summaryEn: 'Companion of Peter, wrote the second Gospel from Peter\'s preaching.' },
  '04-28': { name: 'São Luís Maria Grignion de Montfort', nameEn: 'St. Louis de Montfort', kind: 'opcional', summary: 'Pregador, autor do "Tratado da Verdadeira Devoção a Maria".', summaryEn: 'Preacher, author of "True Devotion to Mary".' },
  '04-29': { name: 'Santa Catarina de Sena', nameEn: 'St. Catherine of Siena', kind: 'memoria', summary: 'Doutora da Igreja, mística, padroeira da Europa. Levou o Papa de volta a Roma.', summaryEn: 'Doctor of the Church, mystic, patron of Europe. Brought the Pope back to Rome.' },
  '04-30': { name: 'São Pio V', nameEn: 'St. Pius V', kind: 'opcional', summary: 'Papa do Concílio de Trento, promoveu o Rosário e a vitória de Lepanto.', summaryEn: 'Pope of the Council of Trent, promoted the Rosary and the victory of Lepanto.' },

  // ============ MAIO ============
  '05-01': { name: 'São José Operário', nameEn: 'St. Joseph the Worker', kind: 'opcional', summary: 'Dignidade do trabalho humano santificado pelo exemplo de São José.', summaryEn: 'The dignity of human work sanctified by the example of St. Joseph.' },
  '05-02': { name: 'Santo Atanásio', nameEn: 'St. Athanasius', kind: 'memoria', summary: 'Bispo de Alexandria e doutor, defensor incansável da divindade de Cristo.', summaryEn: 'Bishop of Alexandria and Doctor, tireless defender of Christ\'s divinity.' },
  '05-03': { name: 'Santos Filipe e Tiago', nameEn: 'Sts. Philip and James', kind: 'festa', summary: 'Apóstolos. Filipe pregou na Ásia Menor; Tiago Menor foi bispo de Jerusalém.', summaryEn: 'Apostles. Philip preached in Asia Minor; James the Less was bishop of Jerusalem.' },
  '05-13': { name: 'Nossa Senhora de Fátima', nameEn: 'Our Lady of Fatima', kind: 'opcional', summary: 'Primeira aparição em Fátima, Portugal, em 1917, com chamado à oração e penitência.', summaryEn: 'First apparition at Fatima, Portugal, in 1917, calling for prayer and penance.' },
  '05-14': { name: 'São Matias, Apóstolo', nameEn: 'St. Matthias, Apostle', kind: 'festa', summary: 'Substituiu Judas Iscariotes no colégio apostólico (At 1,15-26).', summaryEn: 'Replaced Judas Iscariot in the apostolic college (Acts 1:15-26).' },
  '05-22': { name: 'Santa Rita de Cássia', nameEn: 'St. Rita of Cascia', kind: 'opcional', summary: 'Religiosa agostiniana, padroeira das causas impossíveis. Muito venerada no Brasil.', summaryEn: 'Augustinian nun, patron of impossible causes. Greatly venerated in Brazil.' },
  '05-26': { name: 'São Filipe Néri', nameEn: 'St. Philip Neri', kind: 'memoria', summary: 'Fundador do Oratório, o "apóstolo alegre de Roma".', summaryEn: 'Founder of the Oratory, the "joyful apostle of Rome".' },
  '05-31': { name: 'Visitação de Nossa Senhora', nameEn: 'Visitation of Mary', kind: 'festa', summary: 'Maria visita Isabel; ocasião do Magnificat (Lc 1,46-55).', summaryEn: 'Mary visits Elizabeth; the occasion of the Magnificat (Lk 1:46-55).' },

  // ============ JUNHO ============
  '06-01': { name: 'São Justino', nameEn: 'St. Justin Martyr', kind: 'memoria', summary: 'Filósofo e mártir do séc. II, primeiro grande apologista cristão.', summaryEn: 'Philosopher and martyr of the 2nd century, the first great Christian apologist.' },
  '06-03': { name: 'Santos Carlos Lwanga e companheiros', nameEn: 'Sts. Charles Lwanga and Companions', kind: 'memoria', summary: 'Mártires de Uganda, jovens pajens mortos por sua fé (1886).', summaryEn: 'Martyrs of Uganda, young pages killed for their faith (1886).' },
  '06-05': { name: 'São Bonifácio', nameEn: 'St. Boniface', kind: 'memoria', summary: 'Bispo e mártir, apóstolo da Alemanha.', summaryEn: 'Bishop and martyr, apostle of Germany.' },
  '06-11': { name: 'São Barnabé, Apóstolo', nameEn: 'St. Barnabas, Apostle', kind: 'memoria', summary: 'Companheiro de Paulo na primeira viagem missionária.', summaryEn: 'Companion of Paul on the first missionary journey.' },
  '06-13': { name: 'Santo Antônio de Pádua', nameEn: 'St. Anthony of Padua', kind: 'memoria', summary: 'Doutor da Igreja, franciscano, padroeiro dos pobres e dos objetos perdidos.', summaryEn: 'Doctor of the Church, Franciscan, patron of the poor and of lost things.' },
  '06-21': { name: 'São Luís Gonzaga', nameEn: 'St. Aloysius Gonzaga', kind: 'memoria', summary: 'Jovem jesuíta, padroeiro da juventude. Morreu cuidando de doentes.', summaryEn: 'Young Jesuit, patron of youth. Died caring for the sick.' },
  '06-24': { name: 'Nascimento de São João Batista', nameEn: 'Nativity of St. John the Baptist', kind: 'solenidade', summary: 'Precursor de Cristo. Único santo (além de Maria) cujo nascimento é celebrado.', summaryEn: 'Forerunner of Christ. The only saint (besides Mary) whose birth is celebrated.' },
  '06-28': { name: 'Santo Irineu de Lyon', nameEn: 'St. Irenaeus of Lyon', kind: 'memoria', summary: 'Bispo, mártir e doutor da Igreja, grande adversário das heresias gnósticas.', summaryEn: 'Bishop, martyr and Doctor of the Church, great opponent of the Gnostic heresies.' },
  '06-29': { name: 'Santos Pedro e Paulo', nameEn: 'Sts. Peter and Paul', kind: 'solenidade', summary: 'Pilares da Igreja em Roma. Ambos martirizados na Cidade Eterna sob Nero.', summaryEn: 'Pillars of the Church in Rome. Both martyred in the Eternal City under Nero.' },

  // ============ JULHO ============
  '07-03': { name: 'São Tomé, Apóstolo', nameEn: 'St. Thomas, Apostle', kind: 'festa', summary: 'O que duvidou e depois confessou "Senhor meu e Deus meu". Levou o evangelho à Índia.', summaryEn: 'The one who doubted then confessed "My Lord and my God". Brought the Gospel to India.' },
  '07-06': { name: 'Santa Maria Goretti', nameEn: 'St. Maria Goretti', kind: 'opcional', summary: 'Jovem mártir da pureza (1902), que perdoou seu agressor.', summaryEn: 'Young martyr of purity (1902), who forgave her attacker.' },
  '07-11': { name: 'São Bento', nameEn: 'St. Benedict', kind: 'memoria', summary: 'Patriarca do monaquismo ocidental, padroeiro da Europa. "Ora et labora".', summaryEn: 'Patriarch of Western monasticism, patron of Europe. "Ora et labora".' },
  '07-15': { name: 'São Boaventura', nameEn: 'St. Bonaventure', kind: 'memoria', summary: 'Franciscano, doutor da Igreja, o "Doutor Seráfico".', summaryEn: 'Franciscan, Doctor of the Church, the "Seraphic Doctor".' },
  '07-16': { name: 'Nossa Senhora do Carmo', nameEn: 'Our Lady of Mount Carmel', kind: 'opcional', summary: 'Devoção carmelita do Escapulário. Padroeira de muitas cidades brasileiras.', summaryEn: 'Carmelite devotion of the Scapular. Patron of many Brazilian cities.' },
  '07-22': { name: 'Santa Maria Madalena', nameEn: 'St. Mary Magdalene', kind: 'festa', summary: 'Primeira testemunha da Ressurreição. "Apóstola dos apóstolos".', summaryEn: 'First witness of the Resurrection. "Apostle to the apostles".' },
  '07-25': { name: 'São Tiago Maior', nameEn: 'St. James the Greater', kind: 'festa', summary: 'Apóstolo, irmão de João Evangelista. Primeiro mártir entre os Doze.', summaryEn: 'Apostle, brother of John the Evangelist. First martyr among the Twelve.' },
  '07-26': { name: 'Santos Joaquim e Ana', nameEn: 'Sts. Joachim and Anne', kind: 'memoria', summary: 'Pais da Virgem Maria, avós de Jesus.', summaryEn: 'Parents of the Virgin Mary, grandparents of Jesus.' },
  '07-29': { name: 'Santas Marta, Maria e Lázaro', nameEn: 'Sts. Martha, Mary and Lazarus', kind: 'memoria', summary: 'Os amigos de Jesus que o acolheram em Betânia.', summaryEn: 'The friends of Jesus who welcomed him in Bethany.' },
  '07-31': { name: 'Santo Inácio de Loyola', nameEn: 'St. Ignatius of Loyola', kind: 'memoria', summary: 'Fundador da Companhia de Jesus (jesuítas), autor dos Exercícios Espirituais.', summaryEn: 'Founder of the Society of Jesus (Jesuits), author of the Spiritual Exercises.' },

  // ============ AGOSTO ============
  '08-01': { name: 'Santo Afonso Maria de Ligório', nameEn: 'St. Alphonsus Liguori', kind: 'memoria', summary: 'Fundador dos redentoristas, doutor da Igreja, mestre da teologia moral.', summaryEn: 'Founder of the Redemptorists, Doctor of the Church, master of moral theology.' },
  '08-04': { name: 'São João Maria Vianney', nameEn: 'St. John Vianney', kind: 'memoria', summary: 'O Cura d\'Ars, padroeiro dos párocos. Confessor incansável.', summaryEn: 'The Curé of Ars, patron of parish priests. A tireless confessor.' },
  '08-06': { name: 'Transfiguração do Senhor', nameEn: 'Transfiguration of the Lord', kind: 'festa', summary: 'Jesus se manifesta em glória no monte Tabor diante de Pedro, Tiago e João.', summaryEn: 'Jesus manifests his glory on Mount Tabor before Peter, James and John.' },
  '08-08': { name: 'São Domingos de Gusmão', nameEn: 'St. Dominic', kind: 'memoria', summary: 'Fundador da Ordem dos Pregadores (dominicanos), difusor do Rosário.', summaryEn: 'Founder of the Order of Preachers (Dominicans), promoter of the Rosary.' },
  '08-10': { name: 'São Lourenço', nameEn: 'St. Lawrence', kind: 'festa', summary: 'Diácono mártir do séc. III. Distribuiu os bens da Igreja aos pobres.', summaryEn: 'Deacon martyr of the 3rd century. Distributed the Church\'s goods to the poor.' },
  '08-11': { name: 'Santa Clara de Assis', nameEn: 'St. Clare of Assisi', kind: 'memoria', summary: 'Discípula de São Francisco, fundadora das Clarissas.', summaryEn: 'Disciple of St. Francis, foundress of the Poor Clares.' },
  '08-14': { name: 'São Maximiliano Maria Kolbe', nameEn: 'St. Maximilian Kolbe', kind: 'memoria', summary: 'Franciscano que ofereceu a vida por outro prisioneiro em Auschwitz (1941).', summaryEn: 'Franciscan who gave his life for another prisoner at Auschwitz (1941).' },
  '08-15': { name: 'Assunção de Nossa Senhora', nameEn: 'Assumption of Mary', kind: 'solenidade', summary: 'Maria assumida em corpo e alma à glória celeste. Dogma definido em 1950.', summaryEn: 'Mary taken body and soul into heavenly glory. Dogma defined in 1950.' },
  '08-20': { name: 'São Bernardo de Claraval', nameEn: 'St. Bernard of Clairvaux', kind: 'memoria', summary: 'Abade cisterciense e doutor da Igreja, grande devoto de Maria.', summaryEn: 'Cistercian abbot and Doctor of the Church, great devotee of Mary.' },
  '08-21': { name: 'São Pio X', nameEn: 'St. Pius X', kind: 'memoria', summary: 'Papa da comunhão frequente e da comunhão das crianças.', summaryEn: 'Pope of frequent Communion and of Communion for children.' },
  '08-22': { name: 'Nossa Senhora Rainha', nameEn: 'Queenship of Mary', kind: 'memoria', summary: 'Maria coroada Rainha do Céu, oitavo dia após a Assunção.', summaryEn: 'Mary crowned Queen of Heaven, the eighth day after the Assumption.' },
  '08-24': { name: 'São Bartolomeu, Apóstolo', nameEn: 'St. Bartholomew, Apostle', kind: 'festa', summary: 'Apóstolo (identificado com Natanael), mártir.', summaryEn: 'Apostle (identified with Nathanael), martyr.' },
  '08-27': { name: 'Santa Mônica', nameEn: 'St. Monica', kind: 'memoria', summary: 'Mãe de Santo Agostinho, modelo de perseverança na oração pelos filhos.', summaryEn: 'Mother of St. Augustine, model of perseverance in prayer for one\'s children.' },
  '08-28': { name: 'Santo Agostinho', nameEn: 'St. Augustine', kind: 'memoria', summary: 'Bispo de Hipona, doutor da Igreja, autor das Confissões.', summaryEn: 'Bishop of Hippo, Doctor of the Church, author of the Confessions.' },
  '08-29': { name: 'Martírio de São João Batista', nameEn: 'Passion of St. John the Baptist', kind: 'memoria', summary: 'Decapitação do Precursor por ordem de Herodes.', summaryEn: 'Beheading of the Forerunner by order of Herod.' },

  // ============ SETEMBRO ============
  '09-03': { name: 'São Gregório Magno', nameEn: 'St. Gregory the Great', kind: 'memoria', summary: 'Papa e doutor da Igreja, reformador da liturgia e do canto.', summaryEn: 'Pope and Doctor of the Church, reformer of the liturgy and of chant.' },
  '09-08': { name: 'Natividade de Nossa Senhora', nameEn: 'Nativity of Mary', kind: 'festa', summary: 'Nascimento da Mãe de Deus, nove meses após a Imaculada Conceição.', summaryEn: 'Birth of the Mother of God, nine months after the Immaculate Conception.' },
  '09-13': { name: 'São João Crisóstomo', nameEn: 'St. John Chrysostom', kind: 'memoria', summary: 'Bispo de Constantinopla e doutor, "boca de ouro" pela sua pregação.', summaryEn: 'Bishop of Constantinople and Doctor, "golden-mouthed" for his preaching.' },
  '09-14': { name: 'Exaltação da Santa Cruz', nameEn: 'Exaltation of the Holy Cross', kind: 'festa', summary: 'Celebração da Cruz, instrumento da nossa salvação.', summaryEn: 'Celebration of the Cross, the instrument of our salvation.' },
  '09-15': { name: 'Nossa Senhora das Dores', nameEn: 'Our Lady of Sorrows', kind: 'memoria', summary: 'Maria associada à Paixão de Cristo. As sete dores de Maria.', summaryEn: 'Mary associated with the Passion of Christ. The seven sorrows of Mary.' },
  '09-16': { name: 'Santos Cornélio e Cipriano', nameEn: 'Sts. Cornelius and Cyprian', kind: 'memoria', summary: 'Papa e bispo, mártires do séc. III.', summaryEn: 'Pope and bishop, martyrs of the 3rd century.' },
  '09-20': { name: 'Santos André Kim e companheiros', nameEn: 'Sts. Andrew Kim and Companions', kind: 'memoria', summary: 'Mártires da Coreia do séc. XIX.', summaryEn: 'Martyrs of Korea in the 19th century.' },
  '09-21': { name: 'São Mateus, Apóstolo e Evangelista', nameEn: 'St. Matthew, Apostle and Evangelist', kind: 'festa', summary: 'Publicano chamado por Jesus. Escreveu o primeiro Evangelho.', summaryEn: 'Tax collector called by Jesus. Wrote the first Gospel.' },
  '09-23': { name: 'São Pio de Pietrelcina', nameEn: 'St. Pius of Pietrelcina (Padre Pio)', kind: 'memoria', summary: 'Frade capuchinho que recebeu os estigmas. Confessor e taumaturgo.', summaryEn: 'Capuchin friar who bore the stigmata. Confessor and wonder-worker.' },
  '09-26': { name: 'Santos Cosme e Damião', nameEn: 'Sts. Cosmas and Damian', kind: 'opcional', summary: 'Médicos mártires, padroeiros dos médicos. Muito populares no Brasil.', summaryEn: 'Physician martyrs, patrons of doctors. Very popular in Brazil.' },
  '09-27': { name: 'São Vicente de Paulo', nameEn: 'St. Vincent de Paul', kind: 'memoria', summary: 'Apóstolo da caridade, fundador das obras de assistência aos pobres.', summaryEn: 'Apostle of charity, founder of works of assistance to the poor.' },
  '09-29': { name: 'Santos Arcanjos Miguel, Gabriel e Rafael', nameEn: 'Sts. Michael, Gabriel and Raphael, Archangels', kind: 'festa', summary: 'Os três arcanjos nomeados na Sagrada Escritura.', summaryEn: 'The three archangels named in Sacred Scripture.' },
  '09-30': { name: 'São Jerônimo', nameEn: 'St. Jerome', kind: 'memoria', summary: 'Doutor da Igreja, tradutor da Bíblia para o latim (Vulgata).', summaryEn: 'Doctor of the Church, translator of the Bible into Latin (the Vulgate).' },

  // ============ OUTUBRO ============
  '10-01': { name: 'Santa Teresinha do Menino Jesus', nameEn: 'St. Thérèse of Lisieux', kind: 'memoria', summary: 'Carmelita francesa, doutora da Igreja. A "pequena via" de confiança.', summaryEn: 'French Carmelite, Doctor of the Church. The "little way" of trust.' },
  '10-02': { name: 'Santos Anjos da Guarda', nameEn: 'Guardian Angels', kind: 'memoria', summary: 'Memória dos anjos que Deus dá a cada pessoa para guardá-la.', summaryEn: 'Memorial of the angels God gives to each person to protect them.' },
  '10-04': { name: 'São Francisco de Assis', nameEn: 'St. Francis of Assisi', kind: 'memoria', summary: 'Fundador dos franciscanos, padroeiro da Itália e da ecologia.', summaryEn: 'Founder of the Franciscans, patron of Italy and of ecology.' },
  '10-07': { name: 'Nossa Senhora do Rosário', nameEn: 'Our Lady of the Rosary', kind: 'memoria', summary: 'Instituída por São Pio V após a vitória em Lepanto (1571).', summaryEn: 'Instituted by St. Pius V after the victory at Lepanto (1571).' },
  '10-11': { name: 'São João XXIII', nameEn: 'St. John XXIII', kind: 'opcional', summary: 'Papa que convocou o Concílio Vaticano II. O "Papa bom".', summaryEn: 'Pope who convoked the Second Vatican Council. The "Good Pope".' },
  '10-12': { name: 'Nossa Senhora Aparecida', nameEn: 'Our Lady of Aparecida', kind: 'solenidade', summary: 'Padroeira do Brasil. Imagem encontrada no rio Paraíba em 1717.', summaryEn: 'Patroness of Brazil. The image found in the Paraíba river in 1717.' },
  '10-15': { name: 'Santa Teresa de Ávila', nameEn: 'St. Teresa of Ávila', kind: 'memoria', summary: 'Carmelita reformadora, mística, doutora da Igreja.', summaryEn: 'Carmelite reformer, mystic, Doctor of the Church.' },
  '10-16': { name: 'Santa Margarida Maria Alacoque', nameEn: 'St. Margaret Mary Alacoque', kind: 'opcional', summary: 'Visionária do Sagrado Coração de Jesus.', summaryEn: 'Visionary of the Sacred Heart of Jesus.' },
  '10-17': { name: 'Santo Inácio de Antioquia', nameEn: 'St. Ignatius of Antioch', kind: 'memoria', summary: 'Bispo e mártir do séc. II, testemunha da Eucaristia e da unidade da Igreja.', summaryEn: 'Bishop and martyr of the 2nd century, witness to the Eucharist and Church unity.' },
  '10-18': { name: 'São Lucas, Evangelista', nameEn: 'St. Luke, Evangelist', kind: 'festa', summary: 'Médico, autor do terceiro Evangelho e dos Atos dos Apóstolos.', summaryEn: 'Physician, author of the third Gospel and the Acts of the Apostles.' },
  '10-22': { name: 'São João Paulo II', nameEn: 'St. John Paul II', kind: 'opcional', summary: 'Papa de 1978 a 2005. Canonizado em 2014.', summaryEn: 'Pope from 1978 to 2005. Canonized in 2014.' },
  '10-28': { name: 'Santos Simão e Judas', nameEn: 'Sts. Simon and Jude', kind: 'festa', summary: 'Apóstolos. Judas Tadeu, padroeiro das causas difíceis.', summaryEn: 'Apostles. Jude Thaddaeus, patron of difficult causes.' },

  // ============ NOVEMBRO ============
  '11-01': { name: 'Todos os Santos', nameEn: 'All Saints', kind: 'solenidade', summary: 'Festa de todos os santos canonizados e dos santos anônimos, conhecidos só de Deus.', summaryEn: 'Feast of all canonized saints and the unknown saints, known only to God.' },
  '11-02': { name: 'Comemoração dos Fiéis Defuntos', nameEn: 'All Souls', kind: 'solenidade', summary: 'Oração pelos que partiram, em especial os que se purificam no Purgatório.', summaryEn: 'Prayer for the departed, especially those being purified in Purgatory.' },
  '11-03': { name: 'São Martinho de Porres', nameEn: 'St. Martin de Porres', kind: 'opcional', summary: 'Dominicano peruano, padroeiro da justiça social e da harmonia racial.', summaryEn: 'Peruvian Dominican, patron of social justice and racial harmony.' },
  '11-04': { name: 'São Carlos Borromeu', nameEn: 'St. Charles Borromeo', kind: 'memoria', summary: 'Bispo reformador, figura-chave na aplicação do Concílio de Trento.', summaryEn: 'Reforming bishop, key figure in implementing the Council of Trent.' },
  '11-09': { name: 'Dedicação da Basílica de Latrão', nameEn: 'Dedication of the Lateran Basilica', kind: 'festa', summary: 'Catedral do Papa, "mãe e cabeça de todas as igrejas".', summaryEn: 'The Pope\'s cathedral, "mother and head of all churches".' },
  '11-10': { name: 'São Leão Magno', nameEn: 'St. Leo the Great', kind: 'memoria', summary: 'Papa e doutor da Igreja, definiu a fé cristológica em Calcedônia (451).', summaryEn: 'Pope and Doctor of the Church, defined the Christological faith at Chalcedon (451).' },
  '11-11': { name: 'São Martinho de Tours', nameEn: 'St. Martin of Tours', kind: 'memoria', summary: 'Soldado que partiu seu manto com um pobre; depois bispo evangelizador.', summaryEn: 'Soldier who shared his cloak with a poor man; later an evangelizing bishop.' },
  '11-12': { name: 'São Josafá', nameEn: 'St. Josaphat', kind: 'memoria', summary: 'Bispo e mártir, promotor da unidade entre católicos e ortodoxos.', summaryEn: 'Bishop and martyr, promoter of unity between Catholics and Orthodox.' },
  '11-17': { name: 'Santa Isabel da Hungria', nameEn: 'St. Elizabeth of Hungary', kind: 'memoria', summary: 'Princesa que se dedicou aos pobres e doentes. Padroeira da Ordem Franciscana Secular.', summaryEn: 'Princess who devoted herself to the poor and sick. Patron of the Secular Franciscan Order.' },
  '11-21': { name: 'Apresentação de Nossa Senhora', nameEn: 'Presentation of Mary', kind: 'memoria', summary: 'Tradição da entrada de Maria no Templo de Jerusalém ainda criança.', summaryEn: 'Tradition of Mary\'s entrance into the Temple of Jerusalem as a child.' },
  '11-22': { name: 'Santa Cecília', nameEn: 'St. Cecilia', kind: 'memoria', summary: 'Virgem e mártir romana, padroeira dos músicos.', summaryEn: 'Roman virgin and martyr, patron of musicians.' },
  '11-24': { name: 'Santo André Dung-Lac e companheiros', nameEn: 'St. Andrew Dung-Lac and Companions', kind: 'memoria', summary: 'Mártires do Vietnã (séc. XVIII-XIX).', summaryEn: 'Martyrs of Vietnam (18th-19th century).' },
  '11-30': { name: 'Santo André, Apóstolo', nameEn: 'St. Andrew, Apostle', kind: 'festa', summary: 'Irmão de Pedro, primeiro chamado por Jesus.', summaryEn: 'Brother of Peter, the first called by Jesus.' },

  // ============ DEZEMBRO ============
  '12-03': { name: 'São Francisco Xavier', nameEn: 'St. Francis Xavier', kind: 'memoria', summary: 'Jesuíta missionário na Índia e no Japão. Padroeiro das missões.', summaryEn: 'Jesuit missionary to India and Japan. Patron of the missions.' },
  '12-06': { name: 'São Nicolau', nameEn: 'St. Nicholas', kind: 'opcional', summary: 'Bispo de Mira, conhecido por sua generosidade. Origem do "Papai Noel".', summaryEn: 'Bishop of Myra, known for his generosity. Origin of "Santa Claus".' },
  '12-07': { name: 'Santo Ambrósio', nameEn: 'St. Ambrose', kind: 'memoria', summary: 'Bispo de Milão e doutor da Igreja, que batizou Santo Agostinho.', summaryEn: 'Bishop of Milan and Doctor of the Church, who baptized St. Augustine.' },
  '12-08': { name: 'Imaculada Conceição', nameEn: 'Immaculate Conception', kind: 'solenidade', summary: 'Maria concebida sem pecado original. Dogma definido por Pio IX em 1854.', summaryEn: 'Mary conceived without original sin. Dogma defined by Pius IX in 1854.' },
  '12-09': { name: 'São Juan Diego', nameEn: 'St. Juan Diego', kind: 'opcional', summary: 'Indígena a quem Nossa Senhora de Guadalupe apareceu no México (1531).', summaryEn: 'Indigenous man to whom Our Lady of Guadalupe appeared in Mexico (1531).' },
  '12-12': { name: 'Nossa Senhora de Guadalupe', nameEn: 'Our Lady of Guadalupe', kind: 'festa', summary: 'Aparição a São Juan Diego em 1531. Padroeira das Américas.', summaryEn: 'Apparition to St. Juan Diego in 1531. Patroness of the Americas.' },
  '12-13': { name: 'Santa Luzia', nameEn: 'St. Lucy', kind: 'memoria', summary: 'Virgem e mártir, invocada pela saúde dos olhos.', summaryEn: 'Virgin and martyr, invoked for the health of the eyes.' },
  '12-14': { name: 'São João da Cruz', nameEn: 'St. John of the Cross', kind: 'memoria', summary: 'Carmelita reformador, místico e doutor da Igreja. "Noite escura da alma".', summaryEn: 'Carmelite reformer, mystic and Doctor of the Church. "Dark night of the soul".' },
  '12-25': { name: 'Natal do Senhor', nameEn: 'Nativity of the Lord (Christmas)', kind: 'solenidade', summary: 'Nascimento de Cristo segundo a carne. O Verbo se fez carne.', summaryEn: 'The birth of Christ according to the flesh. The Word became flesh.' },
  '12-26': { name: 'Santo Estêvão, Protomártir', nameEn: 'St. Stephen, First Martyr', kind: 'festa', summary: 'Primeiro mártir cristão, apedrejado em Jerusalém (At 7).', summaryEn: 'The first Christian martyr, stoned in Jerusalem (Acts 7).' },
  '12-27': { name: 'São João, Apóstolo e Evangelista', nameEn: 'St. John, Apostle and Evangelist', kind: 'festa', summary: 'O discípulo amado, autor do quarto Evangelho, das cartas e do Apocalipse.', summaryEn: 'The beloved disciple, author of the fourth Gospel, the letters and Revelation.' },
  '12-28': { name: 'Santos Inocentes', nameEn: 'Holy Innocents', kind: 'festa', summary: 'Crianças de Belém mortas por Herodes, primeiros mártires de Cristo (Mt 2,16-18).', summaryEn: 'The children of Bethlehem killed by Herod, the first martyrs for Christ (Mt 2:16-18).' },
  '12-29': { name: 'São Tomás Becket', nameEn: 'St. Thomas Becket', kind: 'opcional', summary: 'Arcebispo de Canterbury, mártir pela liberdade da Igreja (1170).', summaryEn: 'Archbishop of Canterbury, martyr for the freedom of the Church (1170).' },
  '12-31': { name: 'São Silvestre I', nameEn: 'St. Sylvester I', kind: 'opcional', summary: 'Papa durante o reinado de Constantino, no início da paz da Igreja.', summaryEn: 'Pope during the reign of Constantine, at the dawn of the Church\'s peace.' },
};

// Algoritmo da Páscoa (Meeus/Jones/Butcher, calendário gregoriano).
// Retorna um Date com a Páscoa do ano dado.
function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function md(d) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Calcula festas móveis baseadas na Páscoa do ano.
// Em 2026: Páscoa = 5/abril, Pentecostes = 24/maio, Trindade = 31/maio,
// Corpus Christi = 4/junho, Sagrado Coração = 12/junho, Imaculado Coração = 13/junho.
function movableFeastsFor(year) {
  const easter = easterDate(year);
  return {
    [md(addDays(easter, -46))]: {
      name: 'Quarta-feira de Cinzas',
      nameEn: 'Ash Wednesday',
      kind: 'feria',
      summary: 'Início da Quaresma. Imposição das cinzas e chamado à conversão. Dia de jejum e abstinência.',
      summaryEn: 'Beginning of Lent. Imposition of ashes and call to conversion. A day of fasting and abstinence.',
    },
    [md(addDays(easter, -7))]: {
      name: 'Domingo de Ramos',
      nameEn: 'Palm Sunday',
      kind: 'solenidade',
      summary: 'Entrada triunfal de Jesus em Jerusalém. Início da Semana Santa.',
      summaryEn: 'The triumphal entry of Jesus into Jerusalem. Beginning of Holy Week.',
    },
    [md(addDays(easter, -3))]: {
      name: 'Quinta-feira Santa',
      nameEn: 'Holy Thursday',
      kind: 'solenidade',
      summary: 'Ceia do Senhor: instituição da Eucaristia e do sacerdócio, lava-pés.',
      summaryEn: 'The Lord\'s Supper: institution of the Eucharist and the priesthood, the washing of feet.',
    },
    [md(addDays(easter, -2))]: {
      name: 'Sexta-feira Santa',
      nameEn: 'Good Friday',
      kind: 'solenidade',
      summary: 'Paixão e morte do Senhor. Dia de jejum e abstinência.',
      summaryEn: 'The Passion and death of the Lord. A day of fasting and abstinence.',
    },
    [md(easter)]: {
      name: 'Páscoa da Ressurreição',
      nameEn: 'Easter Sunday',
      kind: 'solenidade',
      summary: 'Solenidade das solenidades. Cristo ressuscitou. Centro do ano litúrgico.',
      summaryEn: 'The solemnity of solemnities. Christ is risen. The center of the liturgical year.',
    },
    [md(addDays(easter, 39))]: {
      name: 'Ascensão do Senhor',
      nameEn: 'Ascension of the Lord',
      kind: 'solenidade',
      summary: 'Jesus sobe ao céu quarenta dias após a Ressurreição (em muitos lugares transferida ao domingo seguinte).',
      summaryEn: 'Jesus ascends to heaven forty days after the Resurrection (often transferred to the following Sunday).',
    },
    [md(addDays(easter, 49))]: {
      name: 'Pentecostes',
      nameEn: 'Pentecost',
      kind: 'solenidade',
      summary: 'Descida do Espírito Santo sobre os Apóstolos e Maria. Nascimento público da Igreja.',
      summaryEn: 'The descent of the Holy Spirit on the Apostles and Mary. The public birth of the Church.',
    },
    [md(addDays(easter, 56))]: {
      name: 'Santíssima Trindade',
      nameEn: 'The Most Holy Trinity',
      kind: 'solenidade',
      summary: 'Solenidade do mistério central da fé: um só Deus em três Pessoas (Pai, Filho e Espírito Santo).',
      summaryEn: 'Solemnity of the central mystery of the faith: one God in three Persons (Father, Son and Holy Spirit).',
    },
    [md(addDays(easter, 60))]: {
      name: 'Santíssimo Corpo e Sangue de Cristo',
      nameEn: 'The Most Holy Body and Blood of Christ',
      kind: 'solenidade',
      summary: 'Corpus Christi. No Brasil, na quinta-feira após a Santíssima Trindade. Procissão eucarística e adoração.',
      summaryEn: 'Corpus Christi. In Brazil, on the Thursday after Trinity Sunday. Eucharistic procession and adoration.',
    },
    [md(addDays(easter, 68))]: {
      name: 'Sagrado Coração de Jesus',
      nameEn: 'The Sacred Heart of Jesus',
      kind: 'solenidade',
      summary: 'Sexta-feira após o segundo domingo depois de Pentecostes. Devoção promovida por Santa Margarida Maria Alacoque. Amor misericordioso de Cristo.',
      summaryEn: 'The Friday after the second Sunday after Pentecost. Devotion promoted by St. Margaret Mary Alacoque. The merciful love of Christ.',
    },
    [md(addDays(easter, 69))]: {
      name: 'Imaculado Coração de Maria',
      nameEn: 'The Immaculate Heart of Mary',
      kind: 'memoria',
      summary: 'Sábado seguinte ao Sagrado Coração de Jesus. Coração de Maria, modelo de docilidade ao Espírito.',
      summaryEn: 'The Saturday after the Sacred Heart of Jesus. Mary\'s heart, a model of docility to the Spirit.',
    },
  };
}

// Cache do cálculo por ano (evita recomputar a cada tap).
let _cachedYear = null;
let _cachedMovable = {};

export function getSaintToday(date = new Date()) {
  const year = date.getFullYear();
  if (year !== _cachedYear) {
    _cachedYear = year;
    _cachedMovable = movableFeastsFor(year);
  }
  const key = md(date);
  // Festas móveis têm prioridade (solenidades > memórias do calendário fixo).
  return _cachedMovable[key] || saints[key] || null;
}
