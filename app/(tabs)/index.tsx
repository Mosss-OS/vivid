import { View, Text, FlatList, RefreshControl, SafeAreaView, useColorScheme } from 'react-native';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { AIDailyInsightCard } from '../components/AIDailyInsightCard';
import { KnowledgeMomentum } from '../components/KnowledgeMomentum';
import { SearchBar } from '../components/SearchBar';
import type { KnowledgeItem } from '../types/knowledge';
import { Plus, Mic, Image, FileText, Link2 } from 'lucide-react-native';
import { useKnowledgeStore, useTheme } from '../../lib/store';
import { useTheme as useAppTheme } from '../../lib/theme';
import { memo } from 'react';
import { getDemoItems, isDemoMode } from '../../lib/demo-data';
import LogoLoader from '../components/LogoLoader';

// Memoized Knowledge Card wrapper
const MemoizedKnowledgeCard = memo(({ item, onPress, isDark }: { item: KnowledgeItem; onPress: (item: KnowledgeItem) => void; isDark: boolean }) => (
  <KnowledgeCard item={item} onPress={() => onPress(item)} isDark={isDark} />
));

export default function HomeScreen() {
  const router = useRouter();
  const { items: knowledgeItems, loading, error, init, fetchItems, saveItems, backgroundSync } = useKnowledgeStore();
  const { isDark } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [demoItems] = useState<KnowledgeItem[]>(() => getDemoItems());

  // Initialize store on mount
  useEffect(() => {
    if (!isDemoMode()) {
      init();
    }
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
  const memoizedItems = useMemo(() => 
    isDemoMode() ? demoItems : knowledgeItems
  , [knowledgeItems, demoItems]);

  // Render loading or error states
  if (loading && knowledgeItems.length === 0 && !isDemoMode()) {
    return (
      <SafeAreaView style={{ backgroundColor: isDark ? '#1a1a2e' : '#ffffff' }}>
        <View className="flex-1 items-center justify-center">
          <LogoLoader size={120} />
          <Text className={`mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading your knowledge...
          </Text>
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
