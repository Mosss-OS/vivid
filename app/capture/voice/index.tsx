import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Mic, Stop, Check } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MotiView, MotiProps } from 'moti';

export default function CaptureVoiceScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<Audio.Sound | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (!recording && interval) {
      clearInterval(interval);
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

      const { sound } = await Audio.Sound.createAsync(
        await Audio.Recording.createAsync(),
        { volume: 1.0, isLooping: false }
      );
      
      setAudio(sound);
      await sound.recordAsync();
      setRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (audio) {
      await audio.stopAndUnloadAsync();
      const uri = audio.getURI();
      
      // Save recording temporarily
      const fileUri = `${FileSystem.documentUri}voice-recording-${Date.now()}.m4a`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });
      
      setAudio(null);
      setRecording(false);
      
      // Prompt for title
      const inputTitle = prompt('Enter a title for your voice memo:');
      if (inputTitle !== null) {
        setTitle(inputTitle || `Voice Memo ${new Date().toLocaleTimeString()}`);
        // In real app, save to database and navigate back
        setTimeout(() => {
          router.back();
        }, 500);
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    // In a real app, save to local database and sync with Supabase
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
          <Text className="text-xl font-bold">Voice Memo</Text>
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            disabled={saving}
            className="p-2 rounded-full"
            style={{
              backgroundColor: recording ? '#EF4444' : '#007AFF',
              width: 56,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {recording ? (
              <Stop size={24} color="white" />
            ) : (
              <Mic size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Recording Visualizer */}
        <View className="items-center py-8">
          {recording ? (
            <View className="flex-row space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  className={`h-4 w-1 bg-primary/20 rounded ${
                    recordingTime % 10 > i * 2 ? 'bg-primary' : 'bg-primary/20'
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animation: 'pulse 1.5s infinite ease-in-out',
                  }}
                />
              ))}
            </View>
          ) : (
            <View className="flex-row space-x-2">
              <Text className="text-muted-foreground">Tap to record</Text>
              <View className="h-4 w-1 bg-gray-200 rounded" />
              <Text className="text-muted-foreground">or speak now</Text>
            </View>
          )}
        </View>

        {/* Recording Time */}
        {recording && (
          <View className="items-center mb-6">
            <Text className="font-mono text-lg">
              {Math.floor(recordingTime / 60)
                .toString()
                .padStart(2, '0')}:{(recordingTime % 60)
                .toString()
                .padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Title Input (shown after recording) */}
        {!recording && title && (
          <View className="mb-6">
            <Text className="font-medium mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title for your voice memo"
              className="border-b-2 border-gray-300 pb-2"
            />
          </View>
        )}

        {/* Audio Preview (placeholder) */}
        {!recording && !title && (
          <View className="text-center py-8">
            <Text className="text-muted-foreground">
              No recording yet. Tap the microphone to start.
            </Text>
          </View>
        )}

        {/* Save Button */}
        {!recording && title && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center mt-6"
          >
            {saving ? (
              <MotiView
                style={{ width: 20, height: 20, borderRadius: 50, borderWidth: 2, borderColor: 'white' }}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1000, repeat: Infinity }}
              />
            ) : (
              <Text>Save Voice Memo</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}