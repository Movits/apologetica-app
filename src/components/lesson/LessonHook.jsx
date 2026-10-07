import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { pick } from '../../utils/i18nData';
import { haptics } from '../../utils/haptics';
import { XP } from '../../utils/journey';
import OptionButton from './OptionButton';
import XpChip from './XpChip';

// "Antes de ler": a pergunta de previsão da lição, logo abaixo do título do
// artigo. A pessoa aposta numa das três opções com o que já pensa, vê na hora
// se acertou e uma nota curta que puxa para o texto. Vale XP uma vez por
// artigo (motor), certa ou errada: o que conta é ter se comprometido com uma
// resposta antes de ler, que é o que fixa o aprendizado.
//
// `hook` vem de src/data/lessons; `choice` é a escolha já gravada (ou null);
// `onAnswer(index)` dispara o evento. Sem `hook` não desenha nada.
const PREFIX_RE = /^(antes de ler|before you read)\s*[:：]\s*/i;

export default function LessonHook({ hook, choice, onAnswer, style }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon } = tokens;
  const [justGained, setJustGained] = useState(0);

  if (!hook) return null;
  // O rótulo "Antes de ler" já está no cabeçalho do card, então o prefixo sai
  // da pergunta e a primeira letra volta a maiúscula.
  const stripped = (pick(hook, 'question', isEn) || '').replace(PREFIX_RE, '');
  const question = stripped.charAt(0).toUpperCase() + stripped.slice(1);
  const options = pick(hook, 'options', isEn) || [];
  const note = pick(hook, 'note', isEn);
  const answered = typeof choice === 'number';
  const ok = answered && choice === hook.correct;

  const choose = (i) => {
    if (answered) return;
    if (i === hook.correct) haptics.success(); else haptics.selection();
    setJustGained(XP.hook);
    onAnswer?.(i);
  };

  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
        <Ionicons name="bulb-outline" size={icon.sm} color={colors.tint} />
        <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]}>{t('lesson.hook.label')}</Text>
        {answered ? <XpChip n={justGained} animated /> : null}
      </View>
      <Text role="heading" aria-level={2} style={[text('title3'), { color: colors.text }]}>{question}</Text>
      <View role="radiogroup" aria-label={question} style={{ gap: space.xs, marginTop: space.xxs }}>
        {options.map((label, i) => {
          const isCorrect = i === hook.correct;
          const isPicked = i === choice;
          const state = answered && isCorrect ? 'correct' : answered && isPicked ? 'wrong' : 'idle';
          return (
            <OptionButton
              key={i}
              label={label}
              state={state}
              checked={isPicked}
              disabled={answered}
              onPress={() => choose(i)}
            />
          );
        })}
      </View>
      {answered ? (
        <Animated.View
          entering={FadeInDown.duration(tokens.motion.layout)}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, marginTop: space.xxs }}
        >
          <Ionicons
            name={ok ? 'checkmark-circle' : 'information-circle'}
            size={icon.md}
            color={ok ? colors.success : colors.tint}
          />
          <View style={{ flex: 1, gap: space.xxs }}>
            <Text style={[text('headline'), { color: colors.text }]}>
              {ok ? t('lesson.hook.right') : t('lesson.hook.wrong')}
            </Text>
            {note ? <Text style={[text('subhead'), { color: colors.text }]}>{note}</Text> : null}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
