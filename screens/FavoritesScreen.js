import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import EventCard from '../components/EventCard';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function FavoritesScreen({ navigation }) {
  const { colors } = useTheme();
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      loadFavorites();
      containerOpacity.value = withTiming(1, { duration: 300 });
    } else {
      containerOpacity.value = withTiming(0);
    }
  }, [isFocused]);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('favoriteEvents');
      const events = stored ? JSON.parse(stored) : [];
      setFavoriteEvents(events);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const onEventPress = (event) => {
    navigation.navigate('EventDetails', { event });
  };

  const FavoriteEventItem = ({ item, index }) => {
    const itemScale = useSharedValue(0.9);
    const itemOpacity = useSharedValue(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        itemScale.value = withSpring(1, { damping: 15 });
        itemOpacity.value = withTiming(1, { duration: 300 });
      }, index * 50);

      return () => clearTimeout(timer);
    }, []);

    const itemAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: itemScale.value }],
        opacity: itemOpacity.value,
      };
    });

    return (
      <AnimatedView style={itemAnimatedStyle}>
        <EventCard event={item} onPress={() => onEventPress(item)} />
      </AnimatedView>
    );
  };

  const renderItem = ({ item, index }) => (
    <FavoriteEventItem item={item} index={index} />
  );

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    emptyCard: { backgroundColor: colors.cardBackground },
    emptyTitle: { color: colors.text },
    emptyText: { color: colors.textSecondary },
    loadingText: { color: colors.textSecondary },
  };

  if (isLoading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading favorites...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.header, containerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, dynamicStyles.title]}>Favorites</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                {favoriteEvents.length === 0
                  ? "You haven't favorited any events yet"
                  : `${favoriteEvents.length} ${favoriteEvents.length === 1 ? 'event' : 'events'} favorited`}
              </Text>
            </View>
            <ThemeToggleButton />
          </View>
        </Animated.View>

        {favoriteEvents.length === 0 ? (
          <Animated.View style={[styles.emptyContainer, containerAnimatedStyle]}>
            <View style={[styles.emptyCard, dynamicStyles.emptyCard]}>
              <Ionicons name="heart-outline" size={64} color={colors.emptyIcon} />
              <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No Favorites Yet</Text>
              <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                Start exploring events and favorite the ones you like!
              </Text>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={favoriteEvents}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});

