import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import type { KnowledgeItem } from '../types/knowledge';

export default function KnowledgeDetailScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [sharing, setSharing] = useState(false);

  const knowledgeItem: KnowledgeItem = {
    id: '1',
    title: 'React Native Performance Tips',
    content: 'Learned about useMemo and useCallback optimizations for large lists. Also discovered that using FlatList with removeClippedSubviews can significantly improve performance for long lists.',
    type: 'insight',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['React Native', 'Performance'],
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const mdContent = `# ${knowledgeItem.title}

**Type:** ${knowledgeItem.type}
**Date:** ${new Date(knowledgeItem.createdAt).toLocaleDateString()}
**Tags:** ${knowledgeItem.tags.join(', ')}

---

${knowledgeItem.content}

---

*Exported from Vivid - AI-Powered Second Brain*
`;

      const fileUri = `${FileSystem.cacheDirectory}${knowledgeItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
      await FileSystem.writeAsStringAsync(fileUri, mdContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/markdown',
          dialogTitle: 'Share Knowledge Item',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share failed', 'Failed to share this item. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView>
      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-lg">←</Text>
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold">{knowledgeItem.title}</Text>
        </View>

        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-muted-foreground text-sm mb-2">
            {knowledgeItem.type} • {new Date(knowledgeItem.createdAt).toLocaleDateString()}
          </Text>
          <Text className="text-gray-800">{knowledgeItem.content}</Text>

          {knowledgeItem.tags.length > 0 && (
            <View className="flex flex-wrap mt-2">
              {knowledgeItem.tags.map((tag, index) => (
                <Text
                  key={index}
                  className="bg-primary/10 text-primary rounded px-2 py-1 text-xs mr-2 mb-1"
                >
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View className="bg-white rounded-lg p-4">
          <Text className="text-lg font-semibold mb-2">Actions</Text>
          <View className="space-y-2">
            <TouchableOpacity
              onPress={handleShare}
              disabled={sharing}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
            >
              <Text className="text-gray-600">
                {sharing ? 'Sharing...' : 'Share'}
              </Text>
              {sharing ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text className="text-primary">→</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-600">Duplicate</Text>
              <Text className="text-primary">→</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-600">Delete</Text>
              <Text className="text-destructive">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
