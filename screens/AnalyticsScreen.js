import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedView = Animated.createAnimatedComponent(View);

function StatCard({ icon, label, value, color, index }) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    }, index * 100);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedView style={[styles.statCard, animatedStyle, { backgroundColor: color + '15', borderColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </AnimatedView>
  );
}

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    registered: 0,
    favorites: 0,
    reminders: 0,
    rated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      loadStats();
      containerOpacity.value = withTiming(1, { duration: 300 });
    } else {
      containerOpacity.value = withTiming(0);
    }
  }, [isFocused]);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [registered, favorites, reminders, ratings] = await Promise.all([
        AsyncStorage.getItem('registeredEvents'),
        AsyncStorage.getItem('favoriteEvents'),
        AsyncStorage.getItem('eventReminders'),
        AsyncStorage.getItem('eventRatings'),
      ]);

      const registeredEvents = registered ? JSON.parse(registered) : [];
      const favoriteEvents = favorites ? JSON.parse(favorites) : [];
      const reminderEvents = reminders ? JSON.parse(reminders) : [];
      const eventRatings = ratings ? JSON.parse(ratings) : {};

      setStats({
        registered: registeredEvents.length,
        favorites: favoriteEvents.length,
        reminders: reminderEvents.length,
        rated: Object.keys(eventRatings).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    sectionTitle: { color: colors.text },
    loadingText: { color: colors.textSecondary },
  };

  const totalEvents = stats.registered + stats.favorites + stats.reminders + stats.rated;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.header, containerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, dynamicStyles.title]}>Analytics</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                Your event activity overview
              </Text>
            </View>
            <ThemeToggleButton />
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.statsGrid}>
            <StatCard
              icon="checkmark-circle"
              label="Registered Events"
              value={stats.registered}
              color="#10b981"
              index={0}
            />
            <StatCard
              icon="heart"
              label="Favorites"
              value={stats.favorites}
              color="#ef4444"
              index={1}
            />
            <StatCard
              icon="notifications"
              label="Reminders Set"
              value={stats.reminders}
              color="#f59e0b"
              index={2}
            />
            <StatCard
              icon="star"
              label="Rated Events"
              value={stats.rated}
              color="#6366f1"
              index={3}
            />
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Activity</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{totalEvents}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Engagement Rate</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {stats.registered > 0 ? Math.round((stats.rated / stats.registered) * 100) : 0}%
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
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

