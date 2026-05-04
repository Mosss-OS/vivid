import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { AIService } from '../lib/ai-service';
import { useKnowledgeStore } from '../lib/store';

export default function AIDailyInsightCard() {
  const [insight, setInsight] = useState('Generating your daily insight...');
  const [loading, setLoading] = useState(true);
  const { items } = useKnowledgeStore();

  useEffect(() => {
    const generateInsight = async () => {
      setLoading(true);
      try {
        // Generate insight based on user's knowledge items
        const itemsSummary = items.slice(0, 10).map(item => `${item.title}: ${item.content.substring(0, 100)}`).join('\n');
        const response = await AIService.chatWithKnowledge([
          { role: 'system', content: 'Generate a daily insight based on the user\'s recent captures. Keep it concise and actionable.' },
          { role: 'user', content: `Here are my recent captures:\n${itemsSummary}\n\nGenerate a daily insight.` }
        ]);
        setInsight(response.response);
      } catch (error) {
        console.error('Failed to generate insight:', error);
        setInsight('Keep capturing your thoughts! Your second brain is growing.');
      } finally {
        setLoading(false);
      }
    };

    if (items.length > 0) {
      generateInsight();
    } else {
      setInsight('Start capturing your thoughts to get daily AI insights!');
      setLoading(false);
    }
  }, [items]);

  if (loading) {
    return (
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <Text className="text-muted-foreground">Generating insight...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#007AFF10', // Blue with 10% opacity
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#007AFF30', // Blue with 30% opacity
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#007AFF20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ color: '#007AFF', fontWeight: '600' }}>AI</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, color: '#007AFF', marginBottom: 4 }}>
            Your Daily Insight
          </Text>
          <Text style={{ color: '#333', fontSize: 15, lineHeight: 20 }}>{insight}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}