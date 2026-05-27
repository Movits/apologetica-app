import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'onboarding:done';

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
