import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getSaintToday } from '../data/saints';
import { pick } from '../utils/i18nData';
import { Row } from './ui';

// Santo do dia: Row sem toque para dentro do Group "Liturgia de hoje"
// (Conteúdo do dia), com o ícone alinhado ao topo. Os três textos vão em
// `children`, porque o grau da celebração (footnote) vem antes do nome
// (headline); o resumo fica em subhead.
//
// `saint` vem por prop quando a tela já resolveu o dia (a Conteúdo do dia
// precisa saber antes se há santo, porque o Group conta os filhos e um null
// deixaria uma hairline órfã); sem a prop o card lê getSaintToday() sozinho.
// Sem santo no dia (féria), não renderiza nada.
export default function SaintTodayCard({ saint: saintProp }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const saint = useMemo(() => (saintProp === undefined ? getSaintToday() : saintProp), [saintProp]);

  if (!saint) return null;
  const kind = t(`saint.kind.${saint.kind}`);
  const name = pick(saint, 'name', isEn);
  const summary = pick(saint, 'summary', isEn);

  return (
    <Row icon="rose-outline" style={{ alignItems: 'flex-start' }}>
      <View style={{ gap: space.xxs }}>
        {kind !== `saint.kind.${saint.kind}` ? (
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{kind}</Text>
        ) : null}
        <Text style={[text('headline'), { color: colors.text }]}>{name}</Text>
        {summary ? (
          <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={3}>{summary}</Text>
        ) : null}
      </View>
    </Row>
  );
}
