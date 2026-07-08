import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { setOnboardingDone, setStartIntent } from '../utils/onboarding';
import { getDialoguesByCategory } from '../data/dialogues';
import AuthTopToggles from '../components/AuthTopToggles';
import CrossMark from '../components/CrossMark';

// Onboarding v2: ativação em vez de tour passivo. Em ate 60s o usuario
// escolhe um tema e cai direto num dialogo de resposta relevante (o "aha"
// de apologetica: "eu ja consigo responder isso"). Ver Conselho, Onda 3.

// Temas = categorias reais dos dialogos (string exata usada em dialogues.js).
const THEMES = [
  { key: 'Existência de Deus', icon: 'planet-outline', pt: 'A existência de Deus', en: 'The existence of God', subPt: 'ateísmo, ciência e fé', subEn: 'atheism, science and faith' },
  { key: 'Igreja Católica', icon: 'home-outline', pt: 'A Igreja Católica', en: 'The Catholic Church', subPt: 'papa, Maria, sacramentos', subEn: 'pope, Mary, sacraments' },
  { key: 'Sagrada Escritura', icon: 'book-outline', pt: 'A Bíblia', en: 'The Bible', subPt: 'interpretação, contradições', subEn: 'interpretation, contradictions' },
  { key: 'Moral', icon: 'heart-outline', pt: 'Moral e vida', en: 'Morality and life', subPt: 'aborto, sexualidade, família', subEn: 'abortion, sexuality, family' },
  { key: 'Outras Religiões', icon: 'people-outline', pt: 'Outras religiões', en: 'Other religions', subPt: 'evangélicos, espiritismo', subEn: 'protestants, spiritism' },
  { key: 'História', icon: 'time-outline', pt: 'História da Igreja', en: 'Church history', subPt: 'Inquisição, Cruzadas', subEn: 'Inquisition, Crusades' },
];

// Com quem a pessoa mais conversa: usado so para uma linha de copy personalizada.
const AUDIENCES = [
  { key: 'evangelicos', icon: 'chatbubbles-outline', pt: 'Amigos evangélicos', en: 'Protestant friends' },
  { key: 'ateus', icon: 'help-circle-outline', pt: 'Ateus e céticos', en: 'Atheists and skeptics' },
  { key: 'familia', icon: 'people-circle-outline', pt: 'Minha família', en: 'My family' },
  { key: 'eu', icon: 'person-outline', pt: 'Comigo mesmo(a)', en: 'Myself' },
];

function pickDialogue(themeKey) {
  const list = getDialoguesByCategory(themeKey) || [];
  if (!list.length) return null;
  // rank menor = mais comum/buscado; começa pelo mais forte.
  const sorted = [...list].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  return sorted[0]?.id || null;
}

