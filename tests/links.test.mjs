import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bibleParams, openBible, openArticle } from '../src/navigation/links.js';

// Contrato lido pelo BibleScreen (src/screens/BibleScreen.jsx:133-134) e pelo
// ArticleDetailScreen (src/screens/ArticleDetailScreen.jsx:30, :60):
// { bookId, chapter, highlightVerse, highlightVerseEnd } e { articleId, ... }.
// O módulo precisa ser puro (sem react-native) para rodar aqui.

test('bibleParams converte verse em highlightVerse e omite o fim quando falta', () => {
  const params = bibleParams({ bookId: 'jo', chapter: 3, verse: 16 });
  assert.deepEqual(params, { bookId: 'jo', chapter: 3, highlightVerse: 16 });
  assert.equal('highlightVerseEnd' in params, false);
});

test('bibleParams inclui highlightVerseEnd quando há intervalo', () => {
  assert.deepEqual(bibleParams({ bookId: 'jo', chapter: 3, verse: 16, verseEnd: 18 }), {
    bookId: 'jo',
    chapter: 3,
    highlightVerse: 16,
    highlightVerseEnd: 18,
  });
});

test('bibleParams sem versículo devolve só livro e capítulo', () => {
  const params = bibleParams({ bookId: 'jo', chapter: 3 });
  assert.deepEqual(params, { bookId: 'jo', chapter: 3 });
  assert.equal('highlightVerse' in params, false);
  assert.equal('highlightVerseEnd' in params, false);
});

test('bibleParams(null) devolve null', () => {
  assert.equal(bibleParams(null), null);
  assert.equal(bibleParams(undefined), null);
});

// Um navigation falso só grava a chamada; o teste confere rota e params.
function fakeNavigation() {
  const calls = [];
  return { calls, navigate: (name, params) => calls.push({ name, params }) };
}

test('openBible navega para a aba Bíblia com o bibleNav da referência', () => {
  const navigation = fakeNavigation();
  openBible(navigation, { id: 'jo-3-16', bibleNav: { bookId: 'jo', chapter: 3, verse: 16, verseEnd: 17 } });
  assert.deepEqual(navigation.calls, [
    { name: 'Bíblia', params: { bookId: 'jo', chapter: 3, highlightVerse: 16, highlightVerseEnd: 17 } },
  ]);
});

test('openBible aceita o objeto de navegação direto e ignora referência sem bibleNav', () => {
  const navigation = fakeNavigation();
  openBible(navigation, { bookId: 'gn', chapter: 1 });
  openBible(navigation, null);
  openBible(navigation, { id: 'cic-309', url: 'https://example.org' });
  assert.deepEqual(navigation.calls, [{ name: 'Bíblia', params: { bookId: 'gn', chapter: 1 } }]);
});

test('openArticle navega para ArticleFromSearch com articleId e extras', () => {
  const navigation = fakeNavigation();
  openArticle(navigation, 83);
  openArticle(navigation, 12, { fromPlanDay: 3, fromPlanTrack: 'fundamentos' });
  assert.deepEqual(navigation.calls, [
    { name: 'ArticleFromSearch', params: { articleId: 83 } },
    { name: 'ArticleFromSearch', params: { articleId: 12, fromPlanDay: 3, fromPlanTrack: 'fundamentos' } },
  ]);
});
