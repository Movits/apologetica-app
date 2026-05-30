// Inicialização do Firebase para o projeto appologetica7.
// Chaves do client-side são públicas por design - a segurança vem das
// regras do Firestore (ver firestore.rules na raiz do repo).

import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB4m4-KPZ36woRBZVA-ku-pi6ZR1e8u_FQ',
  authDomain: 'appologetica7.firebaseapp.com',
  projectId: 'appologetica7',
  storageBucket: 'appologetica7.firebasestorage.app',
  messagingSenderId: '784268138897',
  appId: '1:784268138897:web:01ac558075d2556711a230',
};

const app = initializeApp(firebaseConfig);

// Persistência por plataforma:
//   - web: IndexedDB (fallback localStorage) — mantém o login após recarregar a página.
//   - nativo: AsyncStorage via getReactNativePersistence.
// Sem isso a web cairia em persistência de memória (perderia o login no refresh),
// quebrando a sincronização com a conta.
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web'
    ? [indexedDBLocalPersistence, browserLocalPersistence]
    : (typeof getReactNativePersistence === 'function'
        ? getReactNativePersistence(AsyncStorage)
        : undefined),
  // Na web, initializeAuth não inclui o resolver de popup por padrão; sem ele
  // signInWithPopup lança auth/argument-error. No nativo é ignorado.
  ...(Platform.OS === 'web' ? { popupRedirectResolver: browserPopupRedirectResolver } : {}),
});

export const db = getFirestore(app);
