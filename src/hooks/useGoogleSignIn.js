import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

// Web Client ID do Firebase (Authentication → Google → Configuração da Web).
const WEB_CLIENT_ID = '784268138897-l8jmdvhtncqvb3b3885u4m8bms12onpc.apps.googleusercontent.com';

// Google bloqueia OAuth de Web Client IDs vindos de apps mobile (política de 2025+).
// Em Expo Go o redirect URI é um scheme custom (não-HTTPS) que o Google rejeita.
// A solução real é dev build com EAS (Android/iOS Client IDs nativos).
// Por enquanto detectamos Expo Go e desabilitamos o botão.
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

export function useGoogleSignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  // { email, pendingCred } quando já existe conta com aquele email (vincular).
  const [needsLink, setNeedsLink] = useState(null);

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
        .catch((e) => {
          if (e?.code === 'auth/account-exists-with-different-credential') {
            setNeedsLink({
              email: e?.customData?.email || '',
              pendingCred: GoogleAuthProvider.credentialFromError(e) || credential,
            });
          } else {
            setError(e.message || 'Falha ao entrar com Google.');
          }
        })
        .finally(() => setBusy(false));
    } else if (response?.type === 'error') {
      setError('Não foi possível autenticar com Google.');
    }
  }, [response]);

  const signIn = async () => {
    setError(null);
    setNeedsLink(null);
    if (IS_EXPO_GO) {
      setError('Login com Google só funciona em builds de produção. Use e-mail e senha por enquanto.');
      return;
    }
    try {
      await promptAsync();
    } catch (e) {
      setError(e.message || 'Erro ao abrir login do Google.');
    }
  };

  return {
    signIn,
    busy,
    error,
    needsLink,
    clearLink: () => setNeedsLink(null),
    ready: !!request && !IS_EXPO_GO,
    unavailable: IS_EXPO_GO,
  };
}
