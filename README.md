# Vivid - AI-Powered Second Brain Mobile App

Vivid is a beautiful, fast, and intelligent AI-powered Second Brain mobile app. Users capture thoughts, notes, voice memos, images, PDFs, and links — the AI automatically organizes everything, finds connections, and lets users chat naturally with their entire personal knowledge base.

## 📊 Development Phase: **Backend Integration & Local Database** (Phase 3 of 4)

We have successfully implemented all core UI screens and basic functionality. We have now integrated backend services (Supabase) and state management (Zustand) with local database persistence (Expo SQLite + Drizzle ORM) for offline-first capabilities.

**Phase Progress:**
- [x] Phase 1: Project Setup & Core Navigation
- [x] Phase 2: MVP Foundation Complete
- [x] Phase 3: Backend Integration & AI Enhancement (Local DB Complete, AI Chat Integration Complete, Auth Complete, Syncing Complete)
- [x] Phase 4: Polish, Advanced Features & Deployment (Onboarding Complete, Dark Mode Complete, Settings Complete, Task Management Complete, Graph View Complete, Production Ready)

## 🚀 Current Implementation Status

### ✅ Core Features Implemented

#### 1. Project Foundation
- React Native + Expo (latest version) with TypeScript
- Expo Router for file-based navigation
- Tab-based navigation (Home, Chat, Library, Settings)
- Privy authentication integration (configured with actual credentials)
- **Authentication flow implemented** (Email, Google, Apple login)
- **Onboarding flow with animations** ✅
- **Dark mode support with theme provider** ✅
- **Settings screen** with theme toggle, sync, and more ✅

#### 2. Home Screen
- Knowledge feed showing recent captures
- AI Daily Insight card with generated insights
- Search bar with basic functionality
- Floating Action Button with capture options:
   - Quick Text Note (functional with AI tagging)
  - Voice Memo (functional)
  - Photo/Image Capture (functional)
  - PDF/Document Upload (functional)
  - Link/Article Save (functional)
  - Task Reminders ✅ (mark as task, set reminder date)

#### 3. Capture Screens (All Functional)
- **Text Note**: Title and content input with AI-powered tagging and categorization
- **Voice Memo**: Recording with visual timer and audio capture
- **Image Capture**: Camera and gallery picker with preview
- **Document Capture**: File picker with type detection
- **Link/Article**: URL input with preview fetching simulation

#### 4. AI Chat Screen ✅ (Now with Real AI Integration)
- Dedicated chat interface with message history
- Voice input capability (microphone button)
- **Real AI integration with Groq (fallback to Gemini)**
- **RAG (Retrieval-Augmented Generation) using your knowledge base**
- **Citations and references to specific notes in responses**
- **Suggested follow-up questions**
- Real-time typing indicators
- Loading states and error handling

#### 5. Graph/Connections View ✅
- Visual network of knowledge connections
- Interactive nodes with emoji indicators
- Zoom in/out controls
- Node selection shows details
- Connections based on shared tags and content similarity

#### 5. Library Screen
- Organized views by type: All, Ideas, Tasks, Insights, Projects, People, References
- Favorite/bookmark functionality
- Item previews with type indicators and badges
- Stats dashboard showing totals and favorites

#### 6. Graph/Connections View ✅
- Visual network of knowledge connections
- Interactive nodes with emoji indicators
- Zoom in/out controls
- Node selection shows details
- Connections based on shared tags and content similarity

#### 6. Knowledge Item Detail View
- Full-screen view of captured items
- Action buttons (Share, Duplicate, Delete)
- Metadata display (type, date, tags)

#### 7. UI/UX Implementation
- Clean, minimalist design with soft dark/light mode readiness
- Smooth animations using Moti
- Beautiful typography and spacing
- Platform-appropriate styling (iOS/Android)
- Glassmorphism effects and subtle depth
- Micro-interactions and feedback
- Responsive layouts

### 🛠️ Tech Stack Implemented

