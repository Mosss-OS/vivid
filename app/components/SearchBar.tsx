import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import type { ReactNode } from 'react';

type Props = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder = 'Search your knowledge...' }: Props) {
  const [query, setQuery] = React.useState('');

  const handleSubmit = () => {
    onSearch(query.trim());
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20 }}>
      <TouchableOpacity style={{ padding: 8 }}>
        <Search size={20} color="#666" />
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