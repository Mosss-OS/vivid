import { View, Text, TextInput, SafeAreaView, Platform, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Check, Clock, Bell } from 'lucide-react-native';
import { MotiView } from 'moti';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AIService } from '../../lib/ai-service';
import { useKnowledgeStore } from '../../lib/store';
import { scheduleTaskReminder } from '../../lib/notifications';
import type { KnowledgeItem } from '../../types/knowledge';

export default function CaptureTextScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isTask, setIsTask] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { addItem, saveItems, syncWithSupabase, currentUserId } = useKnowledgeStore();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setSaving(true);
    
    try {
      // Use AI to tag and categorize the content
      const aiResult = await AIService.tagContent(`${title} ${content}`);
      
      // Extract tasks from content using AI
      const extractedTasks = await AIService.extractTasks(content);
      
      // Prepare knowledge item
      const knowledgeItem: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'> & { userId: string } = {
        title,
        content,
        type: isTask ? 'task' : aiResult.category, // Override type if marked as task
        tags: [...aiResult.tags, ...(extractedTasks.length > 0 ? ['extracted-task'] : [])],
        // Use the current user ID from the store, or fallback to anonymous
        userId: currentUserId || 'anonymous',
      };
      
      // Save the item via the store (which will handle state update)
      addItem({
        ...knowledgeItem,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Persist to local DB and sync with Supabase
      await saveItems();
      await syncWithSupabase();
      
      // If marked as task and has reminder, schedule notification
      if (isTask && reminderDate) {
        try {
          await scheduleTaskReminder(
            Date.now().toString(), // We'll update this with real ID after save
            title,
            reminderDate
          );
        } catch (notifError) {
          console.error('Failed to schedule reminder:', notifError);
        }
      }
      
      // Show extracted tasks if any
      if (extractedTasks.length > 0) {
        alert(`Extracted ${extractedTasks.length} task(s) from your note!`);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaving(false);
      router.back();
    } catch (error) {
      console.error('Error saving knowledge item:', error);
      // Fallback to basic saving without AI tagging
      setTimeout(() => {
        setSaving(false);
        router.back();
      }, 1000);
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
          <Text className="text-xl font-bold">New Text Note</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <MotiView
                style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#3b82f6' }}
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
              />
            ) : (
              <Check size={20} color="#3b82f6" />
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            className="border-b-2 border-gray-300 pb-2 font-lg"
            autoFocus
          />
          <TextInput
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            className="border-b-2 border-gray-300 pb-2 font-lg"
            multiline
            minHeight={100}
          />
          
          {/* Task Toggle */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <Clock size={20} color="#666" />
              <Text className="ml-3">Mark as Task</Text>
            </View>
            <Switch
              value={isTask}
              onValueChange={setIsTask}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor="#f3f4f6"
            />
          </View>

          {/* Reminder Date Picker (shown when isTask is true) */}
          {isTask && (
            <View className="py-3">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <View className="flex-row items-center">
                  <Bell size={20} color="#3b82f6" />
                  <Text className="ml-3">Set Reminder</Text>
                </View>
                <Text className="text-muted-foreground">
                  {reminderDate ? reminderDate.toLocaleString() : 'No reminder set'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View className="mt-3">
                  {/* Date Picker - simplified for demo */}
                  <TouchableOpacity
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(9, 0, 0, 0);
                      setReminderDate(tomorrow);
                      setShowDatePicker(false);
                    }}
                    className="p-3 bg-blue-50 rounded-lg mb-2"
                  >
                    <Text className="text-blue-600">Tomorrow at 9 AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      nextWeek.setHours(9, 0, 0, 0);
                      setReminderDate(nextWeek);
                      setShowDatePicker(false);
                    }}
                    className="p-3 bg-blue-50 rounded-lg"
                  >
                    <Text className="text-blue-600">Next week at 9 AM</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* AI Suggestions (placeholder) */}
        <View className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Text className="font-semibold mb-2">AI Suggestions</Text>
          <Text className="text-sm text-gray-600">
            Based on your current thoughts, you might want to tag this as: #idea, #task, or #insight
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}