import { Fragment, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { examConscience } from '../data/examConscience';
import { openArticle } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { Button, Group, Row, SectionTitle } from '../components/ui';

// Exame de consciência: os dez mandamentos como seções, cada pergunta numa
// linha marcável. As marcações vivem só no estado desta tela (nada é gravado,
// por privacidade: ver o cabeçalho de src/data/examConscience.js) e somem ao
// sair. O artigo de apoio (id 83, os Mandamentos) abre pelo openArticle.

// Linha de pergunta com papel de checkbox: a Row repassa `role` e
// `aria-checked` ao PressScale, e a marca vai em `trailing`.
function CheckRow({ label, checked, onToggle }) {
  const { colors, tokens } = useTheme();
  const { icon } = tokens;
  return (
    <Row
      role="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      haptic="selection"
      title={label}
      titleLines={0}
      trailing={(
        <Ionicons
          name={checked ? 'checkmark-circle' : 'ellipse-outline'}
          size={icon.md}
          color={checked ? colors.success : colors.textTertiary}
        />
      )}
      onPress={onToggle}
    />
  );
}

export default function ExamConscienceScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  // Chaves "id-da-seção:índice-da-pergunta" marcadas.
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (key) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xl }}>
      <Text style={[text('body'), { color: colors.text }]}>
        {isEn
          ? 'Preparation for the Sacrament of Reconciliation. Use these questions to examine your life before God.'
          : 'Preparação para o Sacramento da Reconciliação. Use estas perguntas para examinar sua vida diante de Deus.'}
      </Text>
      <Text style={[text('reading'), { color: colors.textSubtle, marginTop: space.sm }]}>
        {isEn
          ? '"If we confess our sins, he is faithful and just to forgive us." (1 John 1:9)'
          : '"Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar." (1 João 1,9)'}
      </Text>
      <Text style={[text('footnote'), { color: colors.textTertiary, marginTop: space.sm }]}>
        {isEn
          ? 'Marks stay on this screen only and are cleared when you leave. Nothing is saved.'
          : 'As marcações ficam só nesta tela e somem ao sair. Nada é gravado.'}
      </Text>

      <Group style={{ marginTop: space.md }}>
        <Row
          icon="book-outline"
          title={isEn ? 'Understand and defend the Commandments' : 'Entenda e defenda os Mandamentos'}
          titleLines={2}
          trailing="chevron"
          onPress={() => navigation && openArticle(navigation, 83)}
        />
      </Group>

      {checked.size > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: space.md,
            paddingLeft: space.md,
          }}
        >
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>
            {t('exam.markedCount', { n: checked.size })}
          </Text>
          <Button variant="plain" full={false} label={t('exam.clear')} onPress={() => setChecked(new Set())} />
        </View>
      ) : null}

      {examConscience.map((section) => {
        const questions = pick(section, 'questoes', isEn) || [];
        return (
          <Fragment key={section.id}>
            <SectionTitle title={pick(section, 'titulo', isEn)} />
            <Group header={pick(section, 'mandamento', isEn)}>
              {questions.map((q, i) => {
                const key = `${section.id}:${i}`;
                return (
                  <CheckRow
                    key={key}
                    label={q}
                    checked={checked.has(key)}
                    onToggle={() => toggle(key)}
                  />
                );
              })}
            </Group>
          </Fragment>
        );
      })}
    </ScrollView>
  );
}
