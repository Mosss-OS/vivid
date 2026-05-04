import { Tabs } from 'expo-router';
import { HomeIcon, ChatIcon, LibraryIcon, SettingsIcon, NetworkIcon } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      listener={{ backward: () => {} }} // Disable gesture to go back from tabs
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(tabs)/index" options={{ tabBarLabel: 'Home', tabBarIcon: () => <HomeIcon size={24} color="#666" /> }} />
      <Tabs.Screen name="(tabs)/chat" options={{ tabBarLabel: 'Chat', tabBarIcon: () => <ChatIcon size={24} color="#666" /> }} />
      <Tabs.Screen name="(tabs)/library" options={{ tabBarLabel: 'Library', tabBarIcon: () => <LibraryIcon size={24} color="#666" /> }} />
      <Tabs.Screen name="(tabs)/graph" options={{ tabBarLabel: 'Graph', tabBarIcon: () => <NetworkIcon size={24} color="#666" /> }} />
      <Tabs.Screen name="(tabs)/settings" options={{ tabBarLabel: 'Settings', tabBarIcon: () => <SettingsIcon size={24} color="#666" /> }} />
    </Tabs>
  );
}