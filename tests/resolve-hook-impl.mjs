// O app importa sem extensão (o Metro resolve `./foo` para foo.js, foo.jsx ou
// foo/index.js). O Node exige extensão em ESM, então este hook tenta os
// sufixos do Metro quando a resolução padrão falha em um specifier relativo.
const SUFFIXES = ['.js', '.jsx', '.mjs', '/index.js'];
const RETRY_CODES = new Set(['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT']);
const isRelative = (s) => s.startsWith('./') || s.startsWith('../');

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (!RETRY_CODES.has(err?.code) || !isRelative(specifier)) throw err;
    for (const suffix of SUFFIXES) {
      try {
        return await next(specifier + suffix, context);
      } catch {
        // tenta o próximo sufixo
      }
    }
    throw err;
  }
}
