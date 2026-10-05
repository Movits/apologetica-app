import { ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
// Direto do arquivo, e não do índice './ui': o LargeTitleScreen (que está no
// índice) importa o BackButton daqui, e o índice criaria um ciclo.
import PressScale from './ui/PressScale';

// Botão de header: vai no headerRight do stack (Caderno, página do caderno)
// ou na barra própria de um modal (editor de nota). Com `icon` é um alvo de
// 44x44 com o Ionicons em tint e `aria-label` = label; sem ícone é o rótulo
// curto em headline na cor tint ("Salvar"). `loading` troca o conteúdo por um
// ActivityIndicator sem mudar o tamanho, `disabled` baixa a opacidade e
// bloqueia o toque, `danger` pinta em `colors.danger`.
export default function HeaderButton({ icon, label, onPress, loading, disabled, danger, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon: iconSize } = tokens;
  const color = danger ? colors.danger : colors.tint;
  const blocked = Boolean(disabled || loading);

  return (
    <PressScale
      role="button"
      aria-label={label}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      disabled={blocked}
      onPress={onPress}
      style={[
        {
          minWidth: 44,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.md,
          paddingHorizontal: icon ? 0 : space.sm,
        },
        disabled ? { opacity: 0.4 } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : icon ? (
        <Ionicons name={icon} size={iconSize.md} color={color} />
      ) : (
        <Text style={[text('headline'), { color }]}>{label}</Text>
      )}
    </PressScale>
  );
}

// O botão voltar do app, um só desenho em todo lugar (header do stack na web,
// barra do LargeTitleScreen, telas de entrada): chevron `chevron-back` em
// `icon.lg` na cor tint, como o do iOS, num alvo de pelo menos 44x44 que vem
// do tamanho (sem área extra de toque). `label` opcional ao lado do chevron
// (o nível de cima, como "‹ Bíblia"); sem ele fica só o chevron. O nome
// acessível é `a11yLabel` (padrão: o rótulo), nunca o nome interno da rota.
//
// Posição: o chevron fica sempre no mesmo ponto do botão (recuo `space.xxs`,
// com ou sem rótulo). Quem usa encosta o botão na borda da coluna, e o traço
// do chevron cai uns 12 pt para dentro, um pouco antes do texto da tela, como
// no iOS.
export function BackButton({ onPress, label, a11yLabel, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, icon } = tokens;
  return (
    <PressScale
      role="button"
      aria-label={a11yLabel ?? label}
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          minWidth: 44,
          minHeight: 44,
          paddingLeft: space.xxs,
          paddingRight: label ? space.xs : 0,
        },
        style,
      ]}
    >
      <Ionicons name="chevron-back" size={icon.lg} color={colors.tint} />
      {label ? (
        <Text numberOfLines={1} style={[text('body'), { color: colors.tint, flexShrink: 1 }]}>
          {label}
        </Text>
      ) : null}
    </PressScale>
  );
}
