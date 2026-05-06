import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'vivid_onboarding_complete';

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function completeOnboarding(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Failed to save onboarding state:', error);
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
  }
}

export const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Vivid',
    description: 'Your AI-powered knowledge companion. Capture anything, ask anything.',
    icon: 'sparkles',
  },
  {
    id: 'capture',
    title: 'Capture Anything',
    description: 'Tap the + button to capture text, voice, images, PDFs, or links.',
    icon: 'plus',
  },
  {
    id: 'ai-chat',
    title: 'Ask Vivid',
    description: 'Chat with your knowledge base. Ask questions, get insights, extract tasks.',
    icon: 'message',
  },
  {
    id: 'insights',
    title: 'Daily Insights',
    description: 'Get AI-generated insights from your knowledge every day.',
    icon: 'lightbulb',
  },
  {
    id: 'search',
    title: 'Smart Search',
    description: 'Search using natural language. Vivid understands what you mean.',
    icon: 'search',
  },
];
