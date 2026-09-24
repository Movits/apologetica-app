import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getLiturgy, getLiturgicalColorHex, getLiturgicalColorMeaning, getLiturgicalColorName } from '../services/liturgyApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Row } from './ui';
import Skeleton from './Skeleton';

// Nome do dia litúrgico no idioma da interface. A API só fala PT ("Quarta-feira
// da 25ª semana do Tempo Comum"); em EN mostra o dia da semana e o número da
// semana quando existe.
function liturgyTitle(liturgy, isEn) {
  if (!isEn) return liturgy?.liturgia;
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const wm = liturgy?.liturgia?.match(/(\d+)[aª°]?\s*semana/i);
  return wm ? `${day}, week ${wm[1]}` : day;
}

// Liturgia de hoje como uma linha de lista (para dentro do Group do Conteúdo
// do dia): nome do dia, ponto na cor litúrgica com o nome dela e a referência
// do Evangelho, e o significado da cor em footnote. Toque abre as leituras.
// Enquanto carrega, barras com a forma do texto (sem spinner); sem rede, a
// mensagem no lugar do subtítulo. Precisa de internet (liturgyApi tem cache).
export default function LiturgyCard({ onOpen }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const [liturgy, setLiturgy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getLiturgy()
      .then((data) => mounted && setLiturgy(data))
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const label = t('home.todayLiturgy');

  if (loading) {
    return (
      <Row
        icon="calendar-outline"
        trailing="chevron"
        onPress={onOpen}
        accessibilityLabel={`${label}, ${t('common.loading')}`}
      >
        {/* A Row não repassa aria-busy: o estado de carregamento vai na View
            dos Skeleton, como no NewsCard. */}
        <View aria-busy style={{ gap: space.xs, paddingVertical: space.xxs }}>
          <Skeleton width="70%" height={text('body').lineHeight} />
          <Skeleton width="45%" />
        </View>
      </Row>
    );
  }

  // Sem rede: o título do erro no lugar do nome do dia (o header do Group já
  // diz "Liturgia de hoje") e a explicação como subtítulo.
  if (error || !liturgy) {
    return (
      <Row
        icon="calendar-outline"
        title={t('liturgy.errorTitle')}
        subtitle={t('liturgy.needsInternet')}
        trailing="chevron"
        onPress={onOpen}
        accessibilityLabel={`${label}, ${t('liturgy.errorTitle')}. ${t('liturgy.needsInternet')}`}
      />
    );
  }

  const lang = isEn ? 'en' : 'pt';
  const colorHex = liturgy.cor ? getLiturgicalColorHex(liturgy.cor) : null;
  const gospel = Array.isArray(liturgy.leituras?.evangelho) ? liturgy.leituras.evangelho[0] : liturgy.leituras?.evangelho;
  const meta = [liturgy.cor ? getLiturgicalColorName(liturgy.cor, lang) : null, gospel?.referencia].filter(Boolean).join(' · ');
  const meaning = liturgy.cor ? getLiturgicalColorMeaning(liturgy.cor, lang) : null;

  return (
    <Row
      icon="calendar-outline"
      title={liturgyTitle(liturgy, isEn)}
      titleLines={2}
      trailing="chevron"
      onPress={onOpen}
      accessibilityLabel={[label, liturgyTitle(liturgy, isEn), meta].filter(Boolean).join(', ')}
    >
      {meta ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs, marginTop: space.xxs }}>
          {colorHex ? (
            <View
              aria-hidden
              style={{
                width: space.xs,
                height: space.xs,
                borderRadius: tokens.radius.full,
                backgroundColor: colorHex,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.separator,
              }}
            />
          ) : null}
          <Text style={[text('subhead'), { color: colors.textSubtle, flexShrink: 1 }]} numberOfLines={1}>{meta}</Text>
        </View>
      ) : null}
      {meaning ? (
        <Text style={[text('footnote'), { color: colors.textTertiary, marginTop: space.xxs }]} numberOfLines={2}>
          {meaning}
        </Text>
      ) : null}
    </Row>
  );
}
