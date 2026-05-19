import { Text } from 'react-native';

// Formata o texto das leituras da Missa destacando os números de versículo.
// A API retorna texto tipo "1Naquele tempo, Jesus disse... 2E todos..."
// Quebramos a string em pedaços de número e texto e renderizamos cada um
// com estilo diferente (número menor, em dourado).
export default function ReadingText({ text, style, numberStyle }) {
  if (!text) return null;

  // Insere espaço entre dígito e qualquer letra (maiúscula ou minúscula)
  // e também entre letra/pontuação e dígito, garantindo que números fiquem
  // sempre isolados pra renderização separada.
  const normalized = text
    .replace(/(\d+)([a-zA-ZÀ-ÿ])/g, '$1 $2')
    .replace(/([a-zA-ZÀ-ÿ,;:.!?'])(\d+)/g, '$1 $2');

  // Split em chunks: dígitos vs resto
  const parts = normalized.split(/(\d+)/);

  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (/^\d+$/.test(part)) {
          return (
            <Text key={i} style={numberStyle}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
