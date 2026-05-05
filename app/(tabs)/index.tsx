import { View, Text, FlatList, RefreshControl, SafeAreaView, useColorScheme } from 'react-native';
import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FloatingActionButton } from './components/FloatingActionButton';
import { KnowledgeCard } from './components/KnowledgeCard';
import { AIDailyInsightCard } from './components/AIDailyInsightCard';
import { KnowledgeMomentum } from './components/KnowledgeMomentum';
import { SearchBar } from './components/SearchBar';
import type { KnowledgeItem } from './types/knowledge';
import { Plus, Mic, Image, FileText, Link2 } from 'lucide-react-native';
import { useKnowledgeStore, useTheme } from '../../lib/store';
import { useTheme as useAppTheme } from '../../lib/theme';
import { memo } from 'react';

// Memoized Knowledge Card wrapper
const MemoizedKnowledgeCard = memo(({ item, onPress, isDark }: { item: KnowledgeItem; onPress: (item: KnowledgeItem) => void; isDark: boolean }) => (
  <KnowledgeCard item={item} onPress={() => onPress(item)} isDark={isDark} />
));

export default function HomeScreen() {
  const router = useRouter();
  const { items: knowledgeItems, loading, error, init, fetchItems, saveItems, backgroundSync } = useKnowledgeStore();
  const { isDark } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    init();
  }, [init]);

  // Background sync when app comes to foreground
  useEffect(() => {
    const interval = setInterval(() => {
      backgroundSync();
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(interval);
  }, [backgroundSync]);

  // Fetch knowledge items periodically or when needed
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchItems();
      // Save after fetch to ensure local DB is updated
      await saveItems();
    } finally {
      setRefreshing(false);
    }
  }, [fetchItems, saveItems]);

  const handleItemPress = useCallback((item: KnowledgeItem) => {
    router.push(`/knowledge/${item.id}`);
  }, [router]);

  const handleSearch = useCallback((query: string) => {
    router.push(`/search?q=${query}`);
  }, [router]);

  const handleCapture = useCallback((type: string) => {
    router.push(`/capture/${type}`);
  }, [router]);

  // Memoize FlatList data
  const memoizedItems = useMemo(() => knowledgeItems, [knowledgeItems]);

  // Render loading or error states
  if (loading && knowledgeItems.length === 0) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Text>Loading your knowledge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-destructive">{error}</Text>
          <Button title="Retry" onPress={init} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#1a1a2e' : '#ffffff' }}>
      <View className={`p-4 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
        <SearchBar onSearch={handleSearch} />
        <AIDailyInsightCard />
        <KnowledgeMomentum />
        <FlatList
          data={memoizedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemoizedKnowledgeCard item={item} onPress={handleItemPress} isDark={isDark} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className={isDark ? 'text-dark-muted' : 'text-muted-foreground'}>No captures yet. Tap the + button to start!</Text>
            </View>
          }
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              progressBackgroundColor={isDark ? '#1a1a2e' : '#ffffff'}
            />
          }
          contentContainerClassName="pb-12"
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      </View>
      <FloatingActionButton 
        onCapture={handleCapture}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
  };

  const handleItemPress = (item: KnowledgeItem) => {
    router.push(`/knowledge/${item.id}`);
  };

  // Render loading or error states
  if (loading && knowledgeItems.length === 0) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Text>Loading your knowledge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-destructive">{error}</Text>
          <Button title="Retry" onPress={init} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#1a1a2e' : '#ffffff' }}>
      <View className={`p-4 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
        <SearchBar onSearch={(query) => router.push(`/search?q=${query}`)} />
        <AIDailyInsightCard />
        <KnowledgeMomentum />
        <FlatList
          data={knowledgeItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <KnowledgeCard item={item} onPress={() => handleItemPress(item)} isDark={isDark} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className={isDark ? 'text-dark-muted' : 'text-muted-foreground'}>No captures yet. Tap the + button to start!</Text>
            </View>
          }
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              progressBackgroundColor={isDark ? '#1a1a2e' : '#ffffff'}
            />
          }
          contentContainerClassName="pb-12"
        />
      </View>
      <FloatingActionButton 
        options={[
          { label: 'Text Note', icon: Plus, route: '/capture/text' },
          { label: 'Voice Memo', icon: Mic, route: '/capture/voice' },
          { label: 'Photo/Image', icon: Image, route: '/capture/image' },
          { label: 'PDF/Document', icon: FileText, route: '/capture/document' },
          { label: 'Link/Article', icon: Link2, route: '/capture/link' },
        ]} 
        isDark={isDark}
      />
    </SafeAreaView>
  );
}