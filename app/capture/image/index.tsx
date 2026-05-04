import { View, Text, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Check, Image as ImageIcon, Edit } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function CaptureImageScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      // Auto-generate title from filename or prompt user
      const fileName = result.assets[0].uri.split('/').pop()?.split('.')[0] || 'Image';
      setTitle(fileName);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      // Auto-generate title
      setTitle(`Photo ${new Date().toLocaleTimeString()}`);
    }
  };

  const handleSave = async () => {
    if (!imageUri) {
      alert('Please select or take a photo');
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

  return (
    <SafeAreaView>
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold">Image Capture</Text>
           <TouchableOpacity
             onPress={handleSave}
             disabled={!imageUri || saving}
             className="p-2 rounded-full"
             style={{
               backgroundColor: !imageUri || saving ? '#ccc' : '#007AFF',
               width: 56,
               height: 56,
               justifyContent: 'center',
               alignItems: 'center',
             }}
           >
             {saving ? (
               <MotiView
                 style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'white' }}
                 from={{ rotate: '0deg' }}
                 animate={{ rotate: '360deg' }}
                 transition={{ type: 'timing', duration: 1000, loop: true }}
               />
             ) : (
               <Check size={20} color="white" />
             )}
           </TouchableOpacity>
        </View>

        {/* Image Preview or Placeholder */}
        {imageUri ? (
          <View className="mb-6">
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: 200, borderRadius: 12 }}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View className="aspect-w-4 aspect-h-3 bg-gray-200 flex items-center justify-center mb-6 rounded-lg">
            <View className="text-center">
              <ImageIcon size={48} color="#666" />
              <Text className="mt-2 text-muted-foreground">No image selected</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity
            onPress={pickImage}
            className="flex-1 bg-gray-50 py-3 rounded-lg flex items-center justify-center"
          >
            <ImageIcon size={20} color="#666" />
            <Text className="ml-2 text-sm">Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={takePhoto}
            className="flex-1 bg-gray-50 py-3 rounded-lg flex items-center justify-center"
          >
            <Text className="text-sm">📷</Text>
            <Text className="ml-2 text-sm">Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input (shown when image is selected) */}
        {imageUri && (
          <View className="mb-6">
            <Text className="font-medium mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title for your image"
              className="border-b-2 border-gray-300 pb-2"
            />
          </View>
        )}

        {/* Edit Button (placeholder) */}
        {imageUri && title && (
          <TouchableOpacity
            onPress={() => {
              // In real app, would open image editor
              alert('Image editing coming soon!');
            }}
            className="flex items-center justify-center text-sm text-primary"
          >
            <Edit size={16} /> Edit Image
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}