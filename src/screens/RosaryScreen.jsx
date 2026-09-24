import { useMemo, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import Svg, { Ellipse, Circle, Line, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { verseEndFromRef } from '../utils/verseRange';
import { openBible } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { haptics } from '../utils/haptics';
import { Button, Chip, Group, Row } from '../components/ui';

// Santo Rosário: mistérios do dia (chips), as cinco dezenas em linhas com
// deep link para a Bíblia, o passo atual com a oração escrita, os botões de
// avançar e reiniciar (com vibração leve, pelo helper de haptics) e o desenho
// das contas em SVG, que mantém a geometria original com as cores da paleta.

// Mistérios com referência bíblica (bookId, chapter, verse) para o deep link.
const MYSTERIES = {
  gozosos: {
    label: 'Mistérios Gozosos', labelEn: 'Joyful Mysteries',
    days: 'Segundas e sábados', daysEn: 'Mondays and Saturdays',
    items: [
      { name: 'Anunciação do Anjo a Maria', nameEn: 'The Annunciation', ref: 'Lucas 1,26-38', refEn: 'Luke 1:26-38', nav: { bookId: 'lc', chapter: 1, verse: 26 }, fruit: 'humildade', fruitEn: 'humility' },
      { name: 'Visitação de Maria a Isabel', nameEn: 'The Visitation', ref: 'Lucas 1,39-56', refEn: 'Luke 1:39-56', nav: { bookId: 'lc', chapter: 1, verse: 39 }, fruit: 'caridade fraterna', fruitEn: 'fraternal charity' },
      { name: 'Nascimento de Jesus em Belém', nameEn: 'The Nativity', ref: 'Lucas 2,1-20', refEn: 'Luke 2:1-20', nav: { bookId: 'lc', chapter: 2, verse: 1 }, fruit: 'pobreza de espírito', fruitEn: 'poverty of spirit' },
      { name: 'Apresentação de Jesus no Templo', nameEn: 'The Presentation', ref: 'Lucas 2,22-38', refEn: 'Luke 2:22-38', nav: { bookId: 'lc', chapter: 2, verse: 22 }, fruit: 'pureza e obediência', fruitEn: 'purity and obedience' },
      { name: 'Encontro de Jesus no Templo', nameEn: 'The Finding in the Temple', ref: 'Lucas 2,41-52', refEn: 'Luke 2:41-52', nav: { bookId: 'lc', chapter: 2, verse: 41 }, fruit: 'busca constante de Jesus', fruitEn: 'constant seeking of Jesus' },
    ],
  },
  luminosos: {
    label: 'Mistérios Luminosos', labelEn: 'Luminous Mysteries',
    days: 'Quintas', daysEn: 'Thursdays',
    items: [
      { name: 'Batismo de Jesus no Jordão', nameEn: 'The Baptism of Jesus', ref: 'Mateus 3,13-17', refEn: 'Matthew 3:13-17', nav: { bookId: 'mt', chapter: 3, verse: 13 }, fruit: 'abertura ao Espírito Santo', fruitEn: 'openness to the Holy Spirit' },
      { name: 'Bodas de Caná', nameEn: 'The Wedding at Cana', ref: 'João 2,1-12', refEn: 'John 2:1-12', nav: { bookId: 'jo', chapter: 2, verse: 1 }, fruit: 'fé em Cristo por meio de Maria', fruitEn: 'faith in Christ through Mary' },
      { name: 'Anúncio do Reino e conversão', nameEn: 'The Proclamation of the Kingdom', ref: 'Marcos 1,15', refEn: 'Mark 1:15', nav: { bookId: 'mc', chapter: 1, verse: 15 }, fruit: 'conversão constante', fruitEn: 'continual conversion' },
      { name: 'Transfiguração no Tabor', nameEn: 'The Transfiguration', ref: 'Lucas 9,28-36', refEn: 'Luke 9:28-36', nav: { bookId: 'lc', chapter: 9, verse: 28 }, fruit: 'desejo de santidade', fruitEn: 'desire for holiness' },
      { name: 'Instituição da Eucaristia', nameEn: 'The Institution of the Eucharist', ref: 'Mateus 26,26-29', refEn: 'Matthew 26:26-29', nav: { bookId: 'mt', chapter: 26, verse: 26 }, fruit: 'devoção eucarística', fruitEn: 'Eucharistic devotion' },
    ],
  },
  dolorosos: {
    label: 'Mistérios Dolorosos', labelEn: 'Sorrowful Mysteries',
    days: 'Terças e sextas', daysEn: 'Tuesdays and Fridays',
    items: [
      { name: 'Agonia no Getsêmani', nameEn: 'The Agony in the Garden', ref: 'Lucas 22,39-46', refEn: 'Luke 22:39-46', nav: { bookId: 'lc', chapter: 22, verse: 39 }, fruit: 'arrependimento dos pecados', fruitEn: 'sorrow for sins' },
      { name: 'Flagelação de Jesus', nameEn: 'The Scourging at the Pillar', ref: 'João 19,1', refEn: 'John 19:1', nav: { bookId: 'jo', chapter: 19, verse: 1 }, fruit: 'mortificação dos sentidos', fruitEn: 'mortification of the senses' },
      { name: 'Coroação de espinhos', nameEn: 'The Crowning with Thorns', ref: 'Mateus 27,27-31', refEn: 'Matthew 27:27-31', nav: { bookId: 'mt', chapter: 27, verse: 27 }, fruit: 'desapego das honras mundanas', fruitEn: 'detachment from worldly honors' },
      { name: 'Jesus carrega a cruz', nameEn: 'The Carrying of the Cross', ref: 'Lucas 23,26-32', refEn: 'Luke 23:26-32', nav: { bookId: 'lc', chapter: 23, verse: 26 }, fruit: 'paciência nas provações', fruitEn: 'patience in trials' },
      { name: 'Crucificação e morte de Jesus', nameEn: 'The Crucifixion', ref: 'João 19,16-37', refEn: 'John 19:16-37', nav: { bookId: 'jo', chapter: 19, verse: 16 }, fruit: 'amor pelas almas', fruitEn: 'love for souls' },
    ],
  },
  gloriosos: {
    label: 'Mistérios Gloriosos', labelEn: 'Glorious Mysteries',
    days: 'Quartas e domingos', daysEn: 'Wednesdays and Sundays',
    items: [
      { name: 'Ressurreição de Jesus', nameEn: 'The Resurrection', ref: 'Mateus 28,1-10', refEn: 'Matthew 28:1-10', nav: { bookId: 'mt', chapter: 28, verse: 1 }, fruit: 'fé na ressurreição', fruitEn: 'faith in the Resurrection' },
      { name: 'Ascensão de Jesus ao Céu', nameEn: 'The Ascension', ref: 'Atos 1,9-11', refEn: 'Acts 1:9-11', nav: { bookId: 'at', chapter: 1, verse: 9 }, fruit: 'esperança no Céu', fruitEn: 'hope of heaven' },
      { name: 'Vinda do Espírito Santo', nameEn: 'The Descent of the Holy Spirit', ref: 'Atos 2,1-13', refEn: 'Acts 2:1-13', nav: { bookId: 'at', chapter: 2, verse: 1 }, fruit: 'dons do Espírito', fruitEn: 'gifts of the Spirit' },
      { name: 'Assunção de Maria', nameEn: 'The Assumption of Mary', ref: 'Apocalipse 12,1', refEn: 'Revelation 12:1', nav: { bookId: 'ap', chapter: 12, verse: 1 }, fruit: 'devoção a Maria', fruitEn: 'devotion to Mary' },
      { name: 'Coroação de Maria como Rainha', nameEn: 'The Coronation of Mary', ref: 'Lucas 1,46-55', refEn: 'Luke 1:46-55', nav: { bookId: 'lc', chapter: 1, verse: 46 }, fruit: 'perseverança final', fruitEn: 'final perseverance' },
    ],
  },
};

// Orações, no formato campo/campoEn que o `pick` lê.
const PRAYERS = {
  sinalDaCruz: {
    title: 'Sinal da Cruz', titleEn: 'Sign of the Cross',
    text: 'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.',
    textEn: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  },
  credo: {
    title: 'Credo Apostólico', titleEn: 'Apostles\' Creed',
    text: 'Creio em Deus Pai todo-poderoso, criador do céu e da terra; e em Jesus Cristo, seu único Filho, nosso Senhor, que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus; está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo, na santa Igreja católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.',
    textEn: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  },
  paiNosso: {
    title: 'Pai-Nosso', titleEn: 'Our Father',
    text: 'Pai nosso, que estais nos céus, santificado seja o vosso nome; venha a nós o vosso Reino; seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
    textEn: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  },
  aveMaria: {
    title: 'Ave-Maria', titleEn: 'Hail Mary',
    text: 'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois Vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora da nossa morte. Amém.',
    textEn: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  },
  gloriaPatri: {
    title: 'Glória', titleEn: 'Glory Be',
    text: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.',
    textEn: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be. Amen.',
  },
  jaculatoriaFatima: {
    title: 'Jaculatória de Fátima (após cada Glória)', titleEn: 'Fatima Prayer (after each Glory Be)',
    text: 'Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o céu, principalmente as que mais precisarem da Vossa Misericórdia.',
    textEn: 'O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to Heaven, especially those most in need of Thy mercy.',
  },
  salveRainha: {
    title: 'Salve Rainha (ao final)', titleEn: 'Hail Holy Queen (at the end)',
    text: 'Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A Vós bradamos os degredados filhos de Eva. A Vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses Vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do Vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria! Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.',
    textEn: 'Hail Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.',
  },
};

// Ordem em que as orações aparecem na lista completa.
const PRAYER_ORDER = ['paiNosso', 'aveMaria', 'gloriaPatri', 'jaculatoriaFatima', 'salveRainha'];

// ===== Sequência da reza =====
// Posições possíveis:
//   'cross'             crucifixo
//   'tail-pater-low'    Pai-Nosso do rabo (próximo à cruz)
//   'tail-ave-1/2/3'    3 Aves do rabo (1 = mais perto do medalhão, 3 = mais perto da cruz)
//   'tail-pater-high'   Pai-Nosso do rabo (próximo ao medalhão)
//   'medal'             medalhão (5º Pai-Nosso funcional)
//   <slot 1..54>        uma conta do loop (Ave ou Pater)
//
// Os 4 Pai-Nossos do loop ficam nos slots 11, 22, 33, 44 (espelhados nos 4 cantos).
// As 50 Aves preenchem os demais slots. `prayers` são as chaves de PRAYERS que
// o passo reza, mostradas por escrito no card do passo atual.

function buildSequence(isEn) {
  const t = (pt, en) => (isEn ? en : pt);
  const seq = [];
  seq.push({ pos: 'cross', label: t('Sinal da Cruz', 'Sign of the Cross'), dec: null, prayers: ['sinalDaCruz'] });
  seq.push({ pos: 'cross', label: t('Credo Apostólico', 'Apostles\' Creed'), dec: null, prayers: ['credo'] });
  seq.push({ pos: 'tail-pater-low', label: t('Pai-Nosso (introdução)', 'Our Father (intro)'), dec: null, prayers: ['paiNosso'] });
  // Aves de baixo para cima
  seq.push({ pos: 'tail-ave-3', label: t('1ª Ave-Maria (introdução)', '1st Hail Mary (intro)'), dec: null, prayers: ['aveMaria'] });
  seq.push({ pos: 'tail-ave-2', label: t('2ª Ave-Maria (introdução)', '2nd Hail Mary (intro)'), dec: null, prayers: ['aveMaria'] });
  seq.push({ pos: 'tail-ave-1', label: t('3ª Ave-Maria (introdução)', '3rd Hail Mary (intro)'), dec: null, prayers: ['aveMaria'] });
  seq.push({ pos: 'tail-pater-high', label: t('Glória ao Pai (introdução)', 'Glory Be (intro)'), dec: null, prayers: ['gloriaPatri'] });
  seq.push({ pos: 'medal', label: t('Anúncio do 1º Mistério + Pai-Nosso (1ª dezena)', 'Announce 1st Mystery + Our Father (1st decade)'), dec: 1, prayers: ['paiNosso'] });

  const ordinal = (n) => t(`${n}ª`, ['1st', '2nd', '3rd', '4th', '5th'][n - 1]);
  const decadeChange = ['gloriaPatri', 'jaculatoriaFatima', 'paiNosso'];
  for (let dec = 1; dec <= 5; dec++) {
    const base = (dec - 1) * 11;
    if (dec > 1) {
      seq.push({
        pos: base,
        label: t(`Glória + Anúncio do ${dec}º Mistério + Pai-Nosso (${ordinal(dec)} dezena)`, `Glory Be + Announce ${ordinal(dec)} Mystery + Our Father (${ordinal(dec)} decade)`),
        dec,
        prayers: decadeChange,
      });
    }
    for (let a = 1; a <= 10; a++) {
      seq.push({ pos: base + a, label: t(`Ave-Maria ${a} (${ordinal(dec)} dezena)`, `Hail Mary ${a} (${ordinal(dec)} decade)`), dec, prayers: ['aveMaria'] });
    }
  }
  seq.push({ pos: 'medal', label: t('Glória da 5ª dezena', 'Glory Be (5th decade)'), dec: 5, prayers: ['gloriaPatri', 'jaculatoriaFatima'] });
  seq.push({ pos: 'medal', label: t('Salve Rainha', 'Hail Holy Queen'), dec: null, prayers: ['salveRainha'] });
  seq.push({ pos: 'cross', label: t('Sinal da Cruz (fim)', 'Sign of the Cross (end)'), dec: null, prayers: ['sinalDaCruz'] });
  return seq;
}

function detectTodayMystery() {
  const d = new Date().getDay();
  if (d === 1 || d === 6) return 'gozosos';
  if (d === 4) return 'luminosos';
  if (d === 2 || d === 5) return 'dolorosos';
  return 'gloriosos';
}

export default function RosaryScreen() {
  const { colors, tokens, text } = useTheme();
  const { isEn } = useLanguage();
  const navigation = useNavigation();
  const { space, radius } = tokens;
  const [tipo, setTipo] = useState(detectTodayMystery());
  const [showPrayers, setShowPrayers] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const sequence = useMemo(() => buildSequence(isEn), [isEn]);
  const mystery = MYSTERIES[tipo];

  const openInBible = (m) => {
    if (!m?.nav) return;
    openBible(navigation, { ...m.nav, verseEnd: verseEndFromRef(pick(m, 'ref', isEn)) });
  };

  const isLast = stepIndex >= sequence.length - 1;

  const advanceStep = () => {
    if (isLast) return;
    setStepIndex(stepIndex + 1);
    haptics.impact('light');
  };

  const resetSteps = () => {
    setStepIndex(0);
    haptics.impact('medium');
  };

  const currentStep = sequence[stepIndex];
  const currentDec = currentStep?.dec;
  const currentMystery = currentDec ? mystery.items[currentDec - 1] : null;

  // "Gozosos", "Joyful": o chip fica só com o adjetivo.
  const chipLabel = (val) => {
    const full = pick(val, 'label', isEn);
    return full.replace(/^Mistérios |Mysteries$/g, '').trim() || full;
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xl }}>
      <Text style={[text('subhead'), { color: colors.textSubtle }]}>
        {isEn
          ? 'Meditation on the mysteries of Christ\'s and Mary\'s lives. Use "Next bead" to advance. Your phone vibrates lightly at each step so you can pray with eyes closed.'
          : 'Meditação dos mistérios da vida de Cristo e de Maria. Use "Próxima conta" para avançar. O celular vibra levemente a cada passo para você rezar de olhos fechados.'}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md }}>
        {Object.entries(MYSTERIES).map(([key, val]) => (
          <Chip key={key} label={chipLabel(val)} selected={tipo === key} onPress={() => setTipo(key)} haptic />
        ))}
      </View>

      <Group
        header={`${pick(mystery, 'label', isEn)} · ${pick(mystery, 'days', isEn)}`}
        style={{ marginTop: space.md }}
      >
        {mystery.items.map((m, i) => {
          const active = currentDec === i + 1;
          const name = pick(m, 'name', isEn);
          return (
            <Row
              key={i}
              trailing="chevron"
              accessibilityLabel={`${i + 1}. ${name}, ${pick(m, 'ref', isEn)}`}
              onPress={() => openInBible(m)}
            >
              <Text style={[text('headline'), { color: active ? colors.tint : colors.text }]}>
                {i + 1}. {name}
              </Text>
              <Text style={[text('footnote'), { color: colors.accentText }]}>{pick(m, 'ref', isEn)}</Text>
              <Text style={[text('footnote'), { color: colors.textSubtle }]}>
                {isEn ? 'Fruit: ' : 'Fruto: '}{pick(m, 'fruit', isEn)}
              </Text>
            </Row>
          );
        })}
      </Group>

      {/* Passo atual: contador, nome do passo e a oração por escrito. */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.md, gap: space.xs, marginTop: space.md }}>
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>
          {isEn ? `Step ${stepIndex + 1} of ${sequence.length}` : `Passo ${stepIndex + 1} de ${sequence.length}`}
        </Text>
        <Text role="heading" style={[text('headline'), { color: colors.text }]}>{currentStep?.label}</Text>
        {(currentStep?.prayers || []).map((key) => (
          <Text key={key} style={[text('reading'), { color: colors.text }]}>{pick(PRAYERS[key], 'text', isEn)}</Text>
        ))}
        {currentMystery ? (
          <Button
            variant="plain"
            full={false}
            icon="book-outline"
            label={`${pick(currentMystery, 'name', isEn)} (${pick(currentMystery, 'ref', isEn)})`}
            onPress={() => openInBible(currentMystery)}
            style={{ alignSelf: 'flex-start' }}
          />
        ) : null}
      </View>

      <View style={{ gap: space.xs, marginTop: space.md }}>
        <Button icon="chevron-forward" label={isEn ? 'Next bead' : 'Próxima conta'} onPress={advanceStep} disabled={isLast} />
        <Button variant="secondary" icon="refresh" label={isEn ? 'Restart' : 'Reiniciar'} onPress={resetSteps} />
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.sm, marginTop: space.md, alignItems: 'center' }}>
        <RosaryVisual sequence={sequence} stepIndex={stepIndex} />
      </View>

      <Button
        variant="plain"
        icon={showPrayers ? 'chevron-up' : 'book-outline'}
        label={showPrayers
          ? (isEn ? 'Hide prayers' : 'Ocultar orações')
          : (isEn ? 'Show Rosary prayers' : 'Mostrar orações do Rosário')}
        onPress={() => setShowPrayers(!showPrayers)}
        style={{ marginTop: space.md }}
      />

      {showPrayers ? (
        <Group>
          {PRAYER_ORDER.map((key) => (
            <View key={key} style={{ padding: space.md, gap: space.xs }}>
              <Text role="heading" style={[text('headline'), { color: colors.text }]}>{pick(PRAYERS[key], 'title', isEn)}</Text>
              <Text style={[text('reading'), { color: colors.text }]}>{pick(PRAYERS[key], 'text', isEn)}</Text>
            </View>
          ))}
        </Group>
      ) : null}
    </ScrollView>
  );
}

