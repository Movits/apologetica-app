// Histórico do quiz diário, guardado em AsyncStorage como
// { 'AAAA-MM-DD': { id, correct } }. Módulo puro (testes em
// tests/quizHistory.test.mjs): a tela lê o JSON, chama recordDailyAnswer e grava.
//
// A chave era a data em UTC (toISOString) e passou a ser a data local
// (todayKey). No Brasil, depois das 21h, o UTC já é o dia seguinte: quem
// respondeu ontem à noite ficou com a resposta de ontem gravada sob a chave de
// hoje. Como a pergunta do dia muda todo dia, o caso é reconhecível: a entrada
// de hoje é de outra pergunta e a de ontem está vazia. Então a entrada antiga
// vai para ontem antes de gravar a de hoje, e o streak segue contando de onde
// estava. Se ontem já tem resposta, não há como decidir e a de hoje é só
// sobrescrita. Nunca muta o objeto recebido.
export function recordDailyAnswer(hist, { today, yesterday, id, correct }) {
  const next = { ...(hist || {}) };
  const prev = next[today];
  if (prev && prev.id !== id && !next[yesterday]) next[yesterday] = prev;
  next[today] = { id, correct };
  return next;
}
