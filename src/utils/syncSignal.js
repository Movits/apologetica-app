// Aviso de "este progresso mudou no aparelho", sem dependência nenhuma.
// Os módulos que gravam progresso (favoritos, jornada, Bíblia...) chamam
// markProgressDirty depois de gravar; src/services/progressSync.js registra o
// tratador e manda para a conta. Fica separado para esses módulos não
// importarem o Firebase (e para não haver import circular com a jornada).
//
// `overwrite: true` é para quando a pessoa zera algo de propósito: o que
// estava na conta é substituído em vez de juntado, senão o outro aparelho
// devolveria o que foi apagado.
let handler = null;

export function setProgressDirtyHandler(fn) {
  handler = fn;
}

export function markProgressDirty(id, opts) {
  try { handler?.(id, opts || {}); } catch {}
}
