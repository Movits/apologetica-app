import { textStyle } from '../theme/tokens';

// Andaime dos cards de compartilhar como imagem (ShareVerseCard,
// DialogueAnswerCard). A imagem é gerada num canvas de 1080 px de largura, e
// os papéis de texto dos tokens valem para a largura de referência de um
// celular (390 pt): cada papel é ampliado nessa proporção (proporção de
// imagem, não medida de interface), assim como os recuos.
const REFERENCE_WIDTH = 390;
export const CANVAS = { square: { width: 1080, height: 1080 }, story: { width: 1080, height: 1920 } };
export const SCALE = CANVAS.square.width / REFERENCE_WIDTH;

// `big(role)` é o papel de texto ampliado (com a fonte da plataforma), `pad`
// o recuo do card e `gap` o vão entre os blocos, já em pixels do canvas.
export function canvasMetrics(tokens) {
  const big = (role) => textStyle(role, (n) => Math.round(n * SCALE), tokens.fontFamily);
  return {
    big,
    pad: Math.round(tokens.space.xxl * SCALE),
    gap: Math.round(tokens.space.md * SCALE),
  };
}
