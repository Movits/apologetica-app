import { Text } from 'react-native';

// Formata o texto das leituras da Missa destacando os números de versículo.
// A API retorna texto tipo "1Naquele tempo, Jesus disse... 2E todos..."
// Quebramos a string em pedaços de número e texto e renderizamos cada um
// com estilo diferente (número menor, em dourado).
export default function ReadingText({ text, style, numberStyle }) {
  if (!text) return null;

  // Insere espaço entre dígito e letra maiúscula pra garantir separação
  // (caso a API retorne tudo grudado).
  const normalized = text.replace(/(\d+)([A-ZÀ-Ý])/g, '$1 $2');

  // Split em chunks: dígitos vs resto
  const parts = normalized.split(/(\b\d+\b)/);

  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (/^\d+$/.test(part) && i > 0) {
          // É um número de versículo (não o primeiro caractere)
          return (
            <Text key={i} style={numberStyle}>
              {' '}{part}{' '}
            </Text>
          );
        }
        if (/^\d+$/.test(part) && i === 0) {
          // Número no início do texto (primeiro versículo)
          return (
            <Text key={i} style={numberStyle}>
              {part}{' '}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
