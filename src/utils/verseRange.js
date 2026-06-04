// Extrai o versículo final de um intervalo no mesmo capítulo a partir do texto da
// referência (PT "Mateus 3,13-17" ou EN "Matthew 3:13-17"). Usado para destacar
// todo o intervalo na Bíblia. Intervalos entre capítulos (travessão –) ou refs de
// verso único retornam undefined (aí destaca-se só o verso inicial).
export function verseEndFromRef(ref) {
  if (!ref) return undefined;
  const m = String(ref).match(/[,:]\s*\d+\s*-\s*(\d+)(?!\d)/);
  return m ? parseInt(m[1], 10) : undefined;
}
