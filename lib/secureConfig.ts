import * as SecureStore from 'expo-secure-store';

const KEYS = {
  SARVAM_API_KEY: 'vivid_sarvam_api_key',
  GROQ_API_KEY: 'vivid_groq_api_key',
  GEMINI_API_KEY: 'vivid_gemini_api_key',
};

export async function getApiKey(key: keyof typeof KEYS): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(KEYS[key]);
    if (stored) return stored;
    const envKey = `EXPO_PUBLIC_${key}` as keyof typeof process.env;
    const envValue = process.env[envKey] as string | undefined;
    if (envValue) {
      await SecureStore.setItemAsync(KEYS[key], envValue);
      return envValue;
    }
    return null;
  } catch (error) {
    console.error(`Failed to get API key ${key}:`, error);
    return null;
  }
}

export async function setApiKey(key: keyof typeof KEYS, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYS[key], value);
  } catch (error) {
    console.error(`Failed to set API key ${key}:`, error);
  }
}

export async function clearApiKeys(): Promise<void> {
  try {
    for (const storageKey of Object.values(KEYS)) {
      await SecureStore.deleteItemAsync(storageKey);
    }
  } catch (error) {
    console.error('Failed to clear API keys:', error);
  }
}
