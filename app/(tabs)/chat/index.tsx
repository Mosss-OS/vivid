import { View, Text, FlatList, TextInput, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { AiChat, Send, Mic } from 'lucide-react-native';
import { AIService } from '../../lib/ai-service';
import { useKnowledgeStore } from '../../lib/store';
import type { KnowledgeItem } from '../../types/knowledge';

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollRef = useRef<FlatList<Message>>(null);
  
  // Get knowledge items from store for RAG context
  const { items: knowledgeItems } = useKnowledgeStore();

  useEffect(() => {
    // Add initial AI message
    setMessages([
      {
        _id: '1',
        text: 'Hey! I\'m Vivid, your AI-powered Second Brain. Ask me anything about your captured knowledge.',
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

  const onSend = async (messages: Message[]) => {
    setMessages(messages);
    setIsAiThinking(true);

    try {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const userInput = lastMessage.text;

      // Build conversation history (excluding the latest message)
      const conversationHistory = messages
        .slice(0, -1)
        .filter(msg => msg.text)
        .map(msg => ({
          role: msg.user._id === '1' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }));

      // Call AI service with RAG (using knowledge items as context)
      const aiResponse = await AIService.generateChatResponse(
        userInput,
        knowledgeItems,
        conversationHistory
      );

      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          text: aiResponse.response,
          user: {
            _id: '2',
            name: 'Vivid',
            avatar: 'https://i.pravatar.cc/150?img=3',
          },
          createdAt: new Date(),
          // Add citations if available
          ...(aiResponse.citations.length > 0 && {
            metadata: {
              citations: aiResponse.citations,
              suggestedFollowUps: aiResponse.suggestedFollowUps,
            }
          })
        },
      ]);
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          user: {
            _id: '2',
            name: 'Vivid',
            avatar: 'https://i.pravatar.cc/150?img=3',
          },
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const onStartRecording = () => {
    setIsRecording(true);
    // In real app, start voice recording and transcription
    // For now, simulate voice input
    setTimeout(() => {
      setIsRecording(false);
      // Simulate voice input
      onSend([
        {
          _id: Date.now().toString(),
          text: 'Can you summarize my notes about React Native?',
          user: {
            _id: '1',
            name: 'You',
          },
          createdAt: new Date(),
        },
      ]);
    }, 2000);
  };

  return (
    <SafeAreaView>
      <View className="flex-1">
        {/* Chat Messages */}
        <View
          ref={scrollRef}
          className="flex-1 pb-12"
          // In real app, use GiftedChat or similar
        >
          {/* Simplified chat UI */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View
                className={`${
                  item.user._id === '1' ? 'self' : 'ai'
                } max-w-[80%] rounded-lg p-3 my-2 mx-2`}
                style={{
                  alignSelf:
                    item.user._id === '1' ? 'flex-end' : 'flex-start',
                  backgroundColor:
                    item.user._id === '1' ? '#007AFF' : '#f0f0f0',
                }}
              >
                <View className="flex-row mb-1">
                  <Text
                    className="font-bold text-sm"
                    style={{ color: item.user._id === '1' ? 'white' : '#333' }}
                  >
                    {item.user._id === '1' ? 'You' : 'Vivid'}
                  </Text>
                  <Text
                    className="text-xs text-muted-foreground ml-2"
                    style={{ color: item.user._id === '1' ? 'white' : '#666' }}
                  >
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text
                  className="text-sm"
                  style={{ color: item.user._id === '1' ? 'white' : '#333' }}
                >
                  {item.text}
                </Text>
                
                {/* Show citations if available */}
                {item.metadata?.citations && item.metadata.citations.length > 0 && (
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
                
                {/* Show suggested follow-ups if available */}
                {item.metadata?.suggestedFollowUps && item.metadata.suggestedFollowUps.length > 0 && (
                  <View className="mt-2 flex-row flex-wrap">
                    {item.metadata.suggestedFollowUps.map((suggestion: string, index: number) => (
                      <TouchableOpacity
                        key={index}
                        className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-2"
                        onPress={() => {
                          onSend([
                            ...messages,
                            {
                              _id: Date.now().toString(),
                              text: suggestion,
                              user: {
                                _id: '1',
                                name: 'You',
                              },
                              createdAt: new Date(),
                            },
                          ]);
                        }}
                      >
                        <Text className="text-xs text-blue-600">{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            contentContainerClassName="p-4"
          />
        </View>

        {/* Input Area */}
        <View className="flex-row items-center p-4 bg-white border-t">
          <TouchableOpacity
            onPress={onStartRecording}
            className="p-2 rounded-full bg-gray-100"
            disabled={isAiThinking}
          >
            {isRecording ? (
              <Text className="text-red-500 font-bold">●</Text>
            ) : (
              <Mic size={20} color={isAiThinking ? "#ccc" : "#666"} />
            )}
          </TouchableOpacity>

          <TextInput
            style={{ flex: 1, marginHorizontal: 12, fontSize: 16 }}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isAiThinking ? "Thinking..." : "Ask Vivid..."}
            editable={!isAiThinking}
          />

          <TouchableOpacity
            onPress={() => {
              if (inputText.trim() && !isAiThinking) {
                onSend([
                  {
                    _id: Date.now().toString(),
                    text: inputText,
                    user: {
                      _id: '1',
                      name: 'You',
                    },
                    createdAt: new Date(),
                  },
                ]);
                setInputText('');
              }
            }}
            className="p-2"
            disabled={isAiThinking}
          >
            {isAiThinking ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Send size={20} color={inputText.trim() ? "#007AFF" : "#ccc"} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}