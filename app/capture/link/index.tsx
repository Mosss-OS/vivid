import { View, Text, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Link2, Check, Edit } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as WebBrowser from 'expo-web-browser';

export default function CaptureLinkScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    // In a real app, save to local database and sync with Supabase
    // For now, we'll simulate saving
    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 1000);
  };

  const fetchLinkPreview = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // In a real app, you would use a service like link-preview or make a request to extract metadata
      // For demo purposes, we'll simulate fetching preview data
      setTimeout(() => {
        // Simulate preview data
        setTitle(`Article about ${url.split('/')[2] || 'topic'}`);
        setDescription('This is a preview of the linked content. In a real app, this would be extracted from the webpage.');
        setPreviewImage('https://via.placeholder.com/300x200');
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to fetch link preview:', error);
      setLoading(false);
      // Even if preview fails, we can still save the link
      setTitle(url);
      setDescription('Link saved without preview');
    }
  };

  return (
    <SafeAreaView>
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold">Save Link</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!url.trim() || !title.trim() || saving}
            className="p-2 rounded-full"
            style={{
              backgroundColor: (!url.trim() || !title.trim() || saving) ? '#ccc' : '#007AFF',
              width: 56,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {saving ? (
              <MotiView
                style={{ width: 20, height: 20, borderRadius: 50, borderWidth: 2, borderColor: 'white' }}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1000, repeat: Infinity }}
              />
            ) : (
              <Check size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* URL Input */}
        <View className="mb-4">
          <Text className="font-medium mb-2">URL</Text>
          <View className="flex-row">
            <TextInput
              style={{ flex: 1, marginRight: 8, fontSize: 16 }}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com/article"
              autoFocus
              returnKeyType="go"
              onSubmitEditing={fetchLinkPreview}
            />
            <TouchableOpacity
              onPress={fetchLinkPreview}
              disabled={loading}
              className="p-2 rounded-full"
              style={{
                backgroundColor: loading ? '#ccc' : '#007AFF',
              }}
            >
              {loading ? (
                <MotiView
                  style={{ width: 16, height: 16, borderRadius: 50, borderWidth: 2, borderColor: 'white' }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1000, repeat: Infinity }}
                />
              ) : (
                <Link2 size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Link Preview */}
        {title || description || previewImage && (
          <View className="mb-6 p-4 bg-gray-50 rounded-lg">
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={{ width: '100%', height: 150, borderRadius: 8 }}
                resizeMode="cover"
              />
            )}
            <View className="mt-3">
              {title && (
                <Text className="font-bold text-lg">{title}</Text>
              )}
              {description && (
                <Text className="text-sm text-muted-foreground mt-1">{description}</Text>
              )}
              <View className="mt-2">
                <Text className="text-xs text-muted-foreground">{url}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Title and Description Inputs (shown after preview or manually) */}
        {!previewImage && (
          <>
            <View className="mb-4">
              <Text className="font-medium mb-2">Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter a title for this link"
                className="border-b-2 border-gray-300 pb-2"
              />
            </View>

            <View className="mb-4">
              <Text className="font-medium mb-2">Description (optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description or notes about this link"
                className="border-b-2 border-gray-300 pb-2"
                multiline
                minHeight={60}
              />
            </View>
          </>
        )}

        {/* Manual Preview Button (if auto-preview failed or wasn't triggered) */}
        {!previewImage && url && (
          <TouchableOpacity
            onPress={fetchLinkPreview}
            className="w-full bg-gray-50 py-3 rounded-lg flex items-center justify-center"
          >
            {loading ? (
              <Text>Fetching preview...</Text>
            ) : (
              <Text>Get Preview</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}