// ============== Rosário Visual (SVG) ==============
// 4 Pai-Nossos no loop (cantos 8h, 10h, 2h, 4h), medalhão como 5º Pater na base.
// Rabo abaixo do medalhão: Pater (alto), 3 Aves, Pater (baixo), Cruz.
// Contas não são clicáveis, só exibição. Toda a geometria (raios, proporções,
// espessuras) é desenho e fica em números; as cores vêm da paleta.
function RosaryVisual({ sequence, stepIndex }) {
  const { colors, tokens } = useTheme();
  const { width: screenW } = useWindowDimensions();
  // Largura: a tela menos o recuo do conteúdo e o do card, limitada a 360.
  const W = Math.min(screenW - tokens.space.md * 4, 360);
  // Versão compacta: H em ~1.52 × W para caber tela + botões.
  const H = Math.round(W * 1.52);
  const cx = W / 2;
  const cy = Math.round(W * 0.46);
  const rx = Math.round(W * 0.36);
  const ry = Math.round(W * 0.40);
  const slots = 55;
  const slotAngle = (2 * Math.PI) / slots;
  const medalR = Math.round(W * 0.048);
  const paterR = Math.round(W * 0.025);
  const aveR = Math.round(W * 0.013);

  const paterSet = new Set([11, 22, 33, 44]);

  // Paleta das contas: futura em bg com contorno discreto (Pater com anel
  // dourado), passada em tint, atual em accent com contorno do texto para
  // destacar nos dois temas. Corda em textTertiary, cruz na cor da marca.
  const COL_AVE_FILL = colors.bg;
  const COL_AVE_STROKE = colors.textTertiary;
  const COL_PATER_STROKE = colors.accentText;
  const COL_PAST = colors.tint;
  const COL_CURRENT = colors.accent;
  const COL_BORDER_CURRENT = colors.text;
  const COL_CHAIN = colors.textTertiary;
  const COL_CROSS = colors.accent;

  // Posições do loop
  const loopPositions = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 54; i++) {
      const angle = Math.PI / 2 + i * slotAngle;
      arr.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
    }
    return arr;
  }, [cx, cy, rx, ry, slotAngle]);

  // Posição do medalhão (logo abaixo da base do loop)
  const medalY = cy + ry + Math.round(W * 0.06);
  const medalPos = { x: cx, y: medalY };

  // Rabo: 5 contas em coluna abaixo do medalhão. Ordem visual de cima para baixo:
  // tail-pater-high, tail-ave-1, tail-ave-2, tail-ave-3, tail-pater-low.
  const tailGap = Math.round(W * 0.06);
  const tailStartY = medalY + medalR + tailGap;
  const tailOrder = ['tail-pater-high', 'tail-ave-1', 'tail-ave-2', 'tail-ave-3', 'tail-pater-low'];
  const tailPos = (key) => {
    const i = tailOrder.indexOf(key);
    return { x: cx, y: tailStartY + i * tailGap };
  };
  const crossY = tailPos('tail-pater-low').y + Math.round(W * 0.12);
  const crossSize = Math.round(W * 0.16);
  // Cruz latina desenhada com duas barras (mesma geometria do BrandMark), sem
  // depender do glifo de emoji que renderiza de forma inconsistente entre fontes.
  const crossVC = crossY + crossSize * 0.08;        // centro vertical, alinhado ao realce
  const crossThk = Math.max(2, crossSize * 0.16);   // espessura das barras
  const crossArm = crossSize * 0.31;                // meio-braço horizontal
  const crossTop = crossVC - crossSize * 0.5;
  const crossBar = crossTop + crossSize * 0.26;     // altura da barra (0.26 do topo)

  // Estado: quais posições foram visitadas (passado), qual é a atual
  const current = sequence[stepIndex];
  const visitedLoop = new Set();
  const visitedTail = new Set();
  for (let s = 0; s <= stepIndex; s++) {
    const p = sequence[s].pos;
    if (typeof p === 'number') visitedLoop.add(p);
    else if (typeof p === 'string' && p.startsWith('tail-')) visitedTail.add(p);
  }
  const currentLoopSlot = typeof current.pos === 'number' ? current.pos : null;
  const currentTailKey = (typeof current.pos === 'string' && current.pos.startsWith('tail-')) ? current.pos : null;
  const crossActive = current.pos === 'cross';
  const medalActive = current.pos === 'medal';

  // Cor da conta (futuro/atual/passado). Loop e rabo são decididos em separado
  // para null === null não marcar tudo como atual.
  const colorFor = (key, isPater, slotIdx = null) => {
    let isCurrent = false;
    let isPast = false;
    if (slotIdx != null) {
      isCurrent = slotIdx === currentLoopSlot;
      isPast = visitedLoop.has(slotIdx) && !isCurrent;
    } else if (key != null) {
      isCurrent = key === currentTailKey;
      isPast = visitedTail.has(key) && !isCurrent;
    }
    if (isCurrent) return { fill: COL_CURRENT, stroke: COL_BORDER_CURRENT, strokeWidth: 2 };
    if (isPast) return { fill: COL_PAST, stroke: COL_PAST, strokeWidth: isPater ? 1.2 : 0 };
    if (isPater) return { fill: COL_AVE_FILL, stroke: COL_PATER_STROKE, strokeWidth: 1.4 };
    return { fill: COL_AVE_FILL, stroke: COL_AVE_STROKE, strokeWidth: 0.7 };
  };

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Corda do loop */}
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={COL_CHAIN} strokeWidth={1.8} opacity={0.55} />
        {/* Corda da base do loop até o topo do medalhão */}
        <Line x1={cx} y1={cy + ry} x2={cx} y2={medalY - medalR} stroke={COL_CHAIN} strokeWidth={1.8} opacity={0.55} />
        {/* Corda do medalhão até a cruz */}
        <Line x1={cx} y1={medalY + medalR} x2={cx} y2={crossY - crossSize * 0.4} stroke={COL_CHAIN} strokeWidth={1.8} opacity={0.55} />

        {/* 54 contas do loop (slots 1..54). Slot 0 é o medalhão. */}
        {loopPositions.slice(1).map((p, idx) => {
          const slot = idx + 1;
          const isPater = paterSet.has(slot);
          const r = isPater ? paterR : aveR;
          const { fill, stroke, strokeWidth } = colorFor(null, isPater, slot);
          return <Circle key={`l-${slot}`} cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
        })}

        {/* Medalhão com Rosa Mística */}
        <G>
          <Circle
            cx={medalPos.x}
            cy={medalPos.y}
            r={medalR}
            fill={COL_CURRENT}
            stroke={medalActive ? COL_BORDER_CURRENT : COL_PATER_STROKE}
            strokeWidth={medalActive ? 2.5 : 1.6}
          />
          {/* 5 pétalas */}
          <Circle cx={medalPos.x + 0} cy={medalPos.y - medalR * 0.4} r={medalR * 0.2} fill={colors.elevated} opacity={0.95} />
          <Circle cx={medalPos.x + medalR * 0.37} cy={medalPos.y - medalR * 0.13} r={medalR * 0.2} fill={colors.elevated} opacity={0.95} />
          <Circle cx={medalPos.x + medalR * 0.23} cy={medalPos.y + medalR * 0.31} r={medalR * 0.2} fill={colors.elevated} opacity={0.95} />
          <Circle cx={medalPos.x - medalR * 0.23} cy={medalPos.y + medalR * 0.31} r={medalR * 0.2} fill={colors.elevated} opacity={0.95} />
          <Circle cx={medalPos.x - medalR * 0.37} cy={medalPos.y - medalR * 0.13} r={medalR * 0.2} fill={colors.elevated} opacity={0.95} />
          {/* Miolo */}
          <Circle cx={medalPos.x} cy={medalPos.y} r={medalR * 0.14} fill={colors.text} />
        </G>

        {/* Contas do rabo */}
        {tailOrder.map((key) => {
          const isPater = key === 'tail-pater-high' || key === 'tail-pater-low';
          const r = isPater ? paterR : aveR;
          const { fill, stroke, strokeWidth } = colorFor(key, isPater);
          const p = tailPos(key);
          return <Circle key={key} cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
        })}

        {/* Destaque atrás da cruz quando ativa */}
        {crossActive && (
          <Circle cx={cx} cy={crossY + crossSize * 0.08} r={crossSize * 0.5} fill={COL_CURRENT} stroke={COL_BORDER_CURRENT} strokeWidth={1.5} opacity={0.35} />
        )}

        {/* Cruz na cor da marca, desenhada com duas barras */}
        <Line
          x1={cx}
          y1={crossTop}
          x2={cx}
          y2={crossTop + crossSize}
          stroke={COL_CROSS}
          strokeWidth={crossThk}
          strokeLinecap="round"
        />
        <Line
          x1={cx - crossArm}
          y1={crossBar}
          x2={cx + crossArm}
          y2={crossBar}
          stroke={COL_CROSS}
          strokeWidth={crossThk}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
