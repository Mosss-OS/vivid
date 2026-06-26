import { View, Text, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Brain, Sparkles, Zap } from 'lucide-react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const onboardingSteps = [
  {
    id: 1,
    icon: Brain,
    title: 'Your Second Brain',
    description: 'Capture thoughts, notes, voice memos, and more. Vivid organizes everything automatically.',
    color: '#667eea',
  },
  {
    id: 2,
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Ask questions about your knowledge. Vivid finds connections and surfaces insights.',
    color: '#764ba2',
  },
  {
    id: 3,
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Works offline. Syncs when online. Always available when you need it.',
    color: '#f093fb',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Mark onboarding as complete and navigate to login
       await SecureStore.setItemAsync('vivid_onboarding_complete', 'true');
       router.push('/(auth)/login');
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[step.color, '#1a1a2e']}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center px-8">
          {/* Hackathon Badge */}
          <View className="absolute top-12 left-0 right-0 items-center">
            <View className="bg-yellow-400/20 px-4 py-1 rounded-full border border-yellow-400/40">
              <Text className="text-yellow-300 text-xs font-medium">
                🏆 Built for HACKHAZARDS '26 · Expo + Sarvam AI Track
              </Text>
            </View>
          </View>

          {/* Progress Dots */}
          <View className="flex-row absolute top-24">
            {onboardingSteps.map((_, index) => (
              <MotiView
                key={index}
                className="w-2 h-2 rounded-full mx-1"
                style={{
                  backgroundColor: index === currentStep ? 'white' : 'rgba(255,255,255,0.5)',
                }}
                animate={{ scale: index === currentStep ? 1.2 : 1 }}
              />
            ))}
          </View>

          {/* Icon */}
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: isAnimating ? 0 : 1, 
              scale: isAnimating ? 0.5 : 1 
            }}
            transition={{ type: 'spring', duration: 500 }}
            className="w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-8"
          >
            <step.icon size={64} color="white" />
          </MotiView>

          {/* Title */}
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ 
              opacity: isAnimating ? 0 : 1, 
              translateY: isAnimating ? 20 : 0 
            }}
            transition={{ delay: 100 }}
            className="text-4xl font-bold text-white mb-4 text-center"
          >
            {step.title}
          </MotiText>

          {/* Description */}
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ 
              opacity: isAnimating ? 0 : 1, 
              translateY: isAnimating ? 20 : 0 
            }}
            transition={{ delay: 200 }}
            className="text-lg text-white/80 text-center mb-12 leading-relaxed"
          >
            {step.description}
          </MotiText>

          {/* Features List */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: isAnimating ? 0 : 1 }}
            transition={{ delay: 300 }}
            className="w-full max-w-sm"
          >
            {currentStep === 0 && (
              <View className="space-y-3">
                <FeatureItem icon="📝" text="Text notes & ideas" />
                <FeatureItem icon="🎙️" text="Voice memos" />
                <FeatureItem icon="📷" text="Photos & images" />
                <FeatureItem icon="📄" text="PDFs & documents" />
                <FeatureItem icon="🔗" text="Links & articles" />
              </View>
            )}
            {currentStep === 1 && (
              <View className="space-y-3">
                <FeatureItem icon="🤖" text="AI auto-tagging" />
                <FeatureItem icon="💬" text="Chat with your knowledge" />
                <FeatureItem icon="🔍" text="Natural language search" />
                <FeatureItem icon="📊" text="Daily AI insights" />
              </View>
            )}
            {currentStep === 2 && (
              <View className="space-y-3">
                <FeatureItem icon="📱" text="Works offline" />
                <FeatureItem icon="🔄" text="Background sync" />
                <FeatureItem icon="🔒" text="Secure & private" />
                <FeatureItem icon="⚡" text="Instant capture" />
              </View>
            )}
          </MotiView>
        </View>

        {/* Bottom Actions */}
        <View className="px-8 pb-8">
          <MotiView
            whileTap={{ scale: 0.95 }}
          >
            <TouchableOpacity
              onPress={handleNext}
              className="w-full bg-white py-4 rounded-xl flex-row items-center justify-center"
            >
              <Text className="text-lg font-semibold" style={{ color: step.color }}>
                {currentStep < onboardingSteps.length - 1 ? 'Continue' : 'Get Started'}
              </Text>
              <ChevronRight size={20} color={step.color} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </MotiView>

          {currentStep > 0 && (
            <TouchableOpacity
              onPress={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentStep(currentStep - 1);
                  setIsAnimating(false);
                }, 300);
              }}
              className="mt-4 items-center"
            >
              <Text className="text-white/60">Back</Text>
            </TouchableOpacity>
          )}

          {/* Skip to Login */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="mt-6 items-center"
          >
            <Text className="text-white/40 text-sm">Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center bg-white/10 rounded-lg p-3">
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className="text-white text-base">{text}</Text>
    </View>
  );
}