- **Framework**: React Native + Expo (latest version)
- **Authentication**: Privy (configured with actual app ID and secret)
- **UI**: NativeWind (Tailwind) + Moti for animations
- **Navigation**: Expo Router (file-based)
- **State Management**: Zustand with persistence (implemented)
- **Local Database**: Expo SQLite + Drizzle ORM (client configured, schema defined, basic operations implemented)
- **Backend**: Supabase configured (client and schema ready, integration in progress)
- **AI Integration**: Groq and Gemini clients configured with fallback logic
- **Media**: Expo AV (audio), Expo ImagePicker, DocumentPicker
- **Icons**: Lucide React Native

## 📱 Project Structure

## 🖼️ App Icon and Splash Screen
- Updated app icon and splash screen using the provided Vivid logo
- Both icon and splash screen now use: https://res.cloudinary.com/dv0tt80vn/image/upload/v1777551455/vivid_cynifa.png

## 📱 Project Structure

```
vivid/
├── app/
│   ├── _layout.tsx           # Root layout with PrivyProvider
│   ├── (tabs)/               # Tab-based navigation
│   │   ├── _layout.tsx       # Tabs layout
│   │   ├── index.tsx         # Home screen
│   │   ├── chat/             # Chat screen
│   │   │   └── index.tsx
│   │   └── library/          # Library screen
│   │       └── index.tsx
│   ├── capture/              # Capture screens
│   │   ├── text/             # Text note capture
│   │   │   └── index.tsx
│   │   ├── voice/            # Voice memo capture
│   │   │   └── index.tsx
│   │   ├── image/            # Image capture
│   │   │   └── index.tsx
│   │   ├── document/         # Document capture
│   │   │   └── index.tsx
│   │   └── link/             # Link capture
│   │       └── index.tsx
│   ├── knowledge/            # Knowledge item detail
│   │   └── [id].tsx
│   ├── components/           # Shared components
│   │   ├── FloatingActionButton.tsx
│   │   ├── KnowledgeCard.tsx
│   │   ├── AIDailyInsightCard.tsx
│   │   └── SearchBar.tsx
│   └── types/                # TypeScript types
│       └── knowledge.ts
├── components/               # Additional components
├── assets/                   # Images, icons, etc.
├── README.md
├── package.json
├── TODO.md
└── tsconfig.json
```

## 🔧 Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create `.env` file with:
     ```
     EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
     ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## 🎯 Next Steps (High Priority)

See [TODO.md](TODO.md) for complete roadmap, but immediate priorities include:

1. **Backend Integration**
   - Set up Supabase for data persistence
   - Implement offline-first sync with Expo SQLite + Drizzle ORM
   - Replace useState with Zustand/TanStack Query for state management

2. **AI Features**
   - Integrate Groq API for smart tagging during capture
   - Implement RAG (Retrieval-Augmented Generation) for chat
   - Add structured outputs for consistent AI responses

3. **Persistence Layer**
   - Implement Drizzle ORM schemas for knowledge items
   - Create CRUD operations for all capture types
   - Add synchronization with Supabase when online

4. **Enhanced AI Chat**
   - Connect chat to actual AI API (Groq/Gemini/OpenAI)
   - Implement proper context management
   - Add citation/link referencing in responses

5. **Advanced Features**
   - Task management with reminders (Expo Notifications)
   - Habit/progress tracking
   - Graph/connections view
   - Daily AI-powered notifications
   - Export functionality

## 📱 Screenshots & Demo

### Demo Video Script
See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the complete 2-3 minute demo video script.

### App Store Assets
- **App Icon**: `assets/icon.png` (Vivid logo with gradient)
- **Splash Screen**: `assets/splash-icon.png`
- **Screenshots**: (To be taken during testing)

### Video Demo Structure (180 Seconds)
1. **Hook** (0:00-0:20): "Your notes, but smarter"
2. **Capture** (0:20-0:50): Text, voice, photo, document, link
3. **AI Chat** (0:50-1:30): THE KILLER FEATURE - Ask Vivid anything
4. **Graph View** (1:30-1:50): Visual connections
5. **Advanced** (1:50-2:10): Task reminders, dark mode
6. **Closing** (2:10-3:00): Call to action

**Record using**: Actual phone + screen recording for authenticity!

## 🤝 Contributing

This is a hackathon project. Feel free to fork and experiment!

## 📄 License

MIT