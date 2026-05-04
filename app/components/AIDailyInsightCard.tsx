import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

export default function AIDailyInsightCard() {
  const [insight, setInsight] = useState('Generating your daily insight...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-generated insight
    const generateInsight = async () => {
      setLoading(true);
      // In real app, this would call AI API
      setTimeout(() => {
        setInsight('Today you captured 7 ideas about React Native and 2 tasks. Your most productive time was between 2-4 PM.');
        setLoading(false);
      }, 1500);
    };

    generateInsight();
  }, []);

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