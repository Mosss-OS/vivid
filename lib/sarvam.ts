const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY || '';

const headers = {
  'api-subscription-key': SARVAM_API_KEY,
  'Content-Type': 'application/json',
};

export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await fetch(`${SARVAM_BASE_URL}/language-detection`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input: text }),
    });
    const data = await response.json();
    return data.language_code || 'en-IN';
  } catch (error) {
    console.error('Sarvam language detection failed:', error);
    return 'en-IN';
  }
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    const response = await fetch(`${SARVAM_BASE_URL}/translate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: text,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        speaker_gender: 'Female',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true,
      }),
    });
    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error('Sarvam translation failed:', error);
    return text;
  }
}

export async function textToSpeech(
  text: string,
  languageCode: string
): Promise<string | null> {
  try {
    const response = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: [text],
        target_language_code: languageCode,
        speaker: 'meera',
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 8000,
        enable_preprocessing: true,
        model: 'bulbul:v1',
      }),
    });
    const data = await response.json();
    return data.audios?.[0] || null;
  } catch (error) {
    console.error('Sarvam TTS failed:', error);
    return null;
  }
}

const LANGUAGE_NAMES: Record<string, string> = {
  'hi-IN': 'हिंदी',
  'bn-IN': 'বাংলা',
  'gu-IN': 'ગુજરાતી',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'mr-IN': 'मराठी',
  'od-IN': 'ଓଡ଼ିଆ',
  'pa-IN': 'ਪੰਜਾਬੀ',
  'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు',
  'en-IN': 'English',
};

export function getLanguageDisplayName(code: string): string {
  return LANGUAGE_NAMES[code] || code;
}

export function isIndianLanguage(code: string): boolean {
  return code !== 'en-IN' && LANGUAGE_NAMES[code] !== undefined;
}
