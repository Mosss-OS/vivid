import { View, Text, FlatList, SafeAreaView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Folder, Text as TextIcon, List, Star, TrendingUp, Users } from 'lucide-react-native';
import type { KnowledgeItem } from '../../types/knowledge';
import { useKnowledgeStore } from '../../../lib/store';

export default function LibraryScreen() {
  const router = useRouter();
  const { items: knowledgeItems } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState<'all' | 'ideas' | 'tasks' | 'insights' | 'projects' | 'people' | 'references' | 'folders'>('all');
  const [folders, setFolders] = useState<Array<{ id: string; name: string; itemIds: string[] }>>([
    { id: '1', name: 'Work', itemIds: [] },
    { id: '2', name: 'Personal', itemIds: [] },
    { id: '3', name: 'References', itemIds: [] }
  ]);
  const [localItems, setLocalItems] = useState<KnowledgeItem[]>(knowledgeItems);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Mock data for demo - in real app, this would come from local DB
  useEffect(() => {
    const loadKnowledgeItems = async () => {
      setLocalItems([
        {
          id: '1',
          title: 'React Native Performance Tips',
          content: 'Learned about useMemo and useCallback optimizations for large lists...',
          type: 'insight',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          tags: ['React Native', 'Performance'],
          isFavorite: true,
        },
        {
          id: '2',
          title: 'Meeting with Design Team',
          content: 'Discussed new onboarding flow for Vivid app...',
          type: 'task',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          tags: ['Meeting', 'Design'],
        },
        {
          id: '3',
          title: 'Voice Memo: Project Ideas',
          content: 'Audio note about potential features for next sprint...',
          type: 'idea',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['Voice', 'Ideas'],
          audioUrl: 'https://example.com/audio.m4a',
          isFavorite: false,
        },
        {
          id: '4',
          title: 'Project: Vivid App Redesign',
          content: 'Redesigning the onboarding flow to be more intuitive...',
          type: 'project',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['Vivid', 'Design', 'Project'],
          isFavorite: true,
        },
        {
          id: '5',
          title: 'Person: Alex Johnson',
          content: 'Product designer at startup, met at React Native conference...',
          type: 'person',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ['Designer', 'Contact'],
          isFavorite: false,
        },
        {
          id: '6',
          title: 'Reference: React Native Documentation',
          content: 'Official React Native documentation for performance optimization...',
          type: 'reference',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['Documentation', 'React Native'],
          linkUrl: 'https://reactnative.dev/docs/performance',
          isFavorite: false,
        },
      ]);
    };

    loadKnowledgeItems();
  }, []);

  const filteredItems = localItems.filter(
    (item) => {
      if (activeTab === 'folders' && selectedFolder) {
        const folder = folders.find(f => f.id === selectedFolder);
        return folder?.itemIds.includes(item.id) || false;
      }
      return activeTab === 'all' || item.type === activeTab;
    }
  );

  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case 'all': return 'All';
      case 'idea': return 'Ideas';
      case 'task': return 'Tasks';
      case 'insight': return 'Insights';
      case 'project': return 'Projects';
      case 'person': return 'People';
      case 'reference': return 'References';
      default: return 'All';
    }
  };

  const getTabIcon = (tab: typeof activeTab) => {
    switch (tab) {
      case 'all': return <List size={20} color="#666" />;
      case 'idea': return <TrendingUp size={20} color="#666" />;
      case 'task': return <Star size={20} color="#666" />;
      case 'insight': return <TextIcon size={20} color="#666" />;
      case 'project': return <Folder size={20} color="#666" />;
      case 'person': return <Users size={20} color="#666" />;
      case 'reference': return <TextIcon size={20} color="#666" />;
      default: return <List size={20} color="#666" />;
    }
  };

  return (
    <SafeAreaView>
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold">Library</Text>
          <View className="flex-row space-x-2">
            {/* Favorite filter */}
            <TouchableOpacity 
              className="p-2 rounded-full hover:bg-gray-100"
              onPress={() => {
                // Toggle favorite filter
              }}
            >
              <Star size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="mb-6">
          <View className="flex-row space-x-4 overflow-x-auto pb-2">
            {['all', 'idea', 'task', 'insight', 'project', 'person', 'reference', 'folders'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  setActiveTab(tab as typeof activeTab);
                  if (tab !== 'folders') setSelectedFolder(null);
                }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === tab 
                    ? 'bg-primary/20 text-primary font-medium' 
                    : 'text-muted-foreground'
                }`}
              >
                {getTabIcon(tab)}
                <Text className="ml-1 text-sm">{getTabLabel(tab)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Folders View */}
        {activeTab === 'folders' && (
          <View className="mb-6">
            <View className="flex-row flex-wrap gap-3 mb-4">
              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  onPress={() => setSelectedFolder(folder.id)}
                  className={`px-4 py-3 rounded-lg ${
                    selectedFolder === folder.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text className={selectedFolder === folder.id ? 'text-white' : 'text-gray-700'}>
                    📁 {folder.name} ({folder.itemIds.length})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Add New Folder */}
            <View className="flex-row items-center">
              <TextInput
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="New folder name..."
                className="flex-1 border-b border-gray-300 pb-1"
                onSubmitEditing={() => {
                  if (newFolderName.trim()) {
                    setFolders([...folders, {
                      id: Date.now().toString(),
                      name: newFolderName.trim(),
                      itemIds: []
                    }]);
                    setNewFolderName('');
                  }
                }}
              />
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="flex-row space-x-6 mb-6 text-sm text-muted-foreground">
          <Text>📊 {localItems.length} Total Items</Text>
          <Text>⭐ {localItems.filter(item => item.isFavorite).length} Favorites</Text>
        </View>

        {/* List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              className="bg-white rounded-lg p-4 mb-4"
              style={{
                ...(Platform.OS === 'android' && { elevation: 2 }),
                ...(Platform.OS === 'ios' && { 
                  shadowColor: '#000', 
                  shadowOffset: { width: 0, height: 1 }, 
                  shadowOpacity: 0.1, 
                  shadowRadius: 2 
                }),
              }}
            >
              <View className="flex-row items-start mb-2">
                {/* Type badge */}
                <View
                  className={`flex items-center justify-center rounded-full w-8 h-8 mr-3 ${
                    item.type === 'insight' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'idea' ? 'bg-purple-100 text-purple-600' :
                    item.type === 'task' ? 'bg-green-100 text-green-600' :
                    item.type === 'project' ? 'bg-orange-100 text-orange-600' :
                    item.type === 'person' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.type.charAt(0).toUpperCase()}
                </View>

                <View className="flex-1">
                  <Text className="font-medium">{item.title}</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {item.tags.map(tag => `#${tag}`).join(' ')}
                  </Text>
                  <Text className="text-sm mt-1 line-clamp-2">
                    {item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}
                  </Text>
                  
                  {item.audioUrl || item.imageUrl || item.pdfUrl || item.linkUrl && (
                    <View className="flex-row space-x-2 mt-2">
                      {item.audioUrl && (
                        <View className="flex items-center bg-gray-50 px-2 py-1 rounded text-xs">
                          <Text>🎵</Text>
                          <Text>Audio</Text>
                        </View>
                      )}
                      {item.imageUrl && (
                        <View className="flex items-center bg-gray-50 px-2 py-1 rounded text-xs">
                          <Text>🖼️</Text>
                          <Text>Image</Text>
                        </View>
                      )}
                      {item.pdfUrl && (
                        <View className="flex items-center bg-gray-50 px-2 py-1 rounded text-xs">
                          <Text>📄</Text>
                          <Text>PDF</Text>
                        </View>
                      )}
                      {item.linkUrl && (
                        <View className="flex items-center bg-gray-50 px-2 py-1 rounded text-xs">
                          <Text>🔗</Text>
                          <Text>Link</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Favorite button */}
                <TouchableOpacity
                  className="p-2"
                  onPress={() => {
                    // Toggle favorite
                  }}
                >
                  <Star 
                    size={18} 
                    color={item.isFavorite ? '#FFD700' : '#ddd'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-muted-foreground">No items in this category yet.</Text>
            </View>
          }
          contentContainerClassName="pb-12"
        />
      </View>
    </SafeAreaView>
  );
}