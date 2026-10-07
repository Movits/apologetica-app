import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { MARKS } from '../../data/journeyMarks';
import EmblemMark from './EmblemMark';

// Emblema redondo de uma conquista ou nível: a marca vetorial de
// src/data/journeyMarks.js (mesmo sistema do BrandMark, uma cor do tema)
// num disco `badgeBg` com hairline dourada; sem marca, o ícone Ionicons.
// `locked` apaga o disco (card, separator, traço terciário) e põe um cadeado
// pequeno no canto. O traço ocupa 62% do disco, como na folha de contato em
// que as marcas foram desenhadas.
//
// `size`: 'sm' | 'md' | 'lg' (tokens.seal). Decorativo: o nome vem escrito
// ao lado ou abaixo, então fica escondido do leitor de tela.
// O ícone do emblema grande cresce na proporção do disco (1,6 x o ícone lg).
const ICON = { sm: 'sm', md: 'md', lg: 'lg' };
const LARGE_ICON_RATIO = 1.6;
const MARK_RATIO = 0.62;

export default function BadgeEmblem({ id, icon, size = 'md', locked = false, style }) {
  const { colors, tokens } = useTheme();
  const { icon: iconSize, radius, seal } = tokens;
  const side = seal[size] ?? seal.md;
  const mark = MARKS[id];
  const ink = locked ? colors.textTertiary : colors.accentText;
  const lockSide = Math.max(iconSize.sm, Math.round(side / 3));

  return (
    <View
      aria-hidden
      style={[
        {
          width: side,
          height: side,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: locked ? colors.card : colors.badgeBg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: locked ? colors.separator : colors.accent,
          overflow: 'visible',
        },
        style,
      ]}
    >
      {mark ? (
        <EmblemMark elements={mark} color={ink} size={Math.round(side * MARK_RATIO)} />
      ) : (
        <Ionicons
          name={icon || 'ribbon-outline'}
          size={size === 'lg' ? Math.round(iconSize.lg * LARGE_ICON_RATIO) : iconSize[ICON[size]]}
          color={ink}
        />
      )}
      {locked ? (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: lockSide,
            height: lockSide,
            borderRadius: radius.full,
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="lock-closed" size={Math.round(lockSide * 0.6)} color={colors.textTertiary} />
        </View>
      ) : null}
    </View>
  );
}
