import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CANVAS, canvasMetrics } from './shareCanvas';

// Card visual de uma resposta a objeção, para capturar como imagem e
// compartilhar no WhatsApp (motor de crescimento organico apontado pelo
// Conselho). Renderizado offscreen com collapsable={false} para o view-shot.
//
// Canvas quadrado de 1080 px e ampliação dos papéis de texto de
// shareCanvas.js; as cores vêm do tema (fundo `primary`, texto `onPrimary`,
// destaques `accent`).
const DialogueAnswerCard = forwardRef(({ objection, answer, source }, captureRef) => {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  const { big, pad, gap } = canvasMetrics(tokens);
  const label = [big('caption1'), { color: colors.accent, fontWeight: '600' }];

  return (
    <View
      ref={captureRef}
      collapsable={false}
      style={[CANVAS.square, { backgroundColor: colors.primary, padding: pad, justifyContent: 'space-between' }]}
    >
      <View style={{ flex: 1, justifyContent: 'center', gap }}>
        <Text style={label}>{t('share.objection')}</Text>
        <Text style={[big('callout'), { color: colors.onPrimary, fontStyle: 'italic' }]}>“{objection}”</Text>
        <View style={{ height: space.xxs, backgroundColor: colors.accent, opacity: 0.4 }} />
        <Text style={label}>{t('share.answer')}</Text>
        <Text style={[big('subhead'), { color: colors.onPrimary }]}>{answer}</Text>
        {source ? (
          <Text style={[big('caption1'), { color: colors.heroSub, fontStyle: 'italic' }]}>{source}</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md }}>
        <Text style={[big('headline'), { color: colors.accent }]}>✝</Text>
        <Text style={[big('footnote'), { color: colors.accent, fontWeight: '600' }]}>APPologética</Text>
      </View>
    </View>
  );
});

DialogueAnswerCard.displayName = 'DialogueAnswerCard';

export default DialogueAnswerCard;
