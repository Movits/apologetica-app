import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { textStyle } from '../theme/tokens';

// Card visual do versículo, usado pra capturar como imagem (quadrado ou story
// do Instagram). Renderizado fora da tela com `collapsable={false}` pra que o
// react-native-view-shot consiga capturar.
//
// A imagem é gerada num canvas de 1080 px de largura, e os papéis de texto dos
// tokens valem para a largura de referência de um celular (390 pt). Cada
// papel é ampliado nessa proporção (proporção de imagem, não medida de
// interface), e as cores vêm do tema: fundo `primary`, texto `onPrimary`,
// destaques em `accent`.
const REFERENCE_WIDTH = 390;
const CANVAS = { square: { width: 1080, height: 1080 }, story: { width: 1080, height: 1920 } };
const SCALE = CANVAS.square.width / REFERENCE_WIDTH;

const ShareVerseCard = forwardRef(({ text, passageRef, variant = 'square' }, captureRef) => {
  const { colors, tokens } = useTheme();
  const { space, fontFamily } = tokens;
  const big = (role) => textStyle(role, (n) => Math.round(n * SCALE), fontFamily);
  const pad = Math.round(space.xxl * SCALE);
  const gap = Math.round(space.md * SCALE);

  return (
    <View
      ref={captureRef}
      collapsable={false}
      style={[
        { backgroundColor: colors.primary, padding: pad, justifyContent: 'space-between' },
        CANVAS[variant] || CANVAS.square,
      ]}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap }}>
        <Text style={[big('largeTitle'), { color: colors.accent }]}>✝</Text>
        <Text style={[big('reading'), { color: colors.onPrimary, textAlign: 'center', fontStyle: 'italic' }]}>
          “{text}”
        </Text>
        <Text style={[big('headline'), { color: colors.accent }]}>{passageRef}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={[big('footnote'), { color: colors.accent, fontWeight: '600' }]}>APPologética</Text>
      </View>
    </View>
  );
});

ShareVerseCard.displayName = 'ShareVerseCard';

export default ShareVerseCard;
