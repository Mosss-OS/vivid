import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter, useParams } from 'expo-router';
import { useKnowledgeStore } from '../lib/store';
import type { KnowledgeItem } from '../types/knowledge';

export default function KnowledgeDetailScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { items, updateItem } = useKnowledgeStore();
  const [newTag, setNewTag] = useState('');
  
  // Get item from store
  const knowledgeItem = items.find(item => item.id === id) || {
    id: '1',
    title: 'React Native Performance Tips',
    content: 'Learned about useMemo and useCallback optimizations for large lists. Also discovered that using FlatList with removeClippedSubviews can significantly improve performance for long lists.',
    type: 'insight',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['React Native', 'Performance'],
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const updatedTags = [...knowledgeItem.tags, newTag.trim()];
    updateItem(id, { tags: updatedTags });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = knowledgeItem.tags.filter(tag => tag !== tagToRemove);
    updateItem(id, { tags: updatedTags });
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
                <TouchableOpacity 
                  key={index}
                  onPress={() => removeTag(tag)}
                  className="bg-primary/10 text-primary rounded px-2 py-1 text-xs mr-2 mb-1 flex-row items-center"
                >
                  <Text>#{tag}</Text>
                  <Text className="ml-1 text-red-500">×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Add New Tag */}
          <View className="flex-row items-center mt-2">
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag..."
              className="flex-1 border-b border-gray-300 pb-1"
              onSubmitEditing={addTag}
            />
            <TouchableOpacity onPress={addTag} className="ml-2 px-3 py-1 bg-primary rounded">
              <Text className="text-white text-sm">Add</Text>
            </TouchableOpacity>
          </View>
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