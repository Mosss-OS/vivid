import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, Check, Edit } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as FileSystem from 'expo-file-system';

export default function CaptureDocumentScreen() {
  const router = useRouter();
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        // Add other types as needed
        // type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setDocumentUri.assetUri || asset.uri);
        
        // Determine file type
        const extension = asset.uri.split('.').pop()?.toLowerCase() || '';
        if (extension === 'pdf') {
          setFileType('PDF');
        } else if (['doc', 'docx'].includes(extension)) {
          setFileType('Document');
        } else {
          setFileType('File');
        }
        
        // Auto-generate title from filename
        const fileName = asset.uri.split('/').pop()?.split('.')[0] || 'Document';
        setTitle(fileName);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      alert('Failed to pick document. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!documentUri) {
      alert('Please select a document');
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

  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'PDF': return <FileText size={48} color="#dc2626" />;
      case 'Document': return <FileText size={48} color="#2563eb" />;
      default: return <FileText size={48} color="#6b7280" />;
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
          <Text className="text-xl font-bold">Document Scan</Text>
           <TouchableOpacity
             onPress={handleSave}
             disabled={!documentUri || saving}
             className="p-2 rounded-full"
             style={{
               backgroundColor: !documentUri || saving ? '#ccc' : '#007AFF',
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

        {/* Document Preview or Placeholder */}
        {documentUri ? (
          <View className="mb-6">
            <View className="aspect-w-4 aspect-h-3 bg-gray-100 flex items-center justify-center rounded-lg">
              {getFileTypeIcon()}
              <Text className="mt-2 text-sm font-medium text-gray-600">
                {fileType || 'Document'}
              </Text>
            </View>
          </View>
        ) : (
          <View className="aspect-w-4 aspect-h-3 bg-gray-200 flex items-center justify-center mb-6 rounded-lg">
            <View className="text-center">
              <FileText size={48} color="#666" />
              <Text className="mt-2 text-muted-foreground">No document selected</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={pickDocument}
            className="w-full bg-gray-50 py-4 rounded-lg flex items-center justify-center"
          >
            <FileText size={24} color="#6b7280" />
            <Text className="ml-3 text-sm">Select PDF or Document</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input (shown when document is selected) */}
        {documentUri && (
          <View className="mb-6">
            <Text className="font-medium mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title for your document"
              className="border-b-2 border-gray-300 pb-2"
            />
          </View>
        )}

        {/* Preview Button (placeholder) */}
        {documentUri && title && (
          <TouchableOpacity
            onPress={() => {
              // In real app, would open document preview
              alert('Document preview coming soon!');
            }}
            className="flex items-center justify-center text-sm text-primary"
          >
            <Text>Preview Document</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}