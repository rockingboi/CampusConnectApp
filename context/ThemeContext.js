import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Use system theme as default
        setTheme(systemColorScheme || 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setTheme(systemColorScheme || 'light');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = {
    light: {
      background: '#f8fafc',
      cardBackground: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      textTertiary: '#94a3b8',
      primary: '#6366f1',
      border: '#e2e8f0',
      shadow: '#000',
      headerBackground: '#6366f1',
      headerText: '#ffffff',
      inputBackground: '#ffffff',
      inputText: '#0f172a',
      emptyIcon: '#94a3b8',
    },
    dark: {
      background: '#0f172a',
      cardBackground: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textTertiary: '#64748b',
      primary: '#6366f1',
      border: '#334155',
      shadow: '#000',
      headerBackground: '#1e293b',
      headerText: '#f1f5f9',
      inputBackground: '#1e293b',
      inputText: '#f1f5f9',
      emptyIcon: '#64748b',
    },
  };

  const value = {
    theme,
    colors: colors[theme],
    isDark: theme === 'dark',
    toggleTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

