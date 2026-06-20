import { View, Text, FlatList, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { AIService } from '../../../lib/ai-service';
import { useKnowledgeStore } from '../../../lib/store';
import { getLanguageDisplayName, textToSpeech } from '../../../lib/sarvam';
import * as Haptics from 'expo-haptics';

type Message = {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  system?: boolean;
  metadata?: {
    citations?: any[];
    suggestedFollowUps?: string[];
    detectedLanguage?: string;
  };
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const scrollRef = useRef<FlatList<Message>>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { items: knowledgeItems } = useKnowledgeStore();

  useEffect(() => {
    setMessages([
      {
        _id: '1',
        text: "Hey! I'm Vivid, your AI-powered Second Brain. Ask me anything about your captured knowledge — in English, Hindi, Tamil, or any Indian language!",
        user: {
          _id: '2',
          name: 'Vivid',
          avatar: 'https://i.pravatar.cc/150?img=3',
        },
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  const onSend = async (text: string) => {
    const userMessage: Message = {
      _id: Date.now().toString(),
      text,
      user: { _id: '1', name: 'You' },
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsAiThinking(true);

    try {
      const conversationHistory = messages
        .filter(msg => msg.text && !msg.system)
        .map(msg => ({
          role: msg.user._id === '1' ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

      const aiResponse = await AIService.generateChatResponse(
        text,
        knowledgeItems,
        conversationHistory
      );

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setMessages((prev) => [
        ...prev,
        {
          _id: (Date.now() + 1).toString(),
          text: aiResponse.response,
          user: {
            _id: '2',
            name: 'Vivid',
            avatar: 'https://i.pravatar.cc/150?img=3',
          },
          createdAt: new Date(),
          metadata: {
            citations: aiResponse.citations,
            suggestedFollowUps: aiResponse.suggestedFollowUps,
            detectedLanguage: aiResponse.detectedLanguage,
          },
        },
      ]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          _id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          user: { _id: '2', name: 'Vivid', avatar: 'https://i.pravatar.cc/150?img=3' },
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const playTTS = async (text: string, lang: string, messageId: string) => {
    try {
      if (playingAudioId === messageId) {
        await soundRef.current?.stopAsync();
        await soundRef.current?.unloadAsync();
        setPlayingAudioId(null);
        return;
      }

      const base64Audio = await textToSpeech(text, lang);
      if (!base64Audio) return;

      const uri = `data:audio/wav;base64,${base64Audio}`;
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setPlayingAudioId(messageId);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioId(null);
          soundRef.current = null;
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('TTS playback failed:', error);
      setPlayingAudioId(null);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.user._id === '1';
    const detectedLang = item.metadata?.detectedLanguage;

    return (
      <View
        style={{
          maxWidth: '80%',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: isUser ? '#007AFF' : '#f0f0f0',
          borderRadius: 12,
          padding: 12,
          marginVertical: 4,
          marginHorizontal: 8,
        }}
      >
        <View className="flex-row items-center mb-1">
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 13,
              color: isUser ? 'white' : '#333',
            }}
          >
            {isUser ? 'You' : 'Vivid'}
          </Text>
          {detectedLang && !isUser && (
            <View className="bg-blue-100 rounded px-1.5 py-0.5 ml-2">
              <Text className="text-xs text-blue-700">
                {getLanguageDisplayName(detectedLang)}
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 11,
              color: isUser ? 'rgba(255,255,255,0.7)' : '#666',
              marginLeft: 6,
            }}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <Text style={{ fontSize: 15, color: isUser ? 'white' : '#333' }}>
          {item.text}
        </Text>

        {!isUser && (
          <TouchableOpacity
            onPress={() => playTTS(item.text, item.metadata?.detectedLanguage || 'en-IN', item._id)}
            className="mt-2 flex-row items-center"
          >
            {playingAudioId === item._id ? (
              <VolumeX size={16} color="#007AFF" />
            ) : (
              <Volume2 size={16} color="#007AFF" />
            )}
            <Text className="text-xs text-blue-500 ml-1">
              {playingAudioId === item._id ? 'Stop' : 'Listen'}
            </Text>
          </TouchableOpacity>
        )}

        {item.metadata?.citations?.length > 0 && (
          <View className="mt-2 p-2 bg-black/5 rounded">
            <Text className="text-xs font-medium mb-1">Sources:</Text>
            {item.metadata.citations.map((citation: any, index: number) => (
              <TouchableOpacity key={index} className="flex-row items-center py-1">
                <Text className="text-xs text-blue-500">
                  [{index + 1}] {citation.title} ({citation.type})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {item.metadata?.suggestedFollowUps?.length > 0 && (
          <View className="mt-2 flex-row flex-wrap">
            {item.metadata.suggestedFollowUps.map((suggestion: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSend(suggestion)}
                className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-2"
              >
                <Text className="text-xs text-blue-600">{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={scrollRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerClassName="p-4 pb-20"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input Area */}
      <View className="flex-row items-center p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={() => {
            setIsRecording(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setTimeout(() => {
              setIsRecording(false);
            }, 2000);
          }}
          className="p-2 rounded-full bg-gray-100"
          disabled={isAiThinking}
        >
          {isRecording ? (
            <Text className="text-red-500 font-bold">●</Text>
          ) : (
            <Mic size={20} color={isAiThinking ? '#ccc' : '#666'} />
          )}
        </TouchableOpacity>

        <TextInput
          style={{ flex: 1, marginHorizontal: 12, fontSize: 16 }}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isAiThinking ? 'Thinking...' : 'Ask Vivid...'}
          editable={!isAiThinking}
          onSubmitEditing={() => {
            if (inputText.trim() && !isAiThinking) {
              onSend(inputText.trim());
            }
          }}
        />

        <TouchableOpacity
          onPress={() => {
            if (inputText.trim() && !isAiThinking) {
              onSend(inputText.trim());
            }
          }}
          className="p-2"
          disabled={isAiThinking}
        >
          {isAiThinking ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Send size={20} color={inputText.trim() ? '#007AFF' : '#ccc'} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
