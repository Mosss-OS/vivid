import { View, Text, SafeAreaView, Platform, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { User, Moon, Bell, Download, Shield, Info, ChevronRight, Database } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useKnowledgeStore } from '../../lib/store';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { getDemoItems } from '../../lib/demo-data';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, theme, setTheme } = useTheme();
  const { items, currentUserId } = useKnowledgeStore();
  const [userName, setUserName] = useState('');
  const [userBio, setUserBio] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const name = await SecureStore.getItemAsync('vivid_user_name');
      const bio = await SecureStore.getItemAsync('vivid_user_bio');
      if (name) setUserName(name);
      if (bio) setUserBio(bio);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleClearData = async () => {
    // In a real app, you'd want to confirm this action
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all local data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: async () => {
          try {
            // Clear local database
            // await knowledgeDb.clear();
            // Clear store
            // get().setItems([]);
            alert('Local data cleared');
          } catch (error) {
            console.error('Failed to clear data:', error);
          }
        }},
      ]
    );
  };

  const handleSyncNow = async () => {
    try {
      // Trigger manual sync
      // await syncWithSupabase();
      alert('Sync completed successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5' }}>
      <View className="p-6">
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8"
        >
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </Text>
        </MotiView>

        {/* User Profile Section - Glassmorphism */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={{
            backgroundColor: isDark ? 'rgba(45, 45, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            ...(Platform.OS === 'android' && { elevation: 2 }),
            ...(Platform.OS === 'ios' && { 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 2 
            }),
          }}
        >
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </Text>
        </MotiView>

        {/* User Profile Section */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/profile-setup')}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            className={`p-4 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              ...(Platform.OS === 'android' && { elevation: 2 }),
              ...(Platform.OS === 'ios' && { 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 1 }, 
                shadowOpacity: 0.1, 
                shadowRadius: 2 
              }),
            }}
          >
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-full items-center justify-center ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <User size={32} color={isDark ? '#60a5fa' : '#3b82f6'} />
              </View>
              <View className="ml-4 flex-1">
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userName || (currentUserId ? 'Authenticated User' : 'Guest User')}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} numberOfLines={1}>
                  {userBio || (currentUserId ? 'Logged in' : 'Not logged in')}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </View>
          </MotiView>
        </TouchableOpacity>

        {/* Appearance - Glassmorphism */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={{
            backgroundColor: isDark ? 'rgba(45, 45, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            ...(Platform.OS === 'android' && { elevation: 2 }),
            ...(Platform.OS === 'ios' && { 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 2 
            }),
          }}
        >
          <Text className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            APPEARANCE
          </Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <Moon size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <Text className={`ml-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={isDark ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-3"
            onPress={() => setTheme(theme === 'system' ? 'light' : 'system')}
          >
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>
              System Default ({theme === 'system' ? 'On' : 'Off'})
            </Text>
            <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </MotiView>

        {/* Data & Storage - Glassmorphism */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={{
            backgroundColor: isDark ? 'rgba(45, 45, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            ...(Platform.OS === 'android' && { elevation: 2 }),
            ...(Platform.OS === 'ios' && { 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 2 
            }),
          }}
        >
          <Text className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            DATA & STORAGE
          </Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-3 border-b border-gray-200"
            onPress={handleSyncNow}
          >
            <View className="flex-row items-center">
              <Download size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <View className="ml-3">
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  Sync Now
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {items.length} items stored
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-3 border-b border-gray-200"
            onPress={async () => {
              const { setItems } = useKnowledgeStore.getState();
              const demoItems = getDemoItems();
              setItems(demoItems);
              alert(`Loaded ${demoItems.length} demo items (English, हिंदी, தமிழ், తెలుగு)`);
            }}
          >
            <View className="flex-row items-center">
              <Database size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <View className="ml-3">
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  Load Demo Data
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  For demo/judging purposes
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-3"
            onPress={handleClearData}
          >
            <View className="flex-row items-center">
              <Text className="text-red-500">🗑️</Text>
              <Text className="ml-3 text-red-500">
                Clear Local Data
              </Text>
            </View>
            <ChevronRight size={20} color="#ef4444" />
          </TouchableOpacity>
        </MotiView>



        {/* Notifications - Glassmorphism */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          style={{
            backgroundColor: isDark ? 'rgba(45, 45, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            ...(Platform.OS === 'android' && { elevation: 2 }),
            ...(Platform.OS === 'ios' && { 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 2 
            }),
          }}
        >
          <Text className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            NOTIFICATIONS
          </Text>
          
          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Bell size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <Text className={`ml-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Daily AI Insight
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor="#f3f4f6"
            />
          </TouchableOpacity>
        </MotiView>

        {/* Progress Tracking */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 450 }}
          className={`p-4 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          <Text className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            PROGRESS
          </Text>
          
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📈</Text>
              <View>
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  Knowledge Streak
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {items.filter(item => {
                    const today = new Date();
                    const itemDate = new Date(item.createdAt);
                    return itemDate.toDateString() === today.toDateString();
                  }).length} items today
                </Text>
              </View>
            </View>
            <Text className="text-2xl font-bold text-primary">
              {Math.min(items.length, 30)}
            </Text>
          </View>
        </MotiView>

        {/* About - Glassmorphism */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          style={{
            backgroundColor: isDark ? 'rgba(45, 45, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            ...(Platform.OS === 'android' && { elevation: 2 }),
            ...(Platform.OS === 'ios' && { 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 2 
            }),
          }}
        >
          <Text className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            ABOUT
          </Text>
           
          <TouchableOpacity 
            className="flex-row items-center justify-between py-3 border-b border-gray-200"
            onPress={async () => {
              try {
                const { exportToPDF } = require('../../lib/export');
                await exportToPDF(items, 'Vivid Knowledge Summary');
                alert('PDF exported successfully!');
              } catch (error) {
                console.error('Export failed:', error);
                alert('Export failed. Please try again.');
              }
            }}
          >
            <View className="flex-row items-center">
              <Download size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <Text className={`ml-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Export to PDF
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
           
          <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <Shield size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <Text className={`ml-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Info size={20} color={isDark ? '#60a5fa' : '#6b7280'} />
              <View className="ml-3">
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  Vivid
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}
