import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

const userCol = (sub) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');
  return collection(db, 'users', uid, sub);
};

// ============ HIGHLIGHTS ============
// { bookId, chapter, verse, color, createdAt }
// Cada marcação é em um versículo específico. Várias marcações = vários docs.

export async function addHighlight({ bookId, chapter, verse, color }) {
  return addDoc(userCol('highlights'), {
    bookId,
    chapter,
    verse,
    color,
    createdAt: serverTimestamp(),
  });
}

export async function removeHighlight(highlightId) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');
  return deleteDoc(doc(db, 'users', uid, 'highlights', highlightId));
}

// Observa todas as marcações do usuário em tempo real. Retorna unsubscribe.
export function watchHighlights(callback) {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const q = query(userCol('highlights'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// Observa apenas as marcações de um capítulo específico (para o BibleScreen).
export function watchChapterHighlights(bookId, chapter, callback) {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const q = query(
    userCol('highlights'),
    where('bookId', '==', bookId),
    where('chapter', '==', chapter)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// ============ NOTAS ============
// { bookId, chapter, verseStart, verseEnd, text, createdAt, updatedAt }

export async function addNote({ bookId, chapter, verseStart, verseEnd, text }) {
  return addDoc(userCol('notes'), {
    bookId,
    chapter,
    verseStart,
    verseEnd: verseEnd ?? verseStart,
    text,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNote(noteId, text) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');
  return updateDoc(doc(db, 'users', uid, 'notes', noteId), {
    text,
    updatedAt: serverTimestamp(),
  });
}

export async function removeNote(noteId) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');
  return deleteDoc(doc(db, 'users', uid, 'notes', noteId));
}

export function watchNotes(callback) {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const q = query(userCol('notes'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export function watchChapterNotes(bookId, chapter, callback) {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const q = query(
    userCol('notes'),
    where('bookId', '==', bookId),
    where('chapter', '==', chapter)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}
