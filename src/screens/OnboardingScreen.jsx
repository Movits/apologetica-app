import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { setOnboardingDone } from '../utils/onboarding';

const { width } = Dimensions.get('window');

// Slides definidos como função para reagir a mudança de idioma.
function getSlides(isEn) {
  return [
    {
      icon: 'shield-checkmark-outline',
      title: isEn ? 'Welcome to APPologética' : 'Bem-vindo ao APPologética',
      body: isEn
        ? 'An app to defend and deepen your Catholic faith with historical, biblical and magisterial sources.'
        : 'Um aplicativo para defender e aprofundar sua fé católica com fontes históricas, biblicas e magistério.',
      verse: isEn
        ? '"Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have."'
        : '"Estai sempre prontos a responder a todo aquele que vos pedir razão da esperança que há em vós."',
      verseRef: isEn ? '1 Peter 3,15' : '1 Pedro 3,15',
    },
    {
      icon: 'book-outline',
      title: isEn ? 'Learn deeply' : 'Aprenda em profundidade',
      body: isEn
        ? 'Articles with Greek and Hebrew sources, references from the Catechism, Councils, Church Fathers, and approved miracles.'
        : 'Artigos com fontes em grego e hebraico, referências do Catecismo, Concílios, Padres da Igreja e milagres comprovados.',
    },
    {
      icon: 'compass-outline',
      title: isEn ? 'What you find here' : 'O que você encontra aqui',
      body: isEn
        ? 'Ave Maria Bible offline (PT), Douay-Rheims in English, Catechism, daily liturgy from CNBB, biblical map, apologetics quiz, dialogue mode, and 30-day reading plan.'
        : 'Bíblia Ave Maria offline, Douay-Rheims em inglês, Catecismo, liturgia diária da CNBB, mapa bíblico, quiz apologético, modo diálogo e plano de leitura de 30 dias.',
    },
    {
      icon: 'language-outline',
      title: isEn ? 'Portuguese or English' : 'Português ou inglês',
      body: isEn
        ? 'The app works in Portuguese and English. Bible, Catechism, and most articles are translated. Change the language in Settings.'
        : 'O aplicativo funciona em português e inglês. Bíblia, Catecismo e a maior parte dos artigos estão traduzidos. Mude o idioma em Ajustes.',
    },
    {
      icon: 'heart-outline',
      title: isEn ? 'Let\'s begin' : 'Vamos começar',
      body: isEn
        ? 'Tap a topic in the "Articles" tab, search by keywords, or start with the reading plan. Faith deepens with honest questions.'
        : 'Toque em um tema na aba "Artigos", busque por palavras-chave ou comece pelo plano de leitura. A fé se aprofunda com perguntas honestas.',
    },
  ];
}

export default function OnboardingScreen({ onDone }) {
  const { colors, fs, darkMode, setDarkMode } = useTheme();
  const { isEn, lang, setLang } = useLanguage();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);
  const styles = makeStyles(colors, fs);

  const SLIDES = getSlides(isEn);

  const goTo = (i) => {
    // scrollToOffset é mais confiável que scrollToIndex no react-native-web.
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    setIndex(i);
  };

  const finish = async () => {
    await setOnboardingDone();
    onDone?.();
  };

  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon} size={56} color={colors.accent} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      {item.verse && (
        <View style={styles.verseBox}>
          <Text style={styles.verse}>{item.verse}</Text>
          <Text style={styles.verseRef}>{item.verseRef}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Pílulas de tema (claro/escuro) e idioma no canto superior direito */}
      <View style={styles.toggleRow}>
        <TouchableOpacity style={styles.pill} onPress={() => setDarkMode(!darkMode)} hitSlop={12}>
          <Ionicons name={darkMode ? 'sunny-outline' : 'moon-outline'} size={14} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill} onPress={toggleLang} hitSlop={12}>
          <Ionicons name="language-outline" size={14} color={colors.textMuted} />
          <Text style={styles.langText}>{lang === 'pt' ? 'English' : 'Português'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={32}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          {index < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity onPress={finish}>
                <Text style={styles.skip}>{isEn ? 'Skip' : 'Pular'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={() => goTo(index + 1)}>
                <Text style={styles.nextText}>{isEn ? 'Next' : 'Próximo'}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.nextBtn, { width: '100%', justifyContent: 'center' }]} onPress={finish}>
              <Text style={styles.nextText}>{isEn ? 'Enter the app' : 'Entrar no app'}</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    slide: { width, padding: 32, justifyContent: 'center', alignItems: 'center' },
    iconCircle: {
      width: 120, height: 120, borderRadius: 60,
      backgroundColor: c.card,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 32, borderWidth: 2, borderColor: c.accent,
    },
    title: { fontSize: fs(24), fontWeight: 'bold', color: c.primaryText, textAlign: 'center', marginBottom: 16 },
    body: { fontSize: fs(15), color: c.text, lineHeight: fs(22), textAlign: 'center', marginBottom: 16 },
    verseBox: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: c.card, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: c.accent },
    verse: { fontSize: fs(14), color: c.textMuted, fontStyle: 'italic', textAlign: 'center', lineHeight: fs(20) },
    verseRef: { fontSize: fs(12), color: c.accent, fontWeight: 'bold', textAlign: 'center', marginTop: 6 },
    toggleRow: {
      position: 'absolute', top: 50, right: 20, zIndex: 10,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
      borderWidth: 1, borderColor: c.divider, backgroundColor: c.card,
    },
    langText: { color: c.textMuted, fontSize: fs(11), fontWeight: '600' },
    footer: { padding: 24, paddingBottom: 40, gap: 20 },
    dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.divider },
    dotActive: { backgroundColor: c.accent, width: 24 },
    actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    skip: { color: c.textMuted, fontSize: fs(14), padding: 8 },
    nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
    nextText: { color: '#fff', fontSize: fs(14), fontWeight: 'bold' },
  });
