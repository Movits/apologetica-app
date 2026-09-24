import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { setOnboardingDone, setStartIntent } from '../utils/onboarding';
import { getDialoguesByCategory } from '../data/dialogues';
import AuthTopToggles from '../components/AuthTopToggles';
import BrandMark from '../components/BrandMark';
import { Button, Group, ProgressBar, Row } from '../components/ui';

// Onboarding v2: ativação em vez de tour passivo. Em até 60 s a pessoa escolhe
// um tema e cai direto num diálogo de resposta relevante (o "aha" de
// apologética: "eu já consigo responder isso"). Ver Conselho, Onda 3.
//
// Pele da Onda 7 (mock aprovado): fundo quieto do tema, um brilho dourado bem
// suave no topo, a cruz à esquerda e a tipografia falando sozinha. Os três
// passos e a lógica (setOnboardingDone, setStartIntent, onDone) são os mesmos.

// Temas = categorias reais dos diálogos (string exata usada em dialogues.js).
const THEMES = [
  { key: 'Existência de Deus', icon: 'planet-outline', pt: 'A existência de Deus', en: 'The existence of God', subPt: 'ateísmo, ciência e fé', subEn: 'atheism, science and faith' },
  { key: 'Igreja Católica', icon: 'home-outline', pt: 'A Igreja Católica', en: 'The Catholic Church', subPt: 'papa, Maria, sacramentos', subEn: 'pope, Mary, sacraments' },
  { key: 'Sagrada Escritura', icon: 'book-outline', pt: 'A Bíblia', en: 'The Bible', subPt: 'interpretação, contradições', subEn: 'interpretation, contradictions' },
  { key: 'Moral', icon: 'heart-outline', pt: 'Moral e vida', en: 'Morality and life', subPt: 'aborto, sexualidade, família', subEn: 'abortion, sexuality, family' },
  { key: 'Outras Religiões', icon: 'people-outline', pt: 'Outras religiões', en: 'Other religions', subPt: 'evangélicos, espiritismo', subEn: 'protestants, spiritism' },
  { key: 'História', icon: 'time-outline', pt: 'História da Igreja', en: 'Church history', subPt: 'Inquisição, Cruzadas', subEn: 'Inquisition, Crusades' },
];

const STEPS = [0, 1, 2];

// O brilho do topo é o dourado do tema com alfa (o mock usa um radial a 10%;
// aqui um linear vertical que morre em 34% da altura, a aproximação decidida).
// A cor vem de colors.accent, sem hex novo.
function withAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function pickDialogue(themeKey) {
  const list = getDialoguesByCategory(themeKey) || [];
  if (!list.length) return null;
  // rank menor = mais comum/buscado; começa pelo mais forte.
  const sorted = [...list].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  return sorted[0]?.id || null;
}

