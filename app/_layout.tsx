import { PrivyProvider, usePrivy, useAuth } from '@privy-io/expo';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../lib/theme';

// Prevent auto-hiding of splash screen until we explicitly call hide
useEffect(() => {
  (async () => {
    await SplashScreen.hideAsync();
  })();
}, []);

function RootLayoutNav() {
  const { user, isReady } = usePrivy();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const checkOnboarding = async () => {
      try {
        const value = await localStorage.getItem('vivid_onboarding_complete');
        setHasSeenOnboarding(!!value);
      } catch {
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (!hasSeenOnboarding) {
        router.replace('/(auth)/welcome');
      } else if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isReady, user, hasSeenOnboarding, router]);

  // Show nothing while determining auth state
  if (!isReady || hasSeenOnboarding === null) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="capture/*" options={{ presentation: 'modal' }} />
      <Stack.Screen name="knowledge/*" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PrivyProvider
      appId="cmolgs0n2014f0dl80cgfiktw"
      loginMethods={{
        email: true,
        google: true,
        apple: true,
      }}
    >
      <ThemeProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PrivyProvider>
  );
}