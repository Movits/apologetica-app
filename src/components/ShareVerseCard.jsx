import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CANVAS, canvasMetrics } from './shareCanvas';

// Card visual do versículo, usado pra capturar como imagem (quadrado ou story
// do Instagram). Renderizado fora da tela com `collapsable={false}` pra que o
// react-native-view-shot consiga capturar.
//
// O canvas e a ampliação dos papéis de texto vêm de shareCanvas.js; as cores
// vêm do tema: fundo `primary`, texto `onPrimary`, destaques em `accent`.
const ShareVerseCard = forwardRef(({ text, passageRef, variant = 'square' }, captureRef) => {
  const { colors, tokens } = useTheme();
  const { big, pad, gap } = canvasMetrics(tokens);

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