export default function OnboardingScreen({ onDone }) {
  const { colors, tokens, text, darkMode } = useTheme();
  const { isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { space, icon, motion } = tokens;

  const [step, setStep] = useState(0); // 0 intro, 1 tema, 2 pronto
  const [theme, setTheme] = useState(null);

  const skip = async () => {
    await setOnboardingDone();
    onDone?.();
  };

  const start = async () => {
    const dialogueId = theme ? pickDialogue(theme) : null;
    await setStartIntent(dialogueId);
    await setOnboardingDone();
    onDone?.();
  };

  const chosenTheme = THEMES.find((t) => t.key === theme);

  // Entrada discreta dos blocos, em cascata. O reanimated respeita o "reduzir
  // movimento" do sistema por padrão (ReduceMotion.System).
  const enter = (i) => FadeInDown.duration(motion.layout).delay(i * motion.stagger);

  const title = [text('largeTitle'), { color: colors.text }];
  const subtitle = [text('title'), { color: colors.text }];
  const lead = [text('body'), { color: colors.text }];
  const glow = darkMode ? 0.08 : 0.12;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[withAlpha(colors.accent, glow), withAlpha(colors.accent, 0)]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '34%' }}
      />
      <AuthTopToggles />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: space.xl,
          // Abaixo das pílulas do topo (44 de alvo), com folga.
          paddingTop: insets.top + space.xs + 44 + space.lg,
          paddingBottom: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <View style={{ gap: space.md }}>
            {/* Sem o nome do app escrito nesta tela, a cruz fica como imagem
                rotulada "APPologética". */}
            <Animated.View entering={enter(0)}>
              <BrandMark size="md" color={colors.accent} />
            </Animated.View>
            <Animated.View entering={enter(1)}>
              <Text style={title}>{isEn ? 'Know how to answer' : 'Saiba responder'}</Text>
            </Animated.View>
            <Animated.View entering={enter(2)}>
              <Text style={lead}>
                {isEn
                  ? 'When someone questions your faith, have the answer with the source in hand.'
                  : 'Quando questionarem a sua fé, tenha a resposta com a fonte na mão.'}
              </Text>
            </Animated.View>
            {/* Texto exato das Bíblias embarcadas (Ave Maria / Douay-Rheims), 1 Pedro 3,15. */}
            <Animated.View entering={enter(3)} style={{ gap: space.xs }}>
              <Text style={[text('reading'), { color: colors.text, fontStyle: 'italic' }]}>
                {isEn
                  ? '"But sanctify the Lord Christ in your hearts, being ready always to satisfy every one that asketh you a reason of that hope which is in you."'
                  : '"Estai sempre prontos a responder para vossa defesa a todo aquele que vos pedir a razão de vossa esperança, mas fazei-o com suavidade e respeito."'}
              </Text>
              <Text style={[text('footnote'), { color: colors.textSubtle }]}>{isEn ? '1 Peter 3:15' : '1 Pedro 3,15'}</Text>
            </Animated.View>
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: space.md }}>
            <Animated.View entering={enter(0)} style={{ gap: space.xs }}>
              <Text style={subtitle}>{isEn ? 'Which theme grabs you most?' : 'Qual tema mais te pega?'}</Text>
              <Text style={lead}>{isEn ? 'We will start with a real answer on it.' : 'Vamos começar com uma resposta real sobre ele.'}</Text>
            </Animated.View>
            <Animated.View entering={enter(1)}>
              <Group>
                {THEMES.map((tm) => (
                  <Row
                    key={tm.key}
                    icon={tm.icon}
                    title={isEn ? tm.en : tm.pt}
                    subtitle={isEn ? tm.subEn : tm.subPt}
                    trailing="chevron"
                    onPress={() => { setTheme(tm.key); setStep(2); }}
                  />
                ))}
              </Group>
            </Animated.View>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: space.md }}>
            <Animated.View entering={enter(0)}>
              <Ionicons name="chatbubbles-outline" size={icon.lg} color={colors.tint} />
            </Animated.View>
            <Animated.View entering={enter(1)}>
              <Text style={subtitle}>{isEn ? 'Ready. Here is your first answer' : 'Pronto. Aqui está sua primeira resposta'}</Text>
            </Animated.View>
            <Animated.View entering={enter(2)}>
              <Text style={lead}>
                {isEn
                  ? `We prepared a guided answer about ${chosenTheme ? chosenTheme.en.toLowerCase() : 'your faith'}. Read it and see how simple it is to respond.`
                  : `Preparamos uma resposta guiada sobre ${chosenTheme ? chosenTheme.pt.toLowerCase() : 'a sua fé'}. Leia e veja como é simples responder.`}
              </Text>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.md, gap: space.xs }}>
        {/* Três segmentos (a ProgressBar dá os 3 px e o dourado de progresso). O
            passo atual já está no título, por isso a barra fica fora do leitor. */}
        <View aria-hidden style={{ flexDirection: 'row', gap: space.xs, marginBottom: space.sm }}>
          {STEPS.map((i) => (
            <ProgressBar key={i} value={i <= step ? 1 : 0} style={{ flex: 1 }} />
          ))}
        </View>

        {step === 0 && (
          <>
            <Button label={isEn ? 'Start' : 'Começar'} onPress={() => setStep(1)} />
            <Button variant="plain" label={isEn ? 'Skip' : 'Pular'} onPress={skip} />
          </>
        )}
        {step === 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button variant="plain" full={false} label={isEn ? 'Back' : 'Voltar'} onPress={() => setStep(0)} />
            <Button variant="plain" full={false} label={isEn ? 'Skip' : 'Pular'} onPress={skip} />
          </View>
        )}
        {step === 2 && (
          <Button label={isEn ? 'See the answer' : 'Ver a resposta'} onPress={start} />
        )}
      </View>
    </View>
  );
}
