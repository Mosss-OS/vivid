import { View, TouchableOpacity, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Plus, Mic, Image, FileText, Link2, CopyCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

type CaptureOption = {
  label: string;
  icon: React.ComponentType<any>;
  route: string;
};

type Props = {
  options: CaptureOption[];
};

export default function FloatingActionButton({ options }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionPress = (route: string) => {
    toggleMenu();
    router.push(route);
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        ...(Platform.OS === 'android' && { elevation: 8 }),
        ...(Platform.OS === 'ios' && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }),
      }}
    >
      <MotiView
        whileTap={{ scale: 0.95 }}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#007AFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={toggleMenu}
      >
        {isOpen ? (
          <CopyCheck size={24} color="white" />
        ) : (
          <Plus size={24} color="white" />
        )}
      </MotiView>

      {isOpen && (
        <View style={{ position: 'absolute', bottom: 80, right: 24 }}>
          {options.map((option, index) => (
            <MotiView
              key={option.label}
              style={{
                marginBottom: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                ...(Platform.OS === 'android' && { elevation: 4 }),
                ...(Platform.OS === 'ios' && { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }),
              }}
              initial={{ x: 30 }}
              animate={{ x: 0 }}
              transition={{ delay: index * 0.05, type: 'spring' }}
              onPress={() => handleOptionPress(option.route)}
            >
              <option.icon size={20} color="white" style={{ marginRight: 12 }} />
              <Text style={{ color: 'white', fontSize: 16 }}>{option.label}</Text>
            </MotiView>
          ))}
        </View>
      )}
    </View>
  );
}