import { View, Text, SafeAreaView, Platform } from 'react-native';
import { useRouter, useParams } from 'expo-router';
import type { KnowledgeItem } from '../types/knowledge';

export default function KnowledgeDetailScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  
  // Mock data - in real app, fetch from database
  const knowledgeItem: KnowledgeItem = {
    id: '1',
    title: 'React Native Performance Tips',
    content: 'Learned about useMemo and useCallback optimizations for large lists. Also discovered that using FlatList with removeClippedSubviews can significantly improve performance for long lists.',
    type: 'insight',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['React Native', 'Performance'],
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
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
            >
              <Text className="text-gray-600">Share</Text>
              <Text className="text-primary">→</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
            >
              <Text className="text-gray-600">Duplicate</Text>
              <Text className="text-primary">→</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
            >
              <Text className="text-gray-600">Delete</Text>
              <Text className="text-destructive">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}