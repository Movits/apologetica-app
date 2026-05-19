// Lista curada de versículos pra rotação diária no card "Versículo do dia".
// A escolha é determinística pelo dia do ano (mesmo verso pra todos no mesmo dia).
// Texto vem da Bíblia Ave Maria (mesma fonte do app). Formato compatível com
// o sistema de bibleNav: bookId/chapter/verse permitem abrir direto no app.

export const DAILY_VERSES = [
  { bookId: 'sl', chapter: 23, verse: 1, ref: 'Salmo 23,1', text: 'O Senhor é meu pastor: nada me faltará.' },
  { bookId: 'jo', chapter: 14, verse: 6, ref: 'João 14,6', text: 'Eu sou o caminho, a verdade e a vida. Ninguém vai ao Pai senão por mim.' },
  { bookId: 'jo', chapter: 3, verse: 16, ref: 'João 3,16', text: 'Deus amou de tal modo o mundo, que lhe deu seu Filho único, para que todo o que nele crer não pereça, mas tenha a vida eterna.' },
  { bookId: 'rm', chapter: 8, verse: 28, ref: 'Romanos 8,28', text: 'Sabemos que todas as coisas concorrem para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu desígnio.' },
  { bookId: 'fl', chapter: 4, verse: 13, ref: 'Filipenses 4,13', text: 'Tudo posso naquele que me fortalece.' },
  { bookId: 'mt', chapter: 11, verse: 28, ref: 'Mateus 11,28', text: 'Vinde a mim, todos vós que estais aflitos sob o fardo, e eu vos aliviarei.' },
  { bookId: 'mt', chapter: 6, verse: 33, ref: 'Mateus 6,33', text: 'Buscai em primeiro lugar o Reino de Deus e a sua justiça, e todas estas coisas vos serão dadas por acréscimo.' },
  { bookId: '1pd', chapter: 3, verse: 15, ref: '1 Pedro 3,15', text: 'Estai sempre prontos a dar razão da vossa esperança a todo aquele que pedir explicações de vós, mas com mansidão e respeito.' },
  { bookId: 'pr', chapter: 3, verse: 5, ref: 'Provérbios 3,5', text: 'Confia no Senhor de todo o teu coração, e não te apoies em tua própria sabedoria.' },
  { bookId: 'is', chapter: 41, verse: 10, ref: 'Isaías 41,10', text: 'Não temas, pois eu estou contigo; não dirijas teus olhares assustados a outro lado, porque eu sou teu Deus que te fortalece e te socorre.' },
  { bookId: 'jr', chapter: 29, verse: 11, ref: 'Jeremias 29,11', text: 'São pensamentos de paz que tenho a respeito de vós, e não de aflição. Eu vos darei um porvir digno de vossa esperança.' },
  { bookId: '1jo', chapter: 4, verse: 8, ref: '1 João 4,8', text: 'Aquele que não ama não conhece a Deus, porque Deus é amor.' },
  { bookId: 'mt', chapter: 22, verse: 37, ref: 'Mateus 22,37', text: 'Amarás o Senhor teu Deus, de todo o teu coração, de toda a tua alma e de todo o teu espírito.' },
  { bookId: 'mt', chapter: 22, verse: 39, ref: 'Mateus 22,39', text: 'Amarás o teu próximo como a ti mesmo.' },
  { bookId: 'jo', chapter: 13, verse: 34, ref: 'João 13,34', text: 'Eu vos dou um novo mandamento: amai-vos uns aos outros. Como eu vos amei, amai-vos também uns aos outros.' },
  { bookId: 'gl', chapter: 5, verse: 22, ref: 'Gálatas 5,22', text: 'Os frutos do Espírito, porém, são: caridade, alegria, paz, paciência, afabilidade, bondade, fidelidade, mansidão.' },
  { bookId: 'hb', chapter: 11, verse: 1, ref: 'Hebreus 11,1', text: 'A fé é uma firme convicção das coisas que se esperam e a certeza daquelas que não se vêem.' },
  { bookId: '2cor', chapter: 5, verse: 17, ref: '2 Coríntios 5,17', text: 'Todo aquele que está em Cristo é uma nova criatura. Passou o que era velho; eis que tudo se fez novo.' },
  { bookId: 'ef', chapter: 2, verse: 8, ref: 'Efésios 2,8', text: 'É pela graça que fostes salvos, mediante a fé. E isto não vem de vós: é dom de Deus.' },
  { bookId: 'mt', chapter: 7, verse: 7, ref: 'Mateus 7,7', text: 'Pedi e se vos dará; buscai e achareis; batei e abrir-se-vos-á.' },
  { bookId: 'lc', chapter: 6, verse: 38, ref: 'Lucas 6,38', text: 'Dai e vos será dado: deitar-vos-ão no regaço uma boa medida, calcada, sacudida e transbordante.' },
  { bookId: 'sl', chapter: 27, verse: 1, ref: 'Salmo 27,1', text: 'O Senhor é a minha luz e a minha salvação; a quem temerei?' },
  { bookId: 'jo', chapter: 11, verse: 25, ref: 'João 11,25', text: 'Eu sou a ressurreição e a vida. Aquele que crê em mim, ainda que esteja morto, viverá.' },
  { bookId: 'mt', chapter: 16, verse: 18, ref: 'Mateus 16,18', text: 'Tu és Pedro, e sobre esta pedra edificarei a minha Igreja, e as portas do inferno nada poderão contra ela.' },
  { bookId: 'jo', chapter: 6, verse: 53, ref: 'João 6,53', text: 'Em verdade, em verdade vos digo: se não comerdes a carne do Filho do Homem, e não beberdes o seu sangue, não tereis a vida em vós mesmos.' },
  { bookId: 'mt', chapter: 28, verse: 19, ref: 'Mateus 28,19', text: 'Ide, pois, e ensinai a todas as nações; batizai-as em nome do Pai, do Filho e do Espírito Santo.' },
  { bookId: '1jo', chapter: 4, verse: 18, ref: '1 João 4,18', text: 'No amor não há temor. Pelo contrário, o perfeito amor lança fora o temor.' },
  { bookId: 'mt', chapter: 5, verse: 3, ref: 'Mateus 5,3', text: 'Bem-aventurados os pobres em espírito, porque deles é o Reino dos céus.' },
  { bookId: 'mt', chapter: 5, verse: 8, ref: 'Mateus 5,8', text: 'Bem-aventurados os puros de coração, porque verão a Deus.' },
  { bookId: 'mt', chapter: 5, verse: 9, ref: 'Mateus 5,9', text: 'Bem-aventurados os pacíficos, porque serão chamados filhos de Deus.' },
  { bookId: 'sl', chapter: 119, verse: 105, ref: 'Salmo 119,105', text: 'Vossa palavra é um facho que ilumina meus passos, uma luz em meu caminho.' },
  { bookId: 'ecl', chapter: 3, verse: 1, ref: 'Eclesiastes 3,1', text: 'Para tudo há um tempo, para cada coisa há um momento debaixo dos céus.' },
  { bookId: 'lc', chapter: 1, verse: 38, ref: 'Lucas 1,38', text: 'Eis aqui a serva do Senhor; faça-se em mim segundo a tua palavra.' },
  { bookId: 'jo', chapter: 14, verse: 27, ref: 'João 14,27', text: 'Deixo-vos a paz, dou-vos a minha paz. Não vo-la dou como o mundo a dá.' },
  { bookId: '1pd', chapter: 5, verse: 7, ref: '1 Pedro 5,7', text: 'Lançai sobre ele toda a vossa inquietação, porque ele tem cuidado de vós.' },
  { bookId: 'jo', chapter: 8, verse: 32, ref: 'João 8,32', text: 'Conhecereis a verdade e a verdade vos libertará.' },
  { bookId: 'rm', chapter: 12, verse: 12, ref: 'Romanos 12,12', text: 'Sede alegres na esperança, pacientes na tribulação, perseverantes na oração.' },
  { bookId: 'sb', chapter: 3, verse: 1, ref: 'Sabedoria 3,1', text: 'As almas dos justos estão nas mãos de Deus, e não os tocará tormento algum.' },
  { bookId: 'tg', chapter: 1, verse: 2, ref: 'Tiago 1,2', text: 'Meus irmãos, considerai como sujeito de grande alegria as diversas provações por que passais.' },
  { bookId: 'cl', chapter: 3, verse: 12, ref: 'Colossenses 3,12', text: 'Como eleitos de Deus, seus santos e amados, revesti-vos de sentimentos de profunda compaixão, de bondade, humildade, mansidão e paciência.' },
  { bookId: 'lc', chapter: 1, verse: 46, ref: 'Lucas 1,46', text: 'Minha alma glorifica o Senhor, e meu espírito exulta de alegria em Deus, meu Salvador.' },
  { bookId: 'jo', chapter: 15, verse: 13, ref: 'João 15,13', text: 'Ninguém tem amor maior do que aquele que dá a sua vida pelos seus amigos.' },
  { bookId: 'at', chapter: 4, verse: 12, ref: 'Atos 4,12', text: 'Em nenhum outro há salvação, porque não há sob o céu outro nome dado aos homens, pelo qual devamos ser salvos.' },
  { bookId: 'hb', chapter: 13, verse: 8, ref: 'Hebreus 13,8', text: 'Jesus Cristo é o mesmo, ontem e hoje; ele o será eternamente.' },
  { bookId: '1cor', chapter: 13, verse: 4, ref: '1 Coríntios 13,4', text: 'O amor é paciente, o amor é bondoso. Não é invejoso, não é jactancioso, não se incha de orgulho.' },
  { bookId: '1cor', chapter: 13, verse: 13, ref: '1 Coríntios 13,13', text: 'Por ora subsistem a fé, a esperança e o amor — esses três. Porém, o maior deles é o amor.' },
  { bookId: 'rm', chapter: 1, verse: 16, ref: 'Romanos 1,16', text: 'Eu não me envergonho do Evangelho. Ele é uma força de Deus que opera a salvação de todo aquele que crê.' },
  { bookId: 'jo', chapter: 6, verse: 35, ref: 'João 6,35', text: 'Eu sou o pão da vida. Aquele que vem a mim não terá fome, e aquele que crê em mim jamais terá sede.' },
  { bookId: 'mt', chapter: 18, verse: 20, ref: 'Mateus 18,20', text: 'Onde dois ou três estão reunidos em meu nome, eu estou no meio deles.' },
  { bookId: 'sl', chapter: 46, verse: 1, ref: 'Salmo 46,1', text: 'Deus é nosso refúgio e nossa força, sempre pronto a nos socorrer nas dificuldades.' },
  { bookId: 'jo', chapter: 2, verse: 5, ref: 'João 2,5', text: 'Fazei tudo o que ele vos disser.' },
  { bookId: 'ap', chapter: 3, verse: 20, ref: 'Apocalipse 3,20', text: 'Eis que estou à porta e bato; se alguém ouvir a minha voz e me abrir a porta, entrarei em sua casa e cearei com ele, e ele comigo.' },
  { bookId: 'mt', chapter: 5, verse: 16, ref: 'Mateus 5,16', text: 'Assim, brilhe vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem vosso Pai que está nos céus.' },
  { bookId: 'sl', chapter: 51, verse: 12, ref: 'Salmo 51,12', text: 'Ó Deus, criai em mim um coração puro, e renovai em meu peito um espírito firme.' },
  { bookId: 'lc', chapter: 23, verse: 34, ref: 'Lucas 23,34', text: 'Pai, perdoa-lhes; eles não sabem o que fazem.' },
  { bookId: 'mt', chapter: 6, verse: 21, ref: 'Mateus 6,21', text: 'Onde está o teu tesouro, aí estará também o teu coração.' },
  { bookId: 'jo', chapter: 16, verse: 33, ref: 'João 16,33', text: 'Disse-vos estas coisas para que tenhais paz em mim. No mundo haveis de ter aflições. Coragem! Eu venci o mundo.' },
  { bookId: 'sl', chapter: 121, verse: 1, ref: 'Salmo 121,1', text: 'Para os montes elevo os meus olhos: de onde me virá o socorro? O socorro me vem do Senhor, que fez o céu e a terra.' },
  { bookId: 'mt', chapter: 7, verse: 12, ref: 'Mateus 7,12', text: 'Tudo o que quereis que os homens vos façam, fazei-o vós também a eles. Esta é a Lei e os Profetas.' },
  { bookId: 'rm', chapter: 12, verse: 21, ref: 'Romanos 12,21', text: 'Não te deixes vencer pelo mal, mas vence o mal com o bem.' },
];

// Escolhe o versículo do dia baseado no dia do ano + ano (mesma escolha pra todos no mesmo dia).
export function getVerseOfDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  // Mistura com o ano pra evitar mesmo verso em mesma data do ano seguinte
  const seed = (dayOfYear + date.getFullYear() * 7) % DAILY_VERSES.length;
  return DAILY_VERSES[seed];
}
