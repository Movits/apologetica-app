import { articles } from './articles';
import { setReferencesEn } from './references';

// Traduções em inglês dos artigos e das referências, carregadas sob demanda.
//
// Por quê: articles-en.js e references-en.js somam ~680 KB e iam no script
// principal da web, que o navegador baixa e interpreta antes de mostrar a
// primeira tela, mesmo para quem lê só em português. Com import() o Metro as
// separa num pedaço próprio na web (como as Bíblias, ver bibleApi.js); no
// nativo o import() é resolvido em tempo de build e nada muda.
//
// Quem troca o idioma para inglês (LanguageContext) espera ensureEnglish()
// antes de virar a chave, então as telas já leem os campos *En prontos. Os
// índices de busca que dependem do inglês são montados na primeira vez que a
// tela precisa deles (ArticlesScreen, ReferencesScreen, SearchScreen,
// ReferencePickerModal), nunca no carregamento do módulo.
let loaded = false;
let pending = null;

export function isEnglishLoaded() {
  return loaded;
}

// Mescla os campos *En nos próprios objetos de `articles` (mesma referência
// em todo o app) e entrega a tabela das referências ao references.js.
function apply(articlesEn, referencesEn) {
  for (const a of articles) {
    const tr = articlesEn[a.id];
    if (!tr) continue;
    a.titleEn = tr.titleEn;
    a.summaryEn = tr.summaryEn;
    a.bodyEn = tr.bodyEn;
  }
  setReferencesEn(referencesEn);
  loaded = true;
}

export function ensureEnglish() {
  if (loaded) return Promise.resolve();
  if (!pending) {
    pending = Promise.all([import('./articles-en'), import('./references-en')])
      .then(([a, r]) => apply(a.ARTICLES_EN, r.referencesEn))
      .catch((e) => {
        pending = null;
        throw e;
      });
  }
  return pending;
}
