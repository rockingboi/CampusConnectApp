import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import EventCard from '../components/EventCard';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

// Separate component for list items to properly use hooks
function RegisteredEventItem({ item, index, onUnregister }) {
  const itemScale = useSharedValue(0.9);
  const itemOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

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

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 10 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 10 });
  };

  return (
    <AnimatedView style={[styles.eventContainer, itemAnimatedStyle]}>
      <EventCard event={item} onPress={() => {}} />
      <AnimatedTouchable
        style={[styles.unregisterButton, buttonAnimatedStyle, { backgroundColor: '#ef4444' }]}
        onPress={() => onUnregister(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="close-circle" size={20} color="#ffffff" />
          <Text style={styles.unregisterText}>Unregister</Text>
        </View>
      </AnimatedTouchable>
    </AnimatedView>
  );
}

export default function RegisteredEventsScreen() {
  const { colors } = useTheme();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      loadRegisteredEvents();
      containerOpacity.value = withTiming(1, { duration: 300 });
    } else {
      containerOpacity.value = withTiming(0);
    }
  }, [isFocused]);

  const loadRegisteredEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('registeredEvents');
      const events = stored ? JSON.parse(stored) : [];
      setRegisteredEvents(events);
    } catch (error) {
      console.error('Error loading registered events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRegisteredEvents();
    setRefreshing(false);
  }, [loadRegisteredEvents]);

  const handleUnregister = async (eventId) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Unregister?',
      'Are you sure you want to unregister from this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        {
          text: 'Yes, Unregister',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = registeredEvents.filter(event => event.id !== eventId);
              await AsyncStorage.setItem('registeredEvents', JSON.stringify(updated));
              setRegisteredEvents(updated);
              
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert('Success!', 'You\'ve unregistered from the event.');
            } catch (error) {
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              Alert.alert('Oops!', 'Failed to unregister. Try again!');
              console.error(error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item, index }) => (
    <RegisteredEventItem 
      item={item} 
      index={index} 
      onUnregister={handleUnregister}
    />
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
    eventContainer: { backgroundColor: colors.cardBackground },
  };

  if (isLoading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading your events...</Text>
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
              <Text style={[styles.title, dynamicStyles.title]}>My Events</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                {registeredEvents.length === 0
                  ? "You haven't registered for any events yet"
                  : `${registeredEvents.length} ${registeredEvents.length === 1 ? 'event' : 'events'} registered`}
              </Text>
            </View>
            <ThemeToggleButton />
          </View>
        </Animated.View>

        {registeredEvents.length === 0 ? (
          <Animated.View style={[styles.emptyContainer, containerAnimatedStyle]}>
            <View style={[styles.emptyCard, dynamicStyles.emptyCard]}>
              <Text style={styles.emptyEmoji}></Text>
              <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No Registered Events Yet</Text>
              <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                Start exploring events and register to see them here!
              </Text>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="arrow-down" size={32} color={colors.emptyIcon} />
              </View>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={registeredEvents}
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
  eventContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unregisterButton: {
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unregisterText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
    letterSpacing: 0.5,
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  emptyIconContainer: {
    marginTop: 24,
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
});
