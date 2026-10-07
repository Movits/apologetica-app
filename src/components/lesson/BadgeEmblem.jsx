import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { JOURNEY_ART, LEVEL_ART } from '../../data/journeyArt';

// Emblema redondo de uma conquista ou nível: o desenho ilustrado de
// src/data/journeyArt.js quando existe, senão o ícone Ionicons num disco
// `badgeBg` com hairline dourada. `locked` apaga o disco (card, separator,
// ícone terciário) e põe um cadeado pequeno no canto.
//
// `size`: 'sm' | 'md' | 'lg' (tokens.seal). Decorativo: o nome vem escrito
// ao lado ou abaixo, então fica escondido do leitor de tela.
// O ícone do emblema grande cresce na proporção do disco (1,6 x o ícone lg).
const ICON = { sm: 'sm', md: 'md', lg: 'lg' };
const LARGE_ICON_RATIO = 1.6;

export default function BadgeEmblem({ id, icon, size = 'md', locked = false, style }) {
  const { colors, tokens } = useTheme();
  const { icon: iconSize, radius, seal } = tokens;
  const side = seal[size] ?? seal.md;
  const art = JOURNEY_ART[id] || LEVEL_ART[id];
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
      {art && !locked ? (
        <Image source={art} style={{ width: side, height: side, borderRadius: radius.full }} resizeMode="cover" />
      ) : (
        <Ionicons
          name={icon || 'ribbon-outline'}
          size={size === 'lg' ? Math.round(iconSize.lg * LARGE_ICON_RATIO) : iconSize[ICON[size]]}
          color={locked ? colors.textTertiary : colors.accentText}
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