export default function OnboardingScreen({ onDone }) {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const styles = makeStyles(colors, fs);

  const [step, setStep] = useState(0); // 0 intro, 1 tema, 2 público, 3 pronto
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AuthTopToggles />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* barra de progresso simples */}
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.pDot, i <= step && styles.pDotOn]} />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.center}>
            <CrossMark size={fs(64)} color={colors.accent} opacity={1} style={{ marginBottom: 20 }} />
            <Text style={styles.h1}>{isEn ? 'Know how to answer' : 'Saiba responder'}</Text>
            <Text style={styles.lead}>
              {isEn
                ? 'When someone questions your faith, have the answer, with the source in hand. Let us set you up in under a minute.'
                : 'Quando questionarem a sua fé, tenha a resposta, com a fonte na mão. Vamos te preparar em menos de um minuto.'}
            </Text>
            <View style={styles.verseBox}>
              <Text style={styles.verse}>
                {isEn
                  ? '"Always be prepared to give an answer to everyone who asks you the reason for the hope that you have, but with gentleness and respect."'
                  : '"Estai sempre prontos a responder a todo aquele que vos pedir razão da esperança que há em vós, mas com mansidão e respeito."'}
              </Text>
              <Text style={styles.verseRef}>1 {isEn ? 'Peter' : 'Pedro'} 3,15-16</Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.h2}>{isEn ? 'Which theme grabs you most?' : 'Qual tema mais te pega?'}</Text>
            <Text style={styles.sub}>{isEn ? 'We will start with a real answer on it.' : 'Vamos começar com uma resposta real sobre ele.'}</Text>
            <View style={styles.grid}>
              {THEMES.map((tm) => {
                const on = theme === tm.key;
                return (
                  <TouchableOpacity
                    key={tm.key}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => { setTheme(tm.key); setStep(2); }}
                    accessibilityRole="button"
                    accessibilityLabel={isEn ? tm.en : tm.pt}
                  >
                    <Ionicons name={tm.icon} size={26} color={on ? '#fff' : colors.accent} />
                    <Text style={[styles.chipTitle, on && styles.chipTitleOn]}>{isEn ? tm.en : tm.pt}</Text>
                    <Text style={[styles.chipSub, on && styles.chipTitleOn]}>{isEn ? tm.subEn : tm.subPt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.h2}>{isEn ? 'Who do you talk about faith with most?' : 'Com quem você mais conversa sobre fé?'}</Text>
            <Text style={styles.sub}>{isEn ? 'Just so we speak your language.' : 'Só pra falarmos a sua língua.'}</Text>
            <View style={styles.list}>
              {AUDIENCES.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={styles.rowChip}
                  onPress={() => setStep(3)}
                  accessibilityRole="button"
                  accessibilityLabel={isEn ? a.en : a.pt}
                >
                  <Ionicons name={a.icon} size={22} color={colors.accent} />
                  <Text style={styles.rowChipText}>{isEn ? a.en : a.pt}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.center}>
            <View style={styles.readyIcon}>
              <Ionicons name="chatbubbles" size={44} color={colors.accent} />
            </View>
            <Text style={styles.h2}>{isEn ? 'Ready. Here is your first answer' : 'Pronto. Aqui está sua primeira resposta'}</Text>
            <Text style={styles.lead}>
              {isEn
                ? `We prepared a guided answer about ${chosenTheme ? chosenTheme.en.toLowerCase() : 'your faith'}. Read it and see how simple it is to respond.`
                : `Preparamos uma resposta guiada sobre ${chosenTheme ? chosenTheme.pt.toLowerCase() : 'a sua fé'}. Leia e veja como é simples responder.`}
            </Text>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <>
            <TouchableOpacity onPress={skip} accessibilityRole="button">
              <Text style={styles.skip}>{isEn ? 'Skip' : 'Pular'}</Text>
            </TouchableOpacity>
            {step === 0 ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)} accessibilityRole="button">
                <Text style={styles.primaryText}>{isEn ? 'Start' : 'Começar'}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setStep(step - 1)} accessibilityRole="button">
                <Text style={styles.skip}>{isEn ? 'Back' : 'Voltar'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, { width: '100%', justifyContent: 'center' }]} onPress={start} accessibilityRole="button">
            <Text style={styles.primaryText}>{isEn ? 'See the answer' : 'Ver a resposta'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    scroll: { padding: 24, paddingTop: 64, flexGrow: 1, justifyContent: 'center' },
    progress: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 28 },
    pDot: { width: 26, height: 5, borderRadius: 3, backgroundColor: c.divider },
    pDotOn: { backgroundColor: c.accent },
    center: { alignItems: 'center' },
    h1: { fontSize: fs(30), fontWeight: 'bold', color: c.primaryText, textAlign: 'center', marginBottom: 12 },
    h2: { fontSize: fs(22), fontWeight: 'bold', color: c.primaryText, textAlign: 'center', marginBottom: 6 },
    sub: { fontSize: fs(14), color: c.textMuted, textAlign: 'center', marginBottom: 22 },
    lead: { fontSize: fs(15), color: c.text, lineHeight: fs(23), textAlign: 'center', marginBottom: 18 },
    verseBox: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: c.card, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: c.accent },
    verse: { fontSize: fs(14), color: c.textMuted, fontStyle: 'italic', textAlign: 'center', lineHeight: fs(21) },
    verseRef: { fontSize: fs(12), color: c.accentText, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    chip: {
      width: '47%', minHeight: 108, backgroundColor: c.card, borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: c.cardBorder, justifyContent: 'center',
    },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipTitle: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText, marginTop: 8 },
    chipTitleOn: { color: '#fff' },
    chipSub: { fontSize: fs(12), color: c.textMuted, marginTop: 2 },
    list: { gap: 12 },
    rowChip: {
      flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56,
      backgroundColor: c.card, borderRadius: 12, paddingHorizontal: 16,
      borderWidth: 1, borderColor: c.cardBorder,
    },
    rowChipText: { flex: 1, fontSize: fs(16), color: c.text, fontWeight: '600' },
    readyIcon: {
      width: 88, height: 88, borderRadius: 44, backgroundColor: c.card,
      justifyContent: 'center', alignItems: 'center', marginBottom: 20,
      borderWidth: 2, borderColor: c.accent,
    },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingBottom: 40, gap: 16 },
    skip: { color: c.textMuted, fontSize: fs(14), padding: 8, minHeight: 44, textAlignVertical: 'center' },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.primary, paddingVertical: 14, paddingHorizontal: 26, borderRadius: 12, minHeight: 48 },
    primaryText: { color: '#fff', fontSize: fs(15), fontWeight: 'bold' },
  });
