import { View, Text, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePrivy, useLogin } from '@privy-io/expo';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, User as UserIcon, Mail, Smartphone } from 'lucide-react-native';
import type { UserProfile } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const { user, isReady, logout } = usePrivy();
  const { login } = useLogin();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, check profile completion
    if (isReady && user) {
      checkProfileAndRedirect();
    }
  }, [isReady, user, router]);

  const checkProfileAndRedirect = async () => {
    try {
      const profileComplete = await SecureStore.getItemAsync('vivid_profile_complete');
      if (profileComplete === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/profile-setup');
      }
    } catch (error) {
      console.error('Failed to check profile:', error);
      router.replace('/(auth)/profile-setup');
    }
  };

  const handleLogin = async (method: 'email' | 'google' | 'apple') => {
    setLoading(true);
    try {
      if (method === 'email') {
        // For email, we'll show a prompt or use Privy's email login
        // In a real app, you might want a custom email input
        await login({ loginMethod: 'email' });
      } else if (method === 'google') {
        await login({ loginMethod: 'google' });
      } else if (method === 'apple') {
        await login({ loginMethod: 'apple' });
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If user is logged in, show user profile
  if (user) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center p-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4">
              <UserIcon size={48} color="#007AFF" />
            </View>
            <Text className="text-2xl font-bold">Welcome back!</Text>
            <Text className="text-muted-foreground mt-2">
              {user.email || user.wallet?.address || 'User'}
            </Text>
          </View>

          <View className="w-full max-w-sm">
            <TouchableOpacity
              onPress={handleLogout}
              className="w-full bg-red-500 text-white py-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center p-6">
          {/* Logo */}
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 1000 }}
            className="items-center mb-8"
          >
            <View className="w-32 h-32 rounded-3xl bg-white/20 items-center justify-center mb-4">
              <Text className="text-6xl font-bold text-white">V</Text>
            </View>
            <Text className="text-4xl font-bold text-white">Vivid</Text>
            <Text className="text-lg text-white/80 mt-2 text-center">
              Your AI-Powered Second Brain
            </Text>
          </MotiView>

          {/* Login Options */}
          <View className="w-full max-w-sm">
            <Text className="text-white/80 text-center mb-6">
              Sign in to access your knowledge base
            </Text>

            {/* Email Login */}
            <TouchableOpacity
              onPress={() => handleLogin('email')}
              disabled={loading}
              className="w-full bg-white py-4 rounded-xl flex-row items-center justify-center mb-4"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Mail size={20} color="#007AFF" />
              <Text className="text-primary font-semibold ml-3">Continue with Email</Text>
            </TouchableOpacity>

            {/* Google Login */}
            <TouchableOpacity
              onPress={() => handleLogin('google')}
              disabled={loading}
              className="w-full bg-white py-4 rounded-xl flex-row items-center justify-center mb-4"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text className="text-lg mr-3">G</Text>
              <Text className="text-gray-700 font-semibold">Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Login */}
            <TouchableOpacity
              onPress={() => handleLogin('apple')}
              disabled={loading}
              className="w-full bg-black py-4 rounded-xl flex-row items-center justify-center mb-8"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text className="text-white font-semibold">Continue with Apple</Text>
            </TouchableOpacity>

            {loading && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="items-center"
              >
                <Text className="text-white/80">Connecting...</Text>
              </MotiView>
            )}
          </View>

          {/* Footer */}
          <View className="absolute bottom-8 items-center">
            <Text className="text-white/60 text-sm text-center px-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
