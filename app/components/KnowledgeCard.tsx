import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { MotiView } from 'moti';
import type { KnowledgeItem } from '../types/knowledge';

type Props = {
  item: KnowledgeItem;
  onPress: () => void;
  isDark?: boolean;
};

export default function KnowledgeCard({ item, onPress, isDark = false }: Props) {
  const getTypeColor = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'idea': return '#FF6B6B';
      case 'task': return '#4ECDC4';
      case 'insight': return '#45B7D1';
      case 'project': return '#96CEB4';
      case 'person': return '#FFEAA7';
      case 'reference': return '#DDA0DD';
      default: return '#BDC3C7';
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: isDark ? '#2d2d44' : '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          ...(Platform.OS === 'android' && { elevation: 3 }),
          ...(Platform.OS === 'ios' && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: getTypeColor(item.type) + '20', // 20% opacity
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            {/* Type icon - placeholder */}
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                backgroundColor: getTypeColor(item.type),
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 4, color: isDark ? '#f5f5f0' : '#1a1a2e' }}>{item.title}</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#666', fontSize: 14, lineHeight: 20 }}>{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {item.tags.map((tag, index) => (
                <Text
                  key={index}
                  style={{
                    backgroundColor: isDark ? '#374151' : '#f0f0f0',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 8,
                    marginBottom: 4,
                    fontSize: 12,
                    color: isDark ? '#f5f5f0' : '#1a1a2e',
                  }}
                >
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}