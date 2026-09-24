// Nome do dia litúrgico no idioma da interface (Fase 5). A API da CNBB só fala
// português ("Quinta-feira da 25ª semana do Tempo Comum"); em inglês o título
// é o dia da semana mais o número da semana, quando existe, e o tempo
// litúrgico (`season`, da lista da USCCB) quando a tela o tem.
//
// Junta as duas versões que existiam. Com `season`, vale a regra de
// LiturgyScreen ("Thursday, Week 25 of Ordinary Time" / "Thursday,
// Christmas"); sem `season`, a de LiturgyCard ("Thursday, week 25" /
// "Thursday"). A única diferença para o que havia: a tela, sem o tempo da
// USCCB (rede falhou), mostrava só o dia da semana mesmo tendo a semana; agora
// mostra a semana como o card sempre fez. Módulo puro (sem AsyncStorage,
// diferente de liturgyApi.js), coberto por tests/liturgyTitle.test.mjs;
// `date` existe para o teste fixar o dia.
const WEEK_RE = /(\d+)[aª°]?\s*semana/i;

export function liturgyTitle(liturgy, isEn, season, date = new Date()) {
  if (!isEn) return liturgy?.liturgia;
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const wm = liturgy?.liturgia?.match(WEEK_RE);
  const week = wm ? wm[1] : null;
  if (season && week) return `${day}, Week ${week} of ${season}`;
  if (season) return `${day}, ${season}`;
  return week ? `${day}, week ${week}` : day;
}
