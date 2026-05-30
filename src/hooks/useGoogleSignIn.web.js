import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';

// Variante web do login com Google: usa o popup do Firebase (signInWithPopup),
// que é o fluxo correto no navegador. O Metro resolve este arquivo no lugar de
// useGoogleSignIn.js em builds web, mantendo o expo-auth-session fora do bundle.
//
// Requisito de configuração: o domínio do site (ex.: movits.github.io) precisa
// estar em Firebase Console -> Authentication -> Settings -> Authorized domains.
export function useGoogleSignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async () => {
    setError(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      // Usuário fechar o popup não é um erro que precise ser exibido.
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError(e?.message || 'Não foi possível autenticar com Google.');
      }
    } finally {
      setBusy(false);
    }
  };

  return {
    signIn,
    busy,
    error,
    ready: true,
    unavailable: false,
  };
}
