import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof darkColors;
  isDark: boolean;
}

const darkColors = {
  background: '#0D1117',
  card: '#161B22',
  border: '#30363D',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  input: '#0D1117',
  hover: '#21262D',
  primary: '#4ade80',
  primaryDark: '#22c55e',
  blue: '#3B82F6',
  danger: '#ef4444',
  success: '#4ade80',
  tabBar: '#161B22',
  header: '#0D1117',
  statusBar: 'light',
};

const lightColors = {
  background: '#f0f2f5',
  card: '#ffffff',
  border: '#d1d5db',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  input: '#f8f9fa',
  hover: '#e5e7eb',
  primary: '#4ade80',
  primaryDark: '#22c55e',
  blue: '#3B82F6',
  danger: '#ef4444',
  success: '#4ade80',
  tabBar: '#ffffff',
  header: '#ffffff',
  statusBar: 'dark',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
