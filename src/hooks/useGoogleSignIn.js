import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

// Web Client ID do Firebase (Authentication → Google → Configuração da Web).
const WEB_CLIENT_ID = '784268138897-l8jmdvhtncqvb3b3885u4m8bms12onpc.apps.googleusercontent.com';

export function useGoogleSignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) return;
      setBusy(true);
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .catch((e) => setError(e.message || 'Falha ao entrar com Google.'))
        .finally(() => setBusy(false));
    } else if (response?.type === 'error') {
      setError('Não foi possível autenticar com Google.');
    }
  }, [response]);

  const signIn = async () => {
    setError(null);
    try {
      await promptAsync();
    } catch (e) {
      setError(e.message || 'Erro ao abrir login do Google.');
    }
  };

  return { signIn, busy, error, ready: !!request };
}
