import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { usePrivy, useLoginWithOAuth, useLoginWithEmail } from '@privy-io/expo';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, User as UserIcon, Smartphone, Mail, ArrowLeft } from 'lucide-react-native';
import type { UserProfile } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const { user, isReady, logout } = usePrivy();
  const { login: googleLogin, state: googleState } = useLoginWithOAuth({ provider: 'google' });
  const { login: appleLogin, state: appleState } = useLoginWithOAuth({ provider: 'apple' });
  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail();
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      checkProfileAndRedirect();
    }
  }, [isReady, user, router]);

  useEffect(() => {
    if (emailState.status === 'done') {
      setLoading(false);
    }
    if (emailState.status === 'sending-code') {
      setEmailSent(true);
    }
    if (emailState.status === 'error') {
      setLoading(false);
      Alert.alert('Error', emailState.error?.message || 'Something went wrong');
    }
  }, [emailState]);

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

  const handleLogin = async (method: 'google' | 'apple') => {
    setLoading(true);
    try {
      if (method === 'google') {
        await googleLogin({ provider: 'google' });
      } else if (method === 'apple') {
        await appleLogin({ provider: 'apple' });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', error?.message || 'Could not complete login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await sendCode({ email: email.trim().toLowerCase() });
    } catch (error: any) {
      console.error('Send code failed:', error);
      Alert.alert('Error', error?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otp.trim()) {
      Alert.alert('Missing Code', 'Please enter the verification code sent to your email');
      return;
    }
    setLoading(true);
    try {
      await loginWithCode({ code: otp.trim(), email: email.trim().toLowerCase() });
    } catch (error: any) {
      console.error('Verify code failed:', error);
      Alert.alert('Invalid Code', error?.message || 'The code you entered is invalid or expired');
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

  const resetEmailForm = () => {
    setShowEmailForm(false);
    setEmailSent(false);
    setEmail('');
    setOtp('');
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
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={{ flex: 1 }}
      >
        <View className="absolute inset-0 bg-black/20" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 1000 }}
              className="items-center mb-6"
            >
              <Image
                source={require('../../assets/vivid-splash.png')}
                className="w-44 h-32 mb-3"
                resizeMode="contain"
              />
              <Text className="text-lg text-white/90 mt-3 text-center font-medium px-4">
                Your AI-Powered Second Brain
              </Text>
            </MotiView>

            {!showEmailForm ? (
              <View className="w-full max-w-sm">
                <Text className="text-white/90 text-center mb-6 text-base font-medium">
                  Sign in to access your knowledge base
                </Text>

                {/* Email Login */}
                <TouchableOpacity
                  onPress={() => setShowEmailForm(true)}
                  disabled={loading}
                  className="w-full bg-white/10 py-4 rounded-xl flex-row items-center justify-center mb-4 border-2 border-white/20"
                >
                  <View className="w-8 h-8 rounded-full bg-indigo-500 items-center justify-center mr-3">
                    <Mail size={18} color="white" />
                  </View>
                  <Text className="text-white font-bold text-base">Continue with Email</Text>
                </TouchableOpacity>

                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-px bg-white/20" />
                  <Text className="text-white/50 mx-4 text-sm font-medium">or</Text>
                  <View className="flex-1 h-px bg-white/20" />
                </View>

                {/* Google Login */}
                <TouchableOpacity
                  onPress={() => handleLogin('google')}
                  disabled={loading}
                  className="w-full bg-white py-4 rounded-xl flex-row items-center justify-center mb-3 shadow-xl border-2 border-white/30"
                  style={{
                    opacity: loading ? 0.7 : 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-3">
                    <Text className="text-white text-sm font-bold">G</Text>
                  </View>
                  <Text className="text-gray-800 font-bold text-base">Continue with Google</Text>
                </TouchableOpacity>

                {/* Apple Login */}
                <TouchableOpacity
                  onPress={() => handleLogin('apple')}
                  disabled={loading}
                  className="w-full bg-black py-4 rounded-xl flex-row items-center justify-center shadow-xl border-2 border-white/20"
                  style={{
                    opacity: loading ? 0.7 : 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                    <Text className="text-white text-sm font-bold"></Text>
                  </View>
                  <Text className="text-white font-bold text-base">Continue with Apple</Text>
                </TouchableOpacity>

                {loading && (
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="items-center mt-4"
                  >
                    <View className="flex-row items-center bg-white/10 rounded-xl px-6 py-3">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-white font-medium ml-2">Connecting...</Text>
                    </View>
                  </MotiView>
                )}
              </View>
            ) : (
              /* Email Auth Form */
              <View className="w-full max-w-sm">
                <TouchableOpacity onPress={resetEmailForm} className="mb-4 self-start">
                  <View className="flex-row items-center">
                    <ArrowLeft size={20} color="rgba(255,255,255,0.7)" />
                    <Text className="text-white/70 ml-2 font-medium">Back</Text>
                  </View>
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-white mb-2">
                  {emailSent ? 'Check your email' : 'Sign in with email'}
                </Text>
                <Text className="text-white/70 mb-6 text-base">
                  {emailSent
                    ? `Enter the verification code sent to ${email}`
                    : 'Enter your email address to receive a verification code'}
                </Text>

                {!emailSent ? (
                  <>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      className="bg-black/30 rounded-xl px-4 py-4 text-white text-lg border-2 border-white/20 mb-4"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={handleSendEmailCode}
                      disabled={loading}
                      className="w-full bg-white py-4 rounded-xl items-center shadow-xl border-2 border-white/30"
                      style={{
                        opacity: loading ? 0.7 : 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#302b63" size="small" />
                      ) : (
                        <Text className="text-indigo-900 font-bold text-base">Send Code</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TextInput
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      className="bg-black/30 rounded-xl px-4 py-4 text-white text-lg border-2 border-white/20 mb-4 text-center tracking-widest"
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={handleVerifyCode}
                      disabled={loading}
                      className="w-full bg-white py-4 rounded-xl items-center shadow-xl border-2 border-white/30"
                      style={{
                        opacity: loading ? 0.7 : 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#302b63" size="small" />
                      ) : (
                        <Text className="text-indigo-900 font-bold text-base">Verify Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSendEmailCode}
                      disabled={loading}
                      className="mt-4 items-center"
                    >
                      <Text className="text-white/60 text-sm">Resend code</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Footer */}
            <View className="items-center px-6 pt-8 pb-4">
              <Text className="text-white/70 text-sm text-center leading-relaxed">
                By continuing, you agree to our{' '}
                <Text className="text-white font-bold underline">Terms of Service</Text> and{' '}
                <Text className="text-white font-bold underline">Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
