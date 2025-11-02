import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function ThemeToggleButton({ style }) {
  const { theme, isDark, toggleTheme, colors } = useTheme();

  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.cardBackground, borderColor: colors.border }, style]}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={24}
        color={colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

