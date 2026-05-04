import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import type { KnowledgeItem } from '../types/knowledge';

type Props = {
  item: KnowledgeItem;
  onPress: () => void;
};

export default function KnowledgeCard({ item, onPress }: Props) {
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
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
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
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 4 }}>{item.title}</Text>
          <Text style={{ color: '#666', fontSize: 14, lineHeight: 20 }}>{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {item.tags.map((tag, index) => (
              <Text
                key={index}
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginRight: 8,
                  marginBottom: 4,
                  fontSize: 12,
                }}
              >
                #{tag}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}