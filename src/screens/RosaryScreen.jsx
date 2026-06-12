import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Ellipse, Circle, Line, Text as SvgText, G, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import { verseEndFromRef } from '../utils/verseRange';

// Mistérios com referência bíblica (bookId, chapter, verse) pra deep-link.
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

const ORACOES = {
  paiNosso: {
    pt: 'Pai nosso, que estais nos céus, santificado seja o vosso nome; venha a nós o vosso Reino; seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
    en: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  },
  aveMaria: {
    pt: 'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois Vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora da nossa morte. Amém.',
    en: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  },
  gloriaPatri: {
    pt: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.',
    en: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be. Amen.',
  },
  jaculatoriaFatima: {
    pt: 'Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o céu, principalmente as que mais precisarem da Vossa Misericórdia.',
    en: 'O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to Heaven, especially those most in need of Thy mercy.',
  },
  salveRainha: {
    pt: 'Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A Vós bradamos os degredados filhos de Eva. A Vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses Vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do Vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria! Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.',
    en: 'Hail Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.',
  },
};

// ===== Sequência da reza =====
// Posições possíveis:
//   'cross'             — crucifixo
//   'tail-pater-low'    — Pai-Nosso do rabo (próximo à cruz)
//   'tail-ave-1/2/3'    — 3 Aves do rabo (1 = mais perto do medalhão, 3 = mais perto da cruz)
//   'tail-pater-high'   — Pai-Nosso do rabo (próximo ao medalhão)
//   'medal'             — medalhão (5º Pai-Nosso funcional)
//   <slot 1..54>        — uma conta do loop (Ave ou Pater)
//
// Os 4 Pai-Nossos do loop ficam nos slots 11, 22, 33, 44 (espelhados nos 4 cantos).
// As 50 Aves preenchem os demais slots.

function buildSequence(isEn) {
  const t = (pt, en) => (isEn ? en : pt);
  const seq = [];
  seq.push({ pos: 'cross', label: t('Sinal da Cruz', 'Sign of the Cross'), dec: null });
  seq.push({ pos: 'cross', label: t('Credo Apostólico', 'Apostles\' Creed'), dec: null });
  seq.push({ pos: 'tail-pater-low', label: t('Pai-Nosso (introdução)', 'Our Father (intro)'), dec: null });
  // Aves de baixo pra cima
  seq.push({ pos: 'tail-ave-3', label: t('1ª Ave-Maria (introdução)', '1st Hail Mary (intro)'), dec: null });
  seq.push({ pos: 'tail-ave-2', label: t('2ª Ave-Maria (introdução)', '2nd Hail Mary (intro)'), dec: null });
  seq.push({ pos: 'tail-ave-1', label: t('3ª Ave-Maria (introdução)', '3rd Hail Mary (intro)'), dec: null });
  seq.push({ pos: 'tail-pater-high', label: t('Glória ao Pai (introdução)', 'Glory Be (intro)'), dec: null });
  seq.push({ pos: 'medal', label: t('Anúncio do 1º Mistério + Pai-Nosso (1ª dezena)', 'Announce 1st Mystery + Our Father (1st decade)'), dec: 1 });

  // Decade 1: Aves nos slots 1-10
  for (let a = 1; a <= 10; a++) {
    seq.push({ pos: a, label: t(`Ave-Maria ${a} (1ª dezena)`, `Hail Mary ${a} (1st decade)`), dec: 1 });
  }
  seq.push({ pos: 11, label: t('Glória + Anúncio do 2º Mistério + Pai-Nosso (2ª dezena)', 'Glory Be + Announce 2nd Mystery + Our Father (2nd decade)'), dec: 2 });
  for (let a = 1; a <= 10; a++) {
    seq.push({ pos: 11 + a, label: t(`Ave-Maria ${a} (2ª dezena)`, `Hail Mary ${a} (2nd decade)`), dec: 2 });
  }
  seq.push({ pos: 22, label: t('Glória + Anúncio do 3º Mistério + Pai-Nosso (3ª dezena)', 'Glory Be + Announce 3rd Mystery + Our Father (3rd decade)'), dec: 3 });
  for (let a = 1; a <= 10; a++) {
    seq.push({ pos: 22 + a, label: t(`Ave-Maria ${a} (3ª dezena)`, `Hail Mary ${a} (3rd decade)`), dec: 3 });
  }
  seq.push({ pos: 33, label: t('Glória + Anúncio do 4º Mistério + Pai-Nosso (4ª dezena)', 'Glory Be + Announce 4th Mystery + Our Father (4th decade)'), dec: 4 });
  for (let a = 1; a <= 10; a++) {
    seq.push({ pos: 33 + a, label: t(`Ave-Maria ${a} (4ª dezena)`, `Hail Mary ${a} (4th decade)`), dec: 4 });
  }
  seq.push({ pos: 44, label: t('Glória + Anúncio do 5º Mistério + Pai-Nosso (5ª dezena)', 'Glory Be + Announce 5th Mystery + Our Father (5th decade)'), dec: 5 });
  for (let a = 1; a <= 10; a++) {
    seq.push({ pos: 44 + a, label: t(`Ave-Maria ${a} (5ª dezena)`, `Hail Mary ${a} (5th decade)`), dec: 5 });
  }
  seq.push({ pos: 'medal', label: t('Glória da 5ª dezena', 'Glory Be (5th decade)'), dec: 5 });
  seq.push({ pos: 'medal', label: t('Salve Rainha', 'Hail Holy Queen'), dec: null });
  seq.push({ pos: 'cross', label: t('Sinal da Cruz (fim)', 'Sign of the Cross (end)'), dec: null });
  return seq;
}

