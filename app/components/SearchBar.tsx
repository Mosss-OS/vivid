import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { AIService } from '../../lib/ai-service';

type Props = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder = 'Search your knowledge...' }: Props) {
  const [query, setQuery] = useState('');
  const [isNaturalLanguage, setIsNaturalLanguage] = useState(false);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    // Check if this is a natural language query
    if (trimmed.split(' ').length > 3) {
      setIsNaturalLanguage(true);
      try {
        const result = await AIService.generateChatResponse(trimmed, []);
        onSearch(result.response);
      } catch (error) {
        console.error('Failed to process natural language query:', error);
        onSearch(trimmed);
      } finally {
        setIsNaturalLanguage(false);
      }
    } else {
      onSearch(trimmed);
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isNaturalLanguage ? '#007AFF10' : '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20 }}>
      <TouchableOpacity style={{ padding: 8 }} onPress={handleSubmit}>
        <Search size={20} color={isNaturalLanguage ? '#007AFF' : '#666'} />
      </TouchableOpacity>
      <TextInput
        style={{ flex: 1, fontSize: 16, color: '#333' }}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onSubmitEditing={handleSubmit}
      />
      {query.trim() !== '' && (
        <TouchableOpacity onPress={() => {
          setQuery('');
          onSearch('');
        }} style={{ padding: 8 }}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}