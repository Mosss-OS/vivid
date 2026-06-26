import { View, Text, Platform, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Plus, Mic, Image, FileText, Link2 } from 'lucide-react-native';
import { useState } from 'react';

type CaptureOption = {
  label: string;
  icon: React.ComponentType<any>;
  type: string;
};

type Props = {
  onCapture: (type: string) => void;
  isDark: boolean;
};

const CAPTURE_OPTIONS: CaptureOption[] = [
  { label: 'Voice Note', icon: Mic, type: 'audio' },
  { label: 'Photo', icon: Image, type: 'image' },
  { label: 'Document', icon: FileText, type: 'document' },
  { label: 'Link', icon: Link2, type: 'link' },
];

export default function FloatingActionButton({ onCapture, isDark }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
      <Pressable onPress={toggleMenu}>
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
        >
          <Plus size={24} color="white" />
        </MotiView>
      </Pressable>

      {isOpen && (
        <View style={{ position: 'absolute', bottom: 80, right: 24 }}>
          {CAPTURE_OPTIONS.map((option, index) => (
            <Pressable key={option.label} onPress={() => { setIsOpen(false); onCapture(option.type); }}>
              <MotiView
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
              >
                <option.icon size={20} color="white" style={{ marginRight: 12 }} />
                <Text style={{ color: 'white', fontSize: 16 }}>{option.label}</Text>
              </MotiView>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}