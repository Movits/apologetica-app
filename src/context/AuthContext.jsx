import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);
const GUEST_KEY = 'auth:guestMode';
const LANG_KEY = 'settings:language';

// Traduz códigos de erro do Firebase. Lê o idioma direto do AsyncStorage
// porque AuthContext não tem acesso ao LanguageContext (é provider acima).
const ERROR_MESSAGES = {
  pt: {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-not-found': 'Não encontrei uma conta com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/too-many-requests': 'Muitas tentativas. Tente de novo em alguns minutos.',
    default: 'Algo deu errado. Tente novamente.',
  },
  en: {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email.',
    'auth/user-not-found': 'I could not find an account with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/network-request-failed': 'No internet connection.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
    default: 'Something went wrong. Try again.',
  },
};

let _cachedLang = 'pt';
AsyncStorage.getItem(LANG_KEY).then((l) => { if (l === 'en' || l === 'pt') _cachedLang = l; }).catch(() => {});

// Permite que o LanguageContext mantenha esta cache em sincronia
// (Auth fica acima dele na árvore, então não pode usar useLanguage).
export function setAuthLanguage(lang) {
  if (lang === 'en' || lang === 'pt') _cachedLang = lang;
}

const errorMessage = (code) => {
  const map = ERROR_MESSAGES[_cachedLang] || ERROR_MESSAGES.pt;
  return map[code] || map.default;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    // Carrega preferencia de modo visitante (persistida).
    AsyncStorage.getItem(GUEST_KEY)
      .then((v) => setGuest(v === 'true'))
      .catch(() => {});

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Se logou, sai do modo visitante automaticamente.
        setGuest(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const continueAsGuest = async () => {
    setGuest(true);
    await AsyncStorage.setItem(GUEST_KEY, 'true').catch(() => {});
  };

  const exitGuest = async () => {
    setGuest(false);
    await AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
  };

  const signUp = async (email, password, displayName) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return { ok: true, user: cred.user };
    } catch (e) {
      return { ok: false, error: errorMessage(e.code) };
    }
  };

  const signIn = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { ok: true, user: cred.user };
    } catch (e) {
      return { ok: false, error: errorMessage(e.code) };
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setGuest(false);
    await AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e.code) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        guest,
        // Considera "passou da tela de login" se logou OU optou por visitante.
        signedInOrGuest: !!user || guest,
        continueAsGuest,
        exitGuest,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
