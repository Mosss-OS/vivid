import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../lib/theme';
import { useKnowledgeStore } from '../../lib/store';
import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Brain } from 'lucide-react-native';

export default function KnowledgeMomentum() {
  const { isDark } = useTheme();
  const { items } = useKnowledgeStore();
  const [streak, setStreak] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  
  useEffect(() => {
    calculateStreak();
    calculateWeeklyCount();
  }, [items]);
  
  const calculateStreak = () => {
    if (items.length === 0) { setStreak(0); return; }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = items.map(item => {
      const d = new Date(item.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }).sort((a, b) => b - a);
    
    const uniqueDates = [...new Set(dates)];
    let currentStreak = 0;
    let checkDate = today;
    
    for (let i = 0; i < 365; i++) {
      if (uniqueDates.includes(checkDate.getTime())) {
        currentStreak++;
        checkDate = new Date(checkDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };
  
  const calculateWeeklyCount = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const count = items.filter(item => new Date(item.createdAt) >= weekAgo).length;
    setWeeklyCount(count);
  };
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 300 }}
      style={{
        backgroundColor: isDark ? 'rgba(45, 45, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <Text className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        KNOWLEDGE MOMENTUM
      </Text>
      
      <View className="flex-row justify-around">
        <View className="items-center">
          <View className={`w-16 h-16 rounded-full items-center justify-center ${streak > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
            <Flame size={32} color={streak > 0 ? '#f97316' : '#9ca3af'} />
          </View>
          <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {streak}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Day Streak
          </Text>
        </View>
        
        <View className="items-center">
          <View className={`w-16 h-16 rounded-full items-center justify-center ${weeklyCount > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <TrendingUp size={32} color={weeklyCount > 0 ? '#3b82f6' : '#9ca3af'} />
          </View>
          <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {weeklyCount}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            This Week
          </Text>
        </View>
        
        <View className="items-center">
          <View className={`w-16 h-16 rounded-full items-center justify-center ${items.length > 0 ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <Brain size={32} color={items.length > 0 ? '#8b5cf6' : '#9ca3af'} />
          </View>
          <Text className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {items.length}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Items
          </Text>
        </View>
      </View>
    </MotiView>
  );
}
