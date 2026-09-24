import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getSaintToday } from '../data/saints';
import { pick } from '../utils/i18nData';

// Santo do dia: bloco para dentro do Group "Liturgia de hoje" (Conteúdo do
// dia), na mesma grade da Row (ícone numa caixa de 28, texto ao lado). Grau
// da celebração em footnote, nome em headline, resumo em subhead.
//
// `saint` vem por prop quando a tela já resolveu o dia (a Conteúdo do dia
// precisa saber antes se há santo, porque o Group conta os filhos e um null
// deixaria uma hairline órfã); sem a prop o card lê getSaintToday() sozinho.
// Sem santo no dia (féria), não renderiza nada.
export default function SaintTodayCard({ saint: saintProp }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, icon } = tokens;
  const saint = useMemo(() => (saintProp === undefined ? getSaintToday() : saintProp), [saintProp]);

  if (!saint) return null;
  const kind = t(`saint.kind.${saint.kind}`);
  const name = pick(saint, 'name', isEn);
  const summary = pick(saint, 'summary', isEn);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: space.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        minHeight: 44,
      }}
    >
      <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="rose-outline" size={icon.md} color={colors.tint} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        {kind !== `saint.kind.${saint.kind}` ? (
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{kind}</Text>
        ) : null}
        <Text style={[text('headline'), { color: colors.text }]}>{name}</Text>
        {summary ? (
          <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={3}>{summary}</Text>
        ) : null}
      </View>
    </View>
  );
}
