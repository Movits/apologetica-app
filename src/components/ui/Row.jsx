import { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PressScale from './PressScale';

// Linha de lista para dentro de um Group: ícone à esquerda (caixa de 28),
// título e subtítulo no meio, `trailing` à direita ('chevron', texto ou nó).
// Com `onPress` vira um PressScale com role de botão e fundo levemente
// escurecido enquanto pressionada, sem `onPress` é uma View estática.
// `titleColor` pinta o título (uma ação destrutiva usa `danger` no ícone e
// no rótulo); `subtitleLines` limita o subtítulo (default: sem limite).
// `leading` é um nó no lugar da caixa de ícone (capa, avatar, disco colorido);
// `chevron` desenha o chevron mesmo com `trailing` sendo um nó (contador +
// seta), e `trailing="chevron"` continua valendo; `titleRole` troca o papel do
// título ('body' padrão, 'headline' para linhas de destaque); `onLongPress` e
// o resto das props (`role`, `aria-*`, `haptic`, `testID`) vão ao PressScale.
//
// Ícone (ou `leading`) numa linha alta: até duas linhas de texto (título e
// subtítulo, ou título quebrado em dois) ele fica centrado, como no iOS.
// Acima disso (chips, prévia longa, barra de progresso embaixo do título) ele
// sobe e se centra na PRIMEIRA linha do título, senão flutua no meio do bloco,
// longe do rótulo a que pertence. A altura do texto só se sabe depois do
// layout, então a coluna é medida (onLayout) quando a linha pode crescer; a
// primeira pintura chuta "alta" se há `children`, que é o caso comum.
export default function Row({
  icon,
  iconColor,
  leading,
  title,
  titleColor,
  titleRole = 'body',
  subtitle,
  subtitleLines,
  trailing,
  chevron,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
  titleLines = 1,
  style,
  children,
  haptic,
  ...rest
}) {
  const { colors, tokens, text } = useTheme();
  const { space, icon: iconSize } = tokens;
  const hasLeading = Boolean(leading || icon);
  // Pode passar de duas linhas? Título de uma linha sem subtítulo nem filhos,
  // ou com subtítulo de uma linha, nunca passa: essas linhas não medem nada.
  const canGrow = hasLeading && (
    Boolean(children) || titleLines !== 1 || (Boolean(subtitle) && subtitleLines !== 1)
  );
  const [tall, setTall] = useState(Boolean(children));
  const firstLine = text(titleRole).lineHeight;
  // Folga de meio passo da grade: duas linhas de 22 dão 44, título e
  // subtítulo dão 42; a terceira linha passa disso com sobra.
  const onContentLayout = canGrow
    ? (e) => setTall(e.nativeEvent.layout.height > firstLine * 2 + space.xxs)
    : undefined;
  const top = canGrow && tall;

  const base = {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: space.sm,
  };
  const dim = disabled ? { opacity: 0.4 } : null;

  const arrow = <Ionicons name="chevron-forward" size={iconSize.sm} color={colors.textTertiary} />;
  let trail = null;
  if (trailing === 'chevron') {
    trail = arrow;
  } else if (typeof trailing === 'string' || typeof trailing === 'number') {
    trail = <Text style={[text('body'), { color: colors.textSubtle }]}>{trailing}</Text>;
  } else if (trailing) {
    trail = trailing;
  }
  // `chevron` junto de um trailing próprio: os dois lado a lado, com o mesmo
  // respiro que separa as colunas da linha.
  if (chevron && trailing !== 'chevron') {
    trail = trail
      ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>{trail}{arrow}</View>
      : arrow;
  }

  // Na linha alta a caixa do ícone tem a altura da primeira linha do título
  // (no mínimo a do ícone) e encosta no topo do texto: o ícone fica centrado
  // nessa linha. Um `leading` próprio ganha uma faixa da mesma altura mínima:
  // o que for menor que a linha (o ponto de cor das Marcações) se centra
  // nela, o que for maior (a miniatura das Notícias) começa no topo do texto.
  // O invólucro do `leading` existe nos dois estados (só o estilo muda): se
  // ele aparecesse só na linha alta, a troca alta/baixa depois da medição
  // remontaria o `leading` (a miniatura remota das Notícias recarregava).
  let lead = null;
  if (leading) {
    lead = (
      <View style={top ? { alignSelf: 'flex-start', minHeight: firstLine, justifyContent: 'center' } : null}>
        {leading}
      </View>
    );
  } else if (icon) {
    lead = (
      <View
        style={[
          { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
          top ? { alignSelf: 'flex-start', height: Math.max(firstLine, iconSize.md) } : null,
        ]}
      >
        <Ionicons name={icon} size={iconSize.md} color={iconColor ?? colors.tint} />
      </View>
    );
  }

  const content = (
    <>
      {lead}
      <View style={{ flex: 1, minWidth: 0 }} onLayout={onContentLayout}>
        {title ? (
          <Text style={[text(titleRole), { color: titleColor ?? colors.text }]} numberOfLines={titleLines || undefined}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={subtitleLines || undefined}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
      {trail}
    </>
  );

  if (!onPress && !onLongPress) {
    return (
      <View style={[base, dim, style]} aria-label={accessibilityLabel} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </View>
    );
  }

  return (
    <PressScale
      role="button"
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      haptic={haptic}
      aria-label={accessibilityLabel}
      aria-disabled={disabled || undefined}
      style={({ pressed }) => [base, pressed ? { backgroundColor: colors.separator } : null, dim, style]}
      {...rest}
    >
      {content}
    </PressScale>
  );
}
