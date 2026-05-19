import { Text } from 'react-native';

// Formata o texto das leituras da Missa destacando SÓ os números de versículo,
// não números que aparecem no meio do texto (tipo "5000 pessoas" ou "12 tribos").
//
// Como? A API da CNBB grafia versículos grudados na palavra seguinte, sem espaço:
//   "1Naquele tempo, 17de Mileto" → o 1 e o 17 são versículos
//   "alimentar 5000 pessoas" → o 5000 não é versículo (tem espaço de cada lado)
//
// Então o critério é: digito imediatamente seguido por letra (sem espaço).
// Só números nesse padrão recebem o estilo dourado pequeno.

const MARK_START = '';
const MARK_END = '';

function parse(text) {
  // Coloca markers ao redor de números colados a letras
  const marked = text.replace(
    /(\d+)([a-zA-ZÀ-ÿ])/g,
    `${MARK_START}$1${MARK_END} $2`
  );

  // Quebra em pedaços de texto e versículo
  const parts = [];
  let i = 0;
  while (i < marked.length) {
    const start = marked.indexOf(MARK_START, i);
    if (start === -1) {
      parts.push({ type: 'text', content: marked.slice(i) });
      break;
    }
    if (start > i) {
      parts.push({ type: 'text', content: marked.slice(i, start) });
    }
    const end = marked.indexOf(MARK_END, start);
    if (end === -1) break;
    parts.push({ type: 'verse', content: marked.slice(start + 1, end) });
    i = end + 1;
  }
  return parts;
}

export default function ReadingText({ text, style, numberStyle }) {
  if (!text) return null;
  const parts = parse(text);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.type === 'verse' ? (
          <Text key={i} style={numberStyle}>{part.content}</Text>
        ) : (
          part.content
        )
      )}
    </Text>
  );
}
