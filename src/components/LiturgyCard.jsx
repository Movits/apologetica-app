import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getLiturgy, getLiturgicalColorHex, getLiturgicalColorMeaning, getLiturgicalColorName } from '../services/liturgyApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { liturgyTitle } from '../utils/liturgyTitle';
import { Row } from './ui';
import Skeleton from './Skeleton';

// Ponto na cor litúrgica, com a hairline em `separator` para o branco não
// sumir no fundo claro. Decorativo (o nome da cor vem escrito ao lado): o
// leitor de tela pula. `size` é um token de espaço (xs no card, md na tela).
export function LiturgicalColorDot({ hex, size }) {
  const { colors, tokens } = useTheme();
  return (
    <View
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: tokens.radius.full,
        backgroundColor: hex,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.separator,
      }}
    />
  );
}

// Liturgia de hoje como uma linha de lista (para dentro do Group do Conteúdo
// do dia): nome do dia, ponto na cor litúrgica com o nome dela e a referência
// do Evangelho, e o significado da cor em footnote. Toque abre as leituras.
// Enquanto carrega, barras com a forma do texto (sem spinner); sem rede, a
// mensagem no lugar do subtítulo. Precisa de internet (liturgyApi tem cache).
export default function LiturgyCard({ onOpen }) {
  const { colors, tokens, text } = useTheme();
  const { t, lang, isEn } = useLanguage();
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

  const title = liturgyTitle(liturgy, isEn);
  const colorHex = liturgy.cor ? getLiturgicalColorHex(liturgy.cor) : null;
  const gospel = Array.isArray(liturgy.leituras?.evangelho) ? liturgy.leituras.evangelho[0] : liturgy.leituras?.evangelho;
  const meta = [liturgy.cor ? getLiturgicalColorName(liturgy.cor, lang) : null, gospel?.referencia].filter(Boolean).join(' · ');
  const meaning = liturgy.cor ? getLiturgicalColorMeaning(liturgy.cor, lang) : null;

  return (
    <Row
      icon="calendar-outline"
      title={title}
      titleLines={2}
      trailing="chevron"
      onPress={onOpen}
      accessibilityLabel={[label, title, meta].filter(Boolean).join(', ')}
    >
      {meta ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs, marginTop: space.xxs }}>
          {colorHex ? <LiturgicalColorDot hex={colorHex} size={space.xs} /> : null}
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
