// Inicialização do Firebase para o projeto appologetica7.
// Chaves do client-side são públicas por design - a segurança vem das
// regras do Firestore (ver firestore.rules na raiz do repo).

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
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

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
