import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, BackHandler, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES, getDialogueById } from '../data/dialogues';
import { articles } from '../data/articles';
import DialogueAnswerCard from '../components/DialogueAnswerCard';
import { captureAndShareImage } from '../utils/shareAsImage';
import { shareDialogue } from '../utils/share';
import { openArticle } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { Button, Group, ProgressBar, Row, SectionTitle } from '../components/ui';

// O card de compartilhar (1080x1080) fica montado fora da tela, só para o
// view-shot capturar. É um deslocamento, não uma medida de layout.
const OFFSCREEN = { position: 'absolute', left: -10000, top: -10000, opacity: 0 };

// Tela mestre: lista de objeções. Ao escolher uma, vira modo "conversa guiada".
export default function DialogueScreen({ navigation, route }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, motion } = tokens;
  const initialId = route?.params?.dialogueId;
  const [activeId, setActiveId] = useState(initialId || null);
  const [stepIndex, setStepIndex] = useState(0);
  // Quando o diálogo foi aberto pela lista, o "voltar" retorna pra lista.
  // Quando veio por deep link (ex.: Objeção do dia na Home), o "voltar" deve
  // sair da tela direto, sem parada intermediária na lista.
  const openedFromListRef = useRef(false);
  const shareCardRef = useRef(null);

  // Abre o diálogo certo quando a tela já está montada e chega um novo
  // dialogueId por navegação (ex.: card Objeção do dia na Home).
  useEffect(() => {
    const id = route?.params?.dialogueId;
    if (id) {
      openedFromListRef.current = false;
      setActiveId(id);
      setStepIndex(0);
    }
  }, [route?.params]);

  const dialogue = activeId ? getDialogueById(activeId) : null;

  // Intercepta o botão de voltar (hardware) quando dentro de um diálogo:
  // volta para a lista em vez de sair da tela.
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeId !== null && openedFromListRef.current) {
        setActiveId(null);
        setStepIndex(0);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [activeId]));

  // Intercepta o botão de voltar do header quando dentro de um diálogo.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (activeId !== null && openedFromListRef.current) {
        e.preventDefault();
        setActiveId(null);
        setStepIndex(0);
      }
    });
    return unsub;
  }, [navigation, activeId]);

  if (!dialogue) {
    return <DialogueList onChoose={(id) => { openedFromListRef.current = true; setActiveId(id); setStepIndex(0); }} />;
  }

  const total = dialogue.steps.length;
  const isLast = stepIndex + 1 >= total;
  const objection = pick(dialogue, 'objection', isEn);

  // Card compartilhável: objeção + o passo de fecho (resposta curta) + fonte.
  const closeStep = dialogue.steps[total - 1];
  const answer = closeStep ? pick(closeStep, 'text', isEn) : '';
  const relArticle = articles.find((a) => a.id === dialogue.relatedArticle);
  const source = relArticle ? pick(relArticle, 'title', isEn) : '';

  const shareAnswer = () => {
    if (Platform.OS === 'web') {
      shareDialogue({ objection, answer, source });
    } else {
      captureAndShareImage(shareCardRef, `"${objection}"\n\n${answer}${source ? `\n\n(${source})` : ''}`);
    }
  };

  const chooseOther = () => { setActiveId(null); setStepIndex(0); };
  const caption = [text('footnote'), { color: colors.textSubtle }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.md, gap: space.sm }}>
        <Text style={caption}>{t('dialogue.someoneSays')}</Text>
        <Text role="heading" style={[text('title'), { color: colors.tint, fontStyle: 'italic' }]}>
          {objection}
        </Text>

        <Text style={[caption, { marginTop: space.sm }]}>{t('dialogue.youAnswer')}</Text>
        {/* Um Group por passo revelado, com o rótulo do passo como cabeçalho e
            o texto em serifa de leitura. O passo novo entra de baixo. */}
        {dialogue.steps.slice(0, stepIndex + 1).map((s, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(motion.layout)}>
            <Group header={`${i + 1}. ${pick(s, 'label', isEn)}`}>
              <View style={{ padding: space.md }}>
                <Text style={[text('reading'), { color: colors.text }]}>{pick(s, 'text', isEn)}</Text>
              </View>
            </Group>
          </Animated.View>
        ))}

        {/* Indicador de passos: segmentos de 3 px como no onboarding. */}
        <View style={{ marginTop: space.sm, gap: space.xs }}>
          <View aria-hidden style={{ flexDirection: 'row', gap: space.xs }}>
            {dialogue.steps.map((_, i) => (
              <ProgressBar key={i} value={i <= stepIndex ? 1 : 0} style={{ flex: 1 }} />
            ))}
          </View>
          <Text style={[caption, { textAlign: 'center' }]}>{t('dialogue.stepOf', { n: stepIndex + 1, total })}</Text>
        </View>

        {!isLast ? (
          <Button label={t('dialogue.nextStep')} icon="arrow-down" onPress={() => setStepIndex(stepIndex + 1)} haptic="impact" />
        ) : (
          <Button label={t('dialogue.share')} icon="share-social-outline" onPress={shareAnswer} haptic="impact" />
        )}

        {isLast && dialogue.relatedArticle ? (
          <Group header={t('dialogue.relatedArticle')}>
            <Row
              icon="book-outline"
              title={source || t('quiz.readArticle')}
              subtitle={source ? t('quiz.readArticle') : undefined}
              titleLines={2}
              trailing="chevron"
              onPress={() => openArticle(navigation, dialogue.relatedArticle)}
            />
          </Group>
        ) : null}

        <Button variant="plain" label={t('dialogue.chooseOther')} onPress={chooseOther} />
      </ScrollView>

      {/* Card renderizado fora da tela, só pra capturar como imagem (nativo). */}
      {Platform.OS !== 'web' && (
        <View style={OFFSCREEN} pointerEvents="none">
          <DialogueAnswerCard ref={shareCardRef} objection={objection} answer={answer} source={source} />
        </View>
      )}
    </View>
  );
}

// Lista de objeções agrupadas por categoria, as mais comuns primeiro.
function DialogueList({ onChoose }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;

  const grouped = useMemo(() => {
    const out = {};
    DIALOGUES.forEach((d) => {
      const catKey = pick(d, 'category', isEn);
      if (!out[catKey]) out[catKey] = [];
      out[catKey].push(d);
    });
    // Mais comuns primeiro dentro de cada categoria (rank menor = mais buscado).
    Object.keys(out).forEach((k) => out[k].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)));
    return out;
  }, [isEn]);

  const sections = Object.keys(grouped);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingVertical: space.md }}>
      <Text style={[text('subhead'), { color: colors.textSubtle, marginHorizontal: space.md }]}>
        {t('dialogue.intro')}
      </Text>

      {sections.map((cat) => (
        <View key={cat}>
          <SectionTitle title={cat} />
          <Group style={{ marginHorizontal: space.md }}>
            {grouped[cat].map((d) => (
              <Row
                key={d.id}
                title={pick(d, 'objection', isEn)}
                titleLines={0}
                trailing="chevron"
                onPress={() => onChoose(d.id)}
              />
            ))}
          </Group>
        </View>
      ))}
    </ScrollView>
  );
}
