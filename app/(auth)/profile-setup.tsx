import { View, Text, SafeAreaView, TextInput } from 'react-native';
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
        colors={['#667eea', '#764ba2']}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-8 justify-center">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 500 }}
            className="items-center mb-10"
          >
            <Text className="text-4xl font-bold text-white mb-2">Almost There!</Text>
            <Text className="text-lg text-white/80 text-center">
              Set up your profile to personalize your Vivid experience
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="space-y-4"
          >
            <View>
              <Text className="text-white/80 mb-2 ml-1">Display Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-white/20 rounded-xl px-4 py-4 text-white text-lg"
                autoFocus
              />
            </View>

            <View>
              <Text className="text-white/80 mb-2 ml-1">Bio (Optional)</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us a bit about yourself"
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-white/20 rounded-xl px-4 py-4 text-white text-lg"
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
              className={`w-full py-4 rounded-xl items-center ${
                name.trim() && !isLoading ? 'bg-white' : 'bg-white/40'
              }`}
            >
              <Text className={`text-lg font-semibold ${
                name.trim() ? 'text-purple-600' : 'text-white/60'
              }`}>
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Text>
            </TouchableOpacity>
          </MotiView>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="mt-4 items-center"
          >
            <Text className="text-white/40 text-sm">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
