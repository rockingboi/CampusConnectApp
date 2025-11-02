import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet, Text, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import EventCard from '../components/EventCard';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const searchOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);

  useEffect(() => {
    headerScale.value = withSpring(1.05, { damping: 10 }, () => {
      headerScale.value = withSpring(1, { damping: 10 });
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
    };
  });

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch('https://6907b4d3b1879c890eda823d.mockapi.io/api/CampusConnect/CampusConnectApp');
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const onSearch = text => {
    setSearchText(text);
    searchOpacity.value = withTiming(text.length > 0 ? 0.9 : 1);
    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(text.toLowerCase()) ||
      event.category.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const onEventPress = event => {
    navigation.navigate('EventDetails', { event });
  };

  const EventListItem = ({ item, index, onPress }) => {
    const itemOpacity = useSharedValue(0);
    const itemTranslateY = useSharedValue(20);

    useEffect(() => {
      const timer = setTimeout(() => {
        itemOpacity.value = withTiming(1, { duration: 300 + index * 50 });
        itemTranslateY.value = withSpring(0, { damping: 15 });
      }, index * 50);

      return () => clearTimeout(timer);
    }, [index]);

    const animatedItemStyle = useAnimatedStyle(() => {
      return {
        opacity: itemOpacity.value,
        transform: [
          {
            translateY: itemTranslateY.value,
          },
        ],
      };
    });

    return (
      <AnimatedView style={animatedItemStyle}>
        <EventCard event={item} onPress={onPress} />
      </AnimatedView>
    );
  };

  const renderItem = ({ item, index }) => (
    <EventListItem 
      item={item} 
      index={index} 
      onPress={() => onEventPress(item)}
    />
  );

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: searchOpacity.value,
    };
  });

  const dynamicStyles = {
    container: { backgroundColor: colors.primary },
    title: { color: colors.headerText },
    subtitle: { color: colors.headerText, opacity: 0.9 },
    searchWrapper: { backgroundColor: colors.inputBackground },
    searchInput: { color: colors.inputText },
    searchIcon: { color: colors.textSecondary },
    clearIcon: { color: colors.textSecondary },
    resultCount: { color: colors.headerText, opacity: 0.9 },
    loadingText: { color: colors.headerText },
    emptyText: { color: colors.headerText, opacity: 0.9 },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <AnimatedView style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, dynamicStyles.title]}>CampusConnect</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Discover events that vibe with you</Text>
            </View>
            <ThemeToggleButton />
          </View>
        </AnimatedView>

        <View style={styles.searchContainer}>
          <View style={[styles.searchWrapper, dynamicStyles.searchWrapper]}>
            <Ionicons name="search" size={20} style={[styles.searchIcon, dynamicStyles.searchIcon]} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder="Search events..."
              placeholderTextColor={colors.textTertiary}
              value={searchText}
              onChangeText={onSearch}
              returnKeyType="search"
              selectionColor={colors.primary}
              underlineColorAndroid="transparent"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearch('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} style={dynamicStyles.clearIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading events...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}></Text>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              {searchText.length > 0
                ? "No events found. Try a different search!"
                : "No events available yet. Check back soon!"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.headerText}
                colors={[colors.primary]}
              />
            }
            ListHeaderComponent={
              <Text style={[styles.resultCount, dynamicStyles.resultCount]}>
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              </Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
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
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    outlineStyle: 'none',
    outline: 'none',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
});
