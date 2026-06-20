import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Mic, Stop, Check, X } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { knowledgeDb } from '../../../lib/database';
import { useKnowledgeStore } from '../../../lib/store';

const LANGUAGES = [
  { label: 'Auto-detect', code: 'unknown' },
  { label: 'Hindi', code: 'hi-IN' },
  { label: 'Tamil', code: 'ta-IN' },
  { label: 'Telugu', code: 'te-IN' },
  { label: 'Kannada', code: 'kn-IN' },
  { label: 'Bengali', code: 'bn-IN' },
  { label: 'Marathi', code: 'mr-IN' },
  { label: 'Gujarati', code: 'gu-IN' },
  { label: 'Malayalam', code: 'ml-IN' },
  { label: 'Punjabi', code: 'pa-IN' },
];

export default function CaptureVoiceScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [recordingObject, setRecordingObject] = useState<Audio.Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('unknown');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const { currentUserId, addItem } = useKnowledgeStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        playbackCategory: 'AUDIO_PLAYBACK',
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync();
      await recording.startAsync();
      setRecordingObject(recording);
      setRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start recording', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recordingObject) return;

    try {
      await recordingObject.stopAndUnloadAsync();
      const uri = recordingObject.getURI();
      if (!uri) return;

      const fileUri = `${FileSystem.documentDirectory}voice-recording-${Date.now()}.m4a`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      setAudioUri(fileUri);
      setRecordingObject(null);
      setRecording(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await transcribeAudio(fileUri);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const transcribeAudio = async (uri: string) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'voice_memo.m4a',
      } as any);
      formData.append('language_code', selectedLanguage);
      formData.append('model', 'saarika:v2');

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': process.env.EXPO_PUBLIC_SARVAM_API_KEY || '',
        },
        body: formData,
      });

      const data = await response.json();
      setTranscript(data.transcript || '');
      setDetectedLanguage(data.language_code || '');
      setTitle(data.transcript ? data.transcript.substring(0, 60) : `Voice Memo ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('Transcription failed:', error);
      setTranscript('');
      alert('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const item = {
        title: title.trim(),
        content: transcript || 'Voice memo recording',
        type: 'note' as const,
        userId: currentUserId || 'anonymous',
        createdAt: now,
        updatedAt: now,
        tags: ['voice', 'audio'],
        audioUrl: audioUri || undefined,
        detectedLanguage: detectedLanguage || undefined,
        isFavorite: false,
      };

      const id = await knowledgeDb.createItem(item);
      addItem({ ...item, id, createdAt: now, tags: ['voice', 'audio'] });

      router.back();
    } catch (error) {
      console.error('Failed to save voice memo:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Voice Memo</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Language Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row space-x-2">
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setSelectedLanguage(lang.code)}
                className={`px-4 py-2 rounded-full ${
                  selectedLanguage === lang.code ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedLanguage === lang.code ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Recording Button */}
        <View className="items-center py-8">
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            disabled={saving || isTranscribing}
            className="p-2 rounded-full"
            style={{
              backgroundColor: recording ? '#EF4444' : '#007AFF',
              width: 72,
              height: 72,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {recording ? (
              <Stop size={32} color="white" />
            ) : (
              <Mic size={32} color="white" />
            )}
          </TouchableOpacity>

          {recording && (
            <Text className="font-mono text-lg mt-4">
              {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
              {(recordingTime % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>

        {/* Transcription Status */}
        {isTranscribing && (
          <View className="items-center py-4">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="text-gray-500 mt-2">Transcribing your voice...</Text>
          </View>
        )}

        {/* Transcript Display */}
        {transcript && !isTranscribing && (
          <View className="mb-6">
            <Text className="font-medium mb-2">Transcript</Text>
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-gray-800">{transcript}</Text>
            </View>
            {detectedLanguage && (
              <Text className="text-xs text-gray-500 mt-1">
                Detected language: {detectedLanguage}
              </Text>
            )}
          </View>
        )}

        {/* Title Input */}
        {!recording && !isTranscribing && audioUri && (
          <View className="mb-6">
            <Text className="font-medium mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title for your voice memo"
              className="border-b-2 border-gray-300 pb-2 text-base"
            />
          </View>
        )}

        {/* Save Button */}
        {!recording && !isTranscribing && audioUri && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="w-full bg-blue-500 py-4 rounded-xl items-center mt-4"
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Check size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Save Voice Memo</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Empty State */}
        {!recording && !audioUri && !isTranscribing && (
          <View className="items-center py-8">
            <Text className="text-gray-400">
              Tap the microphone to start recording
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
