import "../global.css";
import "./css-interop-setup";
import { PrivyProvider, usePrivy } from '@privy-io/expo';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState, Component, ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../lib/theme';


// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ padding: 10, backgroundColor: '#007AFF', borderRadius: 8 }}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  const { user, isReady } = usePrivy();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await SecureStore.getItemAsync('vivid_onboarding_complete');
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
    <ErrorBoundary>
      <PrivyProvider
        appId="cmolgs0n2014f0dl80cgfiktw"
        clientId="client-WY6Yg8JUKm2EibrTm6RbbK8CLs9VLeb2nwCSSY36VRAoP"
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
    </ErrorBoundary>
  );
}
