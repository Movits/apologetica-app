// Uma pergunta de múltipla escolha não pode se entregar pelo tamanho: se a
// certa é quase sempre a opção mais longa (a mais "completa"), quem chuta a
// mais comprida acerta sem ter lido. Regras compartilhadas pelos testes das
// lições e do quiz (este arquivo não é teste, o node --test não o roda).

// A certa pode ser um pouco maior que a maior errada, nunca muito: até 25% ou
// até 8 caracteres a mais (a folga em caracteres protege as opções curtas,
// como "Três" contra "Uma").
export const LENGTH_SLACK = { ratio: 1.25, chars: 8 };

// No conjunto, a certa ser a mais longa (ou a mais curta) não pode passar
// muito do acaso: com 3 ou 4 opções o acaso fica entre 25% e 33%.
export const MAX_SHARE = 0.4;

const lengths = (options) => options.map((o) => o.length);

export function correctTooLong(options, correct) {
  // Sem opções não há o que medir: a falta é cobrada pelos testes de estrutura.
  if (!Array.isArray(options) || options.length < 2) return false;
  const len = lengths(options);
  const longestWrong = Math.max(...len.filter((_, i) => i !== correct));
  return len[correct] > Math.max(longestWrong * LENGTH_SLACK.ratio, longestWrong + LENGTH_SLACK.chars);
}

const share = (items, pick, test) => {
  const list = items.map((it) => ({ options: pick(it), correct: it.correct })).filter((it) => it.options);
  const hits = list.filter(({ options, correct }) => {
    const len = lengths(options);
    const others = len.filter((_, i) => i !== correct);
    return test(len[correct], others);
  }).length;
  return list.length ? hits / list.length : 0;
};

// Fração das perguntas em que a certa é estritamente a mais longa.
export const longestShare = (items, pick) => share(items, pick, (c, others) => c > Math.max(...others));
// Fração das perguntas em que a certa é estritamente a mais curta.
export const shortestShare = (items, pick) => share(items, pick, (c, others) => c < Math.min(...others));
