import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { textStyle } from '../theme/tokens';

// Card visual de uma resposta a objeção, para capturar como imagem e
// compartilhar no WhatsApp (motor de crescimento organico apontado pelo
// Conselho). Renderizado offscreen com collapsable={false} para o view-shot.
//
// Canvas de 1080 px: os papéis de texto dos tokens (feitos para 390 pt de
// largura) são ampliados na proporção do canvas, e as cores vêm do tema
// (fundo `primary`, texto `onPrimary`, destaques `accent`).
const REFERENCE_WIDTH = 390;
const CANVAS = { width: 1080, height: 1080 };
const SCALE = CANVAS.width / REFERENCE_WIDTH;

const DialogueAnswerCard = forwardRef(({ objection, answer, source }, captureRef) => {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space, fontFamily } = tokens;
  const big = (role) => textStyle(role, (n) => Math.round(n * SCALE), fontFamily);
  const pad = Math.round(space.xxl * SCALE);
  const gap = Math.round(space.md * SCALE);
  const label = [big('caption1'), { color: colors.accent, fontWeight: '600' }];

  return (
    <View
      ref={captureRef}
      collapsable={false}
      style={[CANVAS, { backgroundColor: colors.primary, padding: pad, justifyContent: 'space-between' }]}
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
