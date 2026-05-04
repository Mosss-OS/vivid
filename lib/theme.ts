import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Soft color palette for minimalist, calm aesthetic
export const Colors = {
  light: {
    background: '#F5F5F0', // Soft warm white
    surface: '#FFFFFF',
    text: '#1a1a2e',
    muted: '#6b7280',
    primary: '#007AFF', // Calm blue
    border: '#e5e7eb',
  },
  dark: {
    background: '#1a1a2e', // Deep dark blue
    surface: '#2d2d44',
    text: '#f5f5f0',
    muted: '#9ca3af',
    primary: '#60a5fa', // Light blue
    border: '#374151',
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  
  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';
  
  const toggleTheme = () => {
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Save to SecureStore
      try {
        SecureStore.setItemAsync('vivid_theme', newTheme);
      } catch {}
      return newTheme;
    });
  };
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      SecureStore.setItemAsync('vivid_theme', newTheme);
    } catch {}
  };
  
  // Load saved theme on mount
  useEffect(() => {
    try {
      const savedTheme = SecureStore.getItemAsync('vivid_theme') as Promise<Theme>;
      savedTheme.then((theme) => {
        if (theme) {
          setThemeState(theme);
        }
      });
    } catch {}
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
