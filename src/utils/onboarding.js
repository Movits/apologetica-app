import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'onboarding:done';
const INTENT_KEY = 'onboarding:startIntent';

export async function hasSeenOnboarding() {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingDone() {
  await AsyncStorage.setItem(KEY, 'true').catch(() => {});
}

// Guarda o diálogo escolhido na ativação (onboarding v2) para a Home abrir
// automaticamente no primeiro carregamento. O onboarding fica fora do tab
// navigator, por isso a intenção viaja por AsyncStorage em vez de params.
export async function setStartIntent(dialogueId) {
  if (!dialogueId) return;
  await AsyncStorage.setItem(INTENT_KEY, String(dialogueId)).catch(() => {});
}

// Lê e apaga a intenção (só dispara uma vez).
export async function consumeStartIntent() {
  try {
    const id = await AsyncStorage.getItem(INTENT_KEY);
    if (id) await AsyncStorage.removeItem(INTENT_KEY).catch(() => {});
    return id || null;
  } catch {
    return null;
  }
}
