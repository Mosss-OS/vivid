# Vivid — HACKHAZARDS '26 Hackathon Push Prompt
> Feed this entire prompt to your AI agent developer as a single instruction block.

---

## Context: What Vivid Is

Vivid is an AI-powered "Second Brain" mobile app built with:
- **React Native + Expo** (latest, with Expo Router file-based navigation)
- **TypeScript** throughout
- **NativeWind (Tailwind)** + **Moti** for UI/animations
- **Zustand** for state management with persistence
- **Expo SQLite + Drizzle ORM** for offline-first local database
- **Supabase** for backend/auth sync
- **Groq** (primary) + **Gemini** (fallback) for AI
- **Privy** for authentication (email, Google, Apple)
- **RAG** implementation for AI chat over the user's knowledge base

Current status: All 4 phases complete per README. Core features working — capture (text, voice, image, document, link), AI chat with RAG, graph/connections view, library, settings, dark mode, onboarding, task management.

---

## Hackathon Targets

Vivid is being submitted to **HACKHAZARDS '26** under two partner tracks:

1. **Expo Track** — Build Mobile Apps with Expo
2. **Sarvam Track** — Build AI Applications with Sarvam AI (https://www.sarvam.ai)

Sarvam AI is India's sovereign AI platform with APIs for:
- **Speech-to-text** across 22 Indian languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, etc.)
- **Text-to-speech** in Indian languages
- **Translation** between Indian languages and English
- **Transliteration**
- **Language detection**
- Sarvam API base URL: `https://api.sarvam.ai`
- Docs: `https://docs.sarvam.ai`

---

## The Winning Narrative to Build Toward

**"The first multilingual Second Brain for India — capture thoughts in any Indian language, search and chat with your knowledge base in your mother tongue."**

Right now Vivid only works in English. After these changes, a user in Maharashtra can speak a voice note in Marathi, and later ask their AI assistant questions in Marathi — and get answers drawn from their own notes. No existing second-brain app (Notion, Obsidian, Mem.ai, Reflect) does this.

---

## Priority 1: Sarvam Voice Integration (HIGHEST IMPACT)

### Task: Replace/augment the voice capture flow with Sarvam STT

**File to modify:** `app/capture/voice/index.tsx`

**What to do:**
1. After the user records a voice memo using Expo AV, send the audio file to Sarvam's speech-to-text API (`POST https://api.sarvam.ai/speech-to-text`) instead of (or alongside) any existing transcription logic.
2. Add a **language selector UI** on the voice capture screen — a horizontal pill row with options: Auto-detect, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi. Default to "Auto-detect".
3. The Sarvam STT response returns a transcript. Store this transcript as the `content` field of the captured knowledge item, alongside the audio file reference.
4. Add a `detectedLanguage` field to the knowledge item schema (Drizzle ORM) and store what Sarvam detects.
5. Show the transcript on screen after transcription with a "Edit before saving" option.

**Sarvam STT API call:**
```typescript
const formData = new FormData();
formData.append('file', {
  uri: audioUri,
  type: 'audio/wav', // or m4a depending on Expo AV output
  name: 'voice_memo.wav',
} as any);
formData.append('language_code', selectedLanguage); // e.g. 'hi-IN', 'ta-IN', or 'unknown' for auto
formData.append('model', 'saarika:v2');

const response = await fetch('https://api.sarvam.ai/speech-to-text', {
  method: 'POST',
  headers: {
    'api-subscription-key': process.env.EXPO_PUBLIC_SARVAM_API_KEY,
  },
  body: formData,
});
const data = await response.json();
// data.transcript contains the transcribed text
// data.language_code contains the detected language
```

Add `EXPO_PUBLIC_SARVAM_API_KEY` to `.env`.

---

## Priority 2: Multilingual AI Chat via Sarvam

### Task: Make the AI chat screen understand and respond in the user's language

**File to modify:** `app/(tabs)/chat/index.tsx` and the AI service layer (wherever Groq/Gemini calls are made, likely in `lib/`)

**What to do:**
1. Before sending the user's chat message to Groq/Gemini for RAG-based answering, call Sarvam's **language detection** API to detect what language the user typed/spoke in.
2. If the message is in a non-English Indian language, call Sarvam's **translation API** to translate the query to English before passing it to the RAG pipeline.
3. Get the English RAG answer from Groq/Gemini as usual.
4. If the original query was non-English, call Sarvam's **translation API** again to translate the AI response back to the user's detected language before displaying it.
5. Show a small language badge on each message bubble (e.g. "हिंदी" or "Tamil") so the user can see the detected language.

**Translation API call:**
```typescript
const translateResponse = await fetch('https://api.sarvam.ai/translate', {
  method: 'POST',
  headers: {
    'api-subscription-key': process.env.EXPO_PUBLIC_SARVAM_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: userMessage,
    source_language_code: detectedLang, // e.g. 'hi-IN'
    target_language_code: 'en-IN',
    speaker_gender: 'Female',
    mode: 'formal',
    model: 'mayura:v1',
    enable_preprocessing: true,
  }),
});
const { translated_text } = await translateResponse.json();
```

---

## Priority 3: Sarvam Text-to-Speech for AI Responses

### Task: Add a "Listen" button on AI chat responses that reads them aloud using Sarvam TTS

**File to modify:** `app/(tabs)/chat/index.tsx`

