import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const cardColors = [
  { border: '#6366f1', bg: '#eef2ff' },
  { border: '#8b5cf6', bg: '#f5f3ff' },
  { border: '#ec4899', bg: '#fdf2f8' },
  { border: '#f59e0b', bg: '#fffbeb' },
  { border: '#10b981', bg: '#ecfdf5' },
  { border: '#3b82f6', bg: '#eff6ff' },
  { border: '#ef4444', bg: '#fef2f2' },
  { border: '#06b6d4', bg: '#ecfeff' },
];

const darkCardColors = [
  { border: '#6366f1', bg: '#1e293b' },
  { border: '#8b5cf6', bg: '#1e293b' },
  { border: '#ec4899', bg: '#1e293b' },
  { border: '#f59e0b', bg: '#1e293b' },
  { border: '#10b981', bg: '#1e293b' },
  { border: '#3b82f6', bg: '#1e293b' },
  { border: '#ef4444', bg: '#1e293b' },
  { border: '#06b6d4', bg: '#1e293b' },
];

export default function EventCard({ event, onPress }) {
  const { colors, isDark } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const favoriteScale = useSharedValue(1);

  useEffect(() => {
    checkFavorite();
  }, []);

  const checkFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteEvents');
      const favorites = stored ? JSON.parse(stored) : [];
      setIsFavorite(favorites.some(e => e.id === event.id));
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    favoriteScale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    try {
      const stored = await AsyncStorage.getItem('favoriteEvents');
      const favorites = stored ? JSON.parse(stored) : [];
      
      if (isFavorite) {
        const updated = favorites.filter(e => e.id !== event.id);
        await AsyncStorage.setItem('favoriteEvents', JSON.stringify(updated));
        setIsFavorite(false);
      } else {
        const updated = [...favorites, event];
        await AsyncStorage.setItem('favoriteEvents', JSON.stringify(updated));
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.8);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1);
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const colorIndex = (event.id || 0) % cardColors.length;
  const colorPalette = isDark ? darkCardColors : cardColors;
  const cardColor = colorPalette[colorIndex];

  return (
    <AnimatedTouchable
      style={[styles.cardContainer, animatedStyle, { borderColor: cardColor.border }]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[styles.cardContent, { backgroundColor: cardColor.bg }]}>
        <View style={styles.headerRow}>
          <View style={[styles.categoryBadge, { borderColor: cardColor.border, backgroundColor: `${cardColor.border}15` }]}>
            <Text style={[styles.categoryText, { color: cardColor.border }]}>
              {event.category || 'Event'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleFavorite}
            style={styles.favoriteButton}
            activeOpacity={0.7}
          >
            <Animated.View style={useAnimatedStyle(() => ({
              transform: [{ scale: favoriteScale.value }],
            }))}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#ef4444' : colors.textSecondary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.name, { color: colors.text }]}>{event.name}</Text>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{event.date}</Text>
        </View>

        {event.location && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardContent: {
    borderRadius: 18,
    padding: 18,
    minHeight: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 28,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
