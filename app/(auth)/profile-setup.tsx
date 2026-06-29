import { View, Text, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      await SecureStore.setItemAsync('vivid_user_name', name.trim());
      await SecureStore.setItemAsync('vivid_user_bio', bio.trim());
      await SecureStore.setItemAsync('vivid_profile_complete', 'true');
      router.push('/(tabs)');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 500 }}
              className="items-center mb-10"
            >
              <Text className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Almost There!</Text>
              <Text className="text-lg text-white/90 text-center px-4 font-medium">
                Set up your profile to personalize your Vivid experience
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              className="space-y-5"
            >
              <View>
                <Text className="text-white/90 mb-2 ml-1 font-medium">Display Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="bg-black/30 rounded-xl px-4 py-4 text-white text-lg border-2 border-white/20"
                  autoFocus
                />
              </View>

              <View>
                <Text className="text-white/90 mb-2 ml-1 font-medium">Bio (Optional)</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us a bit about yourself"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="bg-black/30 rounded-xl px-4 py-4 text-white text-lg border-2 border-white/20"
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80 }}
                />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 400 }}
              className="mt-8"
            >
              <TouchableOpacity
                onPress={handleComplete}
                disabled={!name.trim() || isLoading}
                className={`w-full py-4 rounded-xl items-center shadow-xl border-2 ${
                  name.trim() && !isLoading
                    ? 'bg-white border-white/30'
                    : 'bg-white/20 border-white/10'
                }`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text className={`text-lg font-bold ${
                  name.trim() ? 'text-indigo-900' : 'text-white/60'
                }`}>
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </Text>
              </TouchableOpacity>
            </MotiView>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="mt-6 items-center pb-4"
            >
              <Text className="text-white/70 text-sm font-medium">
                Skip for now
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