**What to do:**
1. Add a small speaker icon button on each AI assistant message bubble.
2. On tap, call Sarvam's TTS API with the message text and the detected/selected language.
3. Play the returned audio using `expo-av`.

**TTS API call:**
```typescript
const ttsResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
  method: 'POST',
  headers: {
    'api-subscription-key': process.env.EXPO_PUBLIC_SARVAM_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: [aiResponseText],
    target_language_code: userLanguageCode, // e.g. 'hi-IN'
    speaker: 'meera', // or 'pavithra', 'arvind' etc.
    pitch: 0,
    pace: 1.0,
    loudness: 1.5,
    speech_sample_rate: 8000,
    enable_preprocessing: true,
    model: 'bulbul:v1',
  }),
});
const { audios } = await ttsResponse.json();
// audios[0] is base64-encoded WAV — decode and play with expo-av
```

---

## Priority 4: Expo Track Polish (Judge-facing improvements)

These make the Expo track submission strong and demonstrate deep Expo usage:

### 4a. Expo Notifications for Daily AI Insights
**File:** Create `lib/notifications.ts`
- Use `expo-notifications` to schedule a daily push notification at 8am
- The notification content should be pulled from the AI Daily Insight card logic already on the home screen
- On notification tap, deep-link directly to the AI chat screen with a pre-filled prompt: "What should I focus on today based on my notes?"

### 4b. Expo Sharing for Knowledge Export
**File:** Modify knowledge item detail screen `app/knowledge/[id].tsx`
- Add a Share button using `expo-sharing` that lets users export a knowledge item as a formatted `.txt` or `.md` file
- Use `expo-file-system` to write the file temporarily, then `expo-sharing` to share it

### 4c. Expo Haptics on key interactions
- Add `expo-haptics` light impact on: note saved, voice recording started/stopped, AI response received
- Import: `import * as Haptics from 'expo-haptics'`

### 4d. Expo Secure Store for API keys
- Move `SARVAM_API_KEY` and `GROQ_API_KEY` storage to `expo-secure-store` so keys aren't exposed in AsyncStorage
- Create `lib/secureConfig.ts` that wraps secure storage reads

---

## Priority 5: Graph View — Connect to Real Relationship Data

**File:** Wherever the graph/connections view is implemented (likely `app/(tabs)` or a dedicated screen)

**What to do:**
1. The current graph view uses "connections based on shared tags and content similarity" — make this real, not simulated.
2. When a knowledge item is saved, extract its tags (already done by AI during capture). Store tag relationships in the Drizzle ORM schema as a separate `knowledge_connections` table with `(source_id, target_id, connection_type, strength)`.
3. Query this table when rendering the graph — nodes are knowledge items, edges are shared tags or semantic similarity scores.
4. Add a filter pill row above the graph: All | Ideas | Tasks | People | References — tapping filters which node types are visible.

---

## Priority 6: Hackathon Submission Polish

### 6a. Add a "Built for HACKHAZARDS '26" splash on the onboarding screen
- Small badge in the onboarding: "🏆 Built for HACKHAZARDS '26 · Expo + Sarvam AI Track"

### 6b. Demo mode / seed data
- Create a `lib/seedDemoData.ts` that populates the app with 8-10 realistic sample knowledge items in mixed languages (English, Hindi, Tamil) so judges can immediately see the multilingual capability without having to capture anything themselves.
- Add a "Load Demo Data" button in Settings, clearly labeled "For demo/judging purposes"

### 6c. README update
- Update README.md with: hackathon context, Sarvam integration section, setup instructions for `EXPO_PUBLIC_SARVAM_API_KEY`, and a "Why Vivid wins" section explaining the multilingual second brain angle.

---

## Environment Variables to Add

```bash
# .env additions
EXPO_PUBLIC_SARVAM_API_KEY=your_sarvam_api_key_here
```

Get the Sarvam API key by signing up at: https://dashboard.sarvam.ai

---

## Language Code Reference (Sarvam)

| Language | Code |
|---|---|
| Hindi | hi-IN |
| Bengali | bn-IN |
| Gujarati | gu-IN |
| Kannada | kn-IN |
| Malayalam | ml-IN |
| Marathi | mr-IN |
| Odia | od-IN |
| Punjabi | pa-IN |
| Tamil | ta-IN |
| Telugu | te-IN |
| English (India) | en-IN |
| Auto-detect | unknown |

---

## Do NOT Change

- Do not change the authentication flow (Privy is working)
- Do not change the Supabase schema unless adding `detected_language` column to the knowledge items table
- Do not change the navigation structure (Expo Router tabs are correct)
- Do not replace Groq/Gemini — Sarvam is added ON TOP as the language layer, not a replacement for the core LLM
- Do not touch the existing Drizzle ORM schema except to ADD new fields/tables

---

## Definition of Done

The app is submission-ready when:
- [ ] Voice capture transcribes using Sarvam STT with language selection UI
- [ ] AI chat translates non-English queries to English, gets RAG answer, translates response back
- [ ] TTS "Listen" button works on AI responses in the user's language
- [ ] Daily push notification schedules correctly on device
- [ ] Demo seed data loads 10 items including Hindi/Tamil content
- [ ] README reflects the full Sarvam + Expo story
- [ ] App builds and runs on both iOS and Android via Expo Go or EAS build