function detectTodayMysterio() {
  const d = new Date().getDay();
  if (d === 1 || d === 6) return 'gozosos';
  if (d === 4) return 'luminosos';
  if (d === 2 || d === 5) return 'dolorosos';
  return 'gloriosos';
}

export default function RosaryScreen() {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const navigation = useNavigation();
  const [tipo, setTipo] = useState(detectTodayMysterio());
  const [showOracoes, setShowOracoes] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const sequence = useMemo(() => buildSequence(isEn), [isEn]);
  const mystery = MYSTERIES[tipo];
  const styles = makeStyles(colors, fs);
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  const openInBible = (nav, ref) => {
    if (!nav) return;
    navigation.navigate('Bíblia', { bookId: nav.bookId, chapter: nav.chapter, highlightVerse: nav.verse, highlightVerseEnd: verseEndFromRef(ref) });
  };

  const advanceStep = () => {
    if (stepIndex + 1 >= sequence.length) return;
    setStepIndex(stepIndex + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const resetSteps = () => {
    setStepIndex(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const currentStep = sequence[stepIndex];
  const currentDec = currentStep?.dec;
  const currentMystery = currentDec ? mystery.items[currentDec - 1] : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{isEn ? 'Holy Rosary' : 'Santo Rosário'}</Text>
          <Text style={styles.sub}>
            {isEn
              ? 'Meditation on the mysteries of Christ\'s and Mary\'s lives. Use the "Next bead" button to advance. Your phone vibrates lightly at each step so you can pray with eyes closed.'
              : 'Meditação dos mistérios da vida de Cristo e de Maria. Use o botão "Próxima conta" para avançar. O celular vibra levemente a cada passo para você rezar de olhos fechados.'}
          </Text>
        </View>

        <View style={styles.chipsRow}>
          {Object.entries(MYSTERIES).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, tipo === key && styles.chipActive]}
              onPress={() => setTipo(key)}
            >
              <Text style={[styles.chipText, tipo === key && styles.chipTextActive]}>
                {(isEn ? val.labelEn : val.label).replace(/^Mistérios |Mysteries$/g, '').trim() || (isEn ? val.labelEn : val.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.daysLabel}>
          {isEn ? mystery.labelEn : mystery.label} · {isEn ? mystery.daysEn : mystery.days}
        </Text>

        {mystery.items.map((m, i) => (
          <View key={i} style={[styles.card, currentDec === i + 1 && styles.cardActive]}>
            <View style={styles.cardHead}>
              <View style={[styles.numBubble, currentDec === i + 1 && styles.numBubbleActive]}>
                <Text style={styles.numText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{isEn ? m.nameEn : m.name}</Text>
                <TouchableOpacity onPress={() => openInBible(m.nav, m.ref)} hitSlop={10}>
                  <Text style={styles.cardRef}>
                    <Ionicons name="bookmark-outline" size={12} color={colors.accent} />{' '}
                    {isEn ? m.refEn : m.ref}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.cardFruit}>
                  {isEn ? `Fruit: ${m.fruitEn}` : `Fruto: ${m.fruit}`}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* === Rosário Visual === */}
        <View style={styles.virtualBox}>
          <RosaryVisual sequence={sequence} stepIndex={stepIndex} colors={colors} />

          <View style={styles.currentStep}>
            <Text style={styles.currentStepLabel}>
              {isEn ? 'Step' : 'Passo'} {stepIndex + 1} / {sequence.length}
            </Text>
            <Text style={styles.currentStepText}>{currentStep?.label}</Text>
            {currentMystery && (
              <TouchableOpacity onPress={() => openInBible(currentMystery.nav, currentMystery.ref)} hitSlop={10} style={{ marginTop: 8 }}>
                <Text style={styles.currentMystery}>
                  {isEn ? `→ ${currentMystery.nameEn} (${currentMystery.refEn})` : `→ ${currentMystery.name} (${currentMystery.ref})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.virtualBtns}>
            <TouchableOpacity
              style={[styles.advanceBtn, stepIndex >= sequence.length - 1 && styles.advanceBtnDisabled]}
              onPress={advanceStep}
              disabled={stepIndex >= sequence.length - 1}
            >
              <Ionicons name="chevron-forward" size={16} color="#fff" />
              <Text style={styles.advanceText}>{isEn ? 'Next bead' : 'Próxima conta'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetSteps}>
              <Ionicons name="refresh" size={14} color={colors.accent} />
              <Text style={styles.resetText}>{isEn ? 'Restart' : 'Reiniciar'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowOracoes(!showOracoes)}>
          <Ionicons name={showOracoes ? 'chevron-up' : 'book-outline'} size={18} color={colors.accent} />
          <Text style={styles.toggleText}>
            {showOracoes
              ? (isEn ? 'Hide prayers' : 'Ocultar orações')
              : (isEn ? 'Show Rosary prayers' : 'Mostrar orações do Rosário')}
          </Text>
        </TouchableOpacity>

        {showOracoes && (
          <View style={styles.oracoes}>
            <Prayer title={isEn ? 'Our Father' : 'Pai-Nosso'} text={isEn ? ORACOES.paiNosso.en : ORACOES.paiNosso.pt} styles={styles} />
            <Prayer title={isEn ? 'Hail Mary' : 'Ave-Maria'} text={isEn ? ORACOES.aveMaria.en : ORACOES.aveMaria.pt} styles={styles} />
            <Prayer title={isEn ? 'Glory Be' : 'Glória'} text={isEn ? ORACOES.gloriaPatri.en : ORACOES.gloriaPatri.pt} styles={styles} />
            <Prayer
              title={isEn ? 'Fatima Prayer (after each Glory Be)' : 'Jaculatória de Fátima (após cada Glória)'}
              text={isEn ? ORACOES.jaculatoriaFatima.en : ORACOES.jaculatoriaFatima.pt}
              styles={styles}
            />
            <Prayer
              title={isEn ? 'Hail Holy Queen (at the end)' : 'Salve Rainha (ao final)'}
              text={isEn ? ORACOES.salveRainha.en : ORACOES.salveRainha.pt}
              styles={styles}
            />
          </View>
        )}
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

// ============== Rosário Visual (SVG) ==============
// 4 Pai-Nossos no loop (cantos 8h, 10h, 2h, 4h), medalhão como 5º Pater na base.
// Rabo abaixo do medalhão: Pater (alto) → 3 Aves → Pater (baixo) → Cruz.
// Contas NÃO são clicáveis. Apenas exibição.
function RosaryVisual({ sequence, stepIndex, colors }) {
  // Dimensiona em função da largura da tela pra ficar legível.
  const screenW = Dimensions.get('window').width;
  const W = Math.min(screenW - 60, 360);
  // Versão compacta: H em ~1.52 × W (era 2.05) pra caber tela + botões.
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

  const COL_AVE_FILL = '#f0e6cf';
  const COL_AVE_STROKE = '#b8a878';
  const COL_PATER_STROKE = '#a8861a';
  const COL_PAST = colors.primary;
  const COL_CURRENT = '#e09010';
  const COL_BORDER_CURRENT = '#7a4e0a';
  const COL_CHAIN = '#8a7a52';
  const COL_CROSS = '#c9a84c'; // mesma do logo do app

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

  // Rabo: 5 contas em coluna abaixo do medalhão. Ordem visual de cima pra baixo:
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

  // Cor da conta (futuro/atual/passado).
  // BUG fix: separar lógica de loop vs tail pra evitar null===null colocando tudo como "atual".
  const colorFor = (key, isPater, slotIdx = null) => {
    let isCurrent = false;
    let isPast = false;
    if (slotIdx != null) {
      // Conta do loop
      isCurrent = slotIdx === currentLoopSlot;
      isPast = visitedLoop.has(slotIdx) && !isCurrent;
    } else if (key != null) {
      // Conta do rabo
      isCurrent = key === currentTailKey;
      isPast = visitedTail.has(key) && !isCurrent;
    }
    if (isCurrent) return { fill: COL_CURRENT, stroke: COL_BORDER_CURRENT, strokeWidth: 2 };
    if (isPast) return { fill: COL_PAST, stroke: isPater ? COL_PATER_STROKE : 'transparent', strokeWidth: isPater ? 1.2 : 0 };
    if (isPater) return { fill: '#f4c842', stroke: COL_PATER_STROKE, strokeWidth: 1.4 };
    return { fill: COL_AVE_FILL, stroke: COL_AVE_STROKE, strokeWidth: 0.7 };
  };

  return (
    <View style={{ width: W, height: H, alignSelf: 'center', marginBottom: 6 }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="medalGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fde8a8" />
            <Stop offset="1" stopColor="#c8a040" />
          </LinearGradient>
        </Defs>

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
            fill={medalActive ? '#fff4d8' : 'url(#medalGrad)'}
            stroke={medalActive ? COL_BORDER_CURRENT : '#8a6818'}
            strokeWidth={medalActive ? 2.5 : 1.6}
          />
          {/* 5 pétalas brancas */}
          <Circle cx={medalPos.x + 0} cy={medalPos.y - medalR * 0.4} r={medalR * 0.2} fill="#fff" opacity={0.95} />
          <Circle cx={medalPos.x + medalR * 0.37} cy={medalPos.y - medalR * 0.13} r={medalR * 0.2} fill="#fff" opacity={0.95} />
          <Circle cx={medalPos.x + medalR * 0.23} cy={medalPos.y + medalR * 0.31} r={medalR * 0.2} fill="#fff" opacity={0.95} />
          <Circle cx={medalPos.x - medalR * 0.23} cy={medalPos.y + medalR * 0.31} r={medalR * 0.2} fill="#fff" opacity={0.95} />
          <Circle cx={medalPos.x - medalR * 0.37} cy={medalPos.y - medalR * 0.13} r={medalR * 0.2} fill="#fff" opacity={0.95} />
          {/* Miolo */}
          <Circle cx={medalPos.x} cy={medalPos.y} r={medalR * 0.14} fill={medalActive ? '#5a3a10' : '#7a5418'} />
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
          <Circle cx={cx} cy={crossY + crossSize * 0.08} r={crossSize * 0.5} fill="#fff4d8" stroke={COL_BORDER_CURRENT} strokeWidth={1.5} opacity={0.7} />
        )}

        {/* Cruz: ✝ com a mesma cor do logo do app */}
        <SvgText
          x={cx}
          y={crossY + crossSize * 0.35}
          fontSize={crossSize}
          fontFamily="serif"
          textAnchor="middle"
          fill={COL_CROSS}
        >
          ✝
        </SvgText>
      </Svg>
    </View>
  );
}

function Prayer({ title, text, styles }) {
  return (
    <View style={styles.prayerCard}>
      <Text style={styles.prayerTitle}>{title}</Text>
      <Text style={styles.prayerText}>{text}</Text>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    intro: { padding: 14, backgroundColor: c.card, borderRadius: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: c.accent },
    title: { fontSize: fs(18), color: c.primaryText, fontWeight: 'bold', marginBottom: 6 },
    sub: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(19) },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: c.divider, backgroundColor: c.card },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { fontSize: fs(12), color: c.textMuted },
    chipTextActive: { color: '#fff', fontWeight: 'bold' },
    daysLabel: { fontSize: fs(12), color: c.accent, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    card: { backgroundColor: c.card, borderRadius: 12, padding: 12, marginBottom: 8 },
    cardActive: { borderWidth: 2, borderColor: c.accent },
    cardHead: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    numBubble: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center' },
    numBubbleActive: { backgroundColor: c.accent },
    numText: { color: '#fff', fontWeight: 'bold', fontSize: fs(14) },
    cardTitle: { fontSize: fs(14), color: c.primaryText, fontWeight: '600', marginBottom: 2 },
    cardRef: { fontSize: fs(11), color: c.accent, fontWeight: 'bold', textDecorationLine: 'underline' },
    cardFruit: { fontSize: fs(11), color: c.textSubtle, fontStyle: 'italic', marginTop: 2 },
    toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, padding: 12, borderWidth: 1, borderColor: c.accent, borderRadius: 10, justifyContent: 'center' },
    toggleText: { color: c.accent, fontWeight: '600', fontSize: fs(13) },
    oracoes: { marginTop: 14, gap: 10 },
    prayerCard: { backgroundColor: c.card, padding: 14, borderRadius: 12 },
    prayerTitle: { fontSize: fs(13), fontWeight: 'bold', color: c.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    prayerText: { fontSize: fs(13), color: c.text, lineHeight: fs(20) },

    virtualBox: { backgroundColor: c.card, borderRadius: 12, padding: 10, marginTop: 14, borderWidth: 1, borderColor: c.divider },
    currentStep: { backgroundColor: c.badgeBg, padding: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
    currentStepLabel: { fontSize: fs(10), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.8 },
    currentStepText: { fontSize: fs(15), color: c.primaryText, fontWeight: '600', marginTop: 4, textAlign: 'center' },
    currentMystery: { fontSize: fs(12), color: c.accent, fontWeight: '600', textDecorationLine: 'underline', textAlign: 'center' },
    virtualBtns: { flexDirection: 'row', gap: 8 },
    advanceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: c.primary, paddingVertical: 10, borderRadius: 8 },
    advanceBtnDisabled: { opacity: 0.5 },
    advanceText: { color: '#fff', fontWeight: '600', fontSize: fs(13) },
    resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: c.accent },
    resetText: { color: c.accent, fontSize: fs(12), fontWeight: '600' },
  });
