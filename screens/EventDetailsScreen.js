import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Linking, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const categoryEmojis = {
  tech: '💻',
  sports: '⚽',
  music: '🎵',
  art: '🎨',
  food: '🍕',
  social: '🎉',
  academic: '📚',
  default: '✨',
};

const getCategoryEmoji = (category) => {
  if (!category) return categoryEmojis.default;
  const lowerCategory = category.toLowerCase();
  for (const key in categoryEmojis) {
    if (lowerCategory.includes(key)) {
      return categoryEmojis[key];
    }
  }
  return categoryEmojis.default;
};

// Attractive solid colors
const cardColors = [
  { primary: '#6366f1', light: '#eef2ff' }, // Indigo
  { primary: '#8b5cf6', light: '#f5f3ff' }, // Purple
  { primary: '#ec4899', light: '#fdf2f8' }, // Pink
  { primary: '#f59e0b', light: '#fffbeb' }, // Amber
  { primary: '#10b981', light: '#ecfdf5' }, // Green
  { primary: '#3b82f6', light: '#eff6ff' }, // Blue
  { primary: '#ef4444', light: '#fef2f2' }, // Red
  { primary: '#06b6d4', light: '#ecfeff' }, // Cyan
];

// Countdown Timer Component
function CountdownTimer({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!eventDate) return;

    const calculateTimeLeft = () => {
      try {
        const eventDateTime = new Date(eventDate);
        if (isNaN(eventDateTime.getTime())) {
          setIsExpired(true);
          return;
        }

        const now = new Date();
        const difference = eventDateTime.getTime() - now.getTime();

        if (difference <= 0) {
          setIsExpired(true);
          return;
        }

        setIsExpired(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } catch (e) {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  if (isExpired || !eventDate) {
    return null;
  }

  return (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownLabel}>Time Until Event</Text>
      <View style={styles.countdownRow}>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{timeLeft.days}</Text>
          <Text style={styles.countdownUnit}>Days</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
          <Text style={styles.countdownUnit}>Hours</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
          <Text style={styles.countdownUnit}>Min</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
          <Text style={styles.countdownUnit}>Sec</Text>
        </View>
      </View>
    </View>
  );
}

export default function EventDetailsScreen({ route }) {
  const { event } = route.params;
  const { colors } = useTheme();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const favoriteScale = useSharedValue(1);
  const reminderScale = useSharedValue(1);

  useEffect(() => {
    checkStates();
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const checkStates = async () => {
    try {
      // Check registration
      const stored = await AsyncStorage.getItem('registeredEvents');
      const registeredEvents = stored ? JSON.parse(stored) : [];
      setIsRegistered(registeredEvents.some(e => e.id === event.id));

      // Check favorite
      const favorites = await AsyncStorage.getItem('favoriteEvents');
      const favoriteEvents = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(favoriteEvents.some(e => e.id === event.id));

      // Check reminder
      const reminders = await AsyncStorage.getItem('eventReminders');
      const reminderEvents = reminders ? JSON.parse(reminders) : [];
      setHasReminder(reminderEvents.some(e => e.id === event.id));

      // Check rating
      const ratings = await AsyncStorage.getItem('eventRatings');
      const eventRatings = ratings ? JSON.parse(ratings) : {};
      if (eventRatings[event.id]) {
        setHasRated(true);
        setRating(eventRatings[event.id].rating);
        setFeedback(eventRatings[event.id].feedback || '');
      }
    } catch (error) {
      console.error('Error checking states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1.05, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );

    try {
      const stored = await AsyncStorage.getItem('registeredEvents');
      const registeredEvents = stored ? JSON.parse(stored) : [];

      if (registeredEvents.some(e => e.id === event.id)) {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        alert('You\'re already registered for this event!');
        return;
      }

      const updatedEvents = [...registeredEvents, event];
      await AsyncStorage.setItem('registeredEvents', JSON.stringify(updatedEvents));
      setIsRegistered(true);
      
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      alert('Success! You\'ve registered for this event!');
    } catch (error) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert('Oops! Failed to register. Try again!');
      console.error(error);
    }
  };

  const handleFavorite = async () => {
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

  const handleReminder = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    reminderScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    try {
      if (!hasReminder) {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please enable notifications to set reminders.');
          return;
        }

        // Schedule notification
        if (event.date) {
          try {
            const eventDate = new Date(event.date);
            if (!isNaN(eventDate.getTime())) {
              // Schedule 1 day before
              const reminderDate = new Date(eventDate);
              reminderDate.setDate(reminderDate.getDate() - 1);

              if (reminderDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Event Reminder',
                    body: `${event.name} is tomorrow!`,
                    data: { eventId: event.id },
                  },
                  trigger: reminderDate,
                });

                // Save reminder
                const stored = await AsyncStorage.getItem('eventReminders');
                const reminders = stored ? JSON.parse(stored) : [];
                await AsyncStorage.setItem('eventReminders', JSON.stringify([...reminders, event]));
                setHasReminder(true);
                Alert.alert('Success', 'Reminder set for 1 day before the event!');
              } else {
                Alert.alert('Info', 'Event date is too soon to set a reminder.');
              }
            }
          } catch (e) {
            Alert.alert('Error', 'Could not parse event date for reminder.');
          }
        }
      } else {
        // Remove reminder
        const stored = await AsyncStorage.getItem('eventReminders');
        const reminders = stored ? JSON.parse(stored) : [];
        const updated = reminders.filter(e => e.id !== event.id);
        await AsyncStorage.setItem('eventReminders', JSON.stringify(updated));
        setHasReminder(false);
        Alert.alert('Reminder Removed', 'Event reminder has been cancelled.');
      }
    } catch (error) {
      console.error('Error handling reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };

  const handleRating = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (rating === 0) {
      Alert.alert('Please Rate', 'Please select a rating before submitting.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('eventRatings');
      const ratings = stored ? JSON.parse(stored) : {};
      ratings[event.id] = {
        rating,
        feedback: feedback.trim(),
        date: new Date().toISOString(),
      };
      await AsyncStorage.setItem('eventRatings', JSON.stringify(ratings));
      setHasRated(true);
      setShowRatingModal(false);
      
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Thank You!', 'Your feedback has been submitted.');
    } catch (error) {
      console.error('Error saving rating:', error);
      Alert.alert('Error', 'Failed to save feedback. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const eventText = `*${event.name}*\n\n${event.date ? `📅 ${event.date}\n` : ''}${event.location ? `📍 ${event.location}\n` : ''}${event.description ? `\n${event.description}` : ''}`;
    
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(eventText)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          alert('WhatsApp is not installed on this device');
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        alert('Unable to open WhatsApp');
      });
  };

  const handleShareEmail = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const eventText = `${event.name}\n\n${event.date ? `Date: ${event.date}\n` : ''}${event.location ? `Location: ${event.location}\n` : ''}${event.organizer ? `Organizer: ${event.organizer}\n` : ''}${event.description ? `\n${event.description}` : ''}`;
      
      const subject = encodeURIComponent(event.name);
      const body = encodeURIComponent(eventText);
      
      const emailUrl = `mailto:?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        alert('Email app is not configured on this device');
      }
    } catch (error) {
      console.error('Error opening email:', error);
      alert('Unable to open email');
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    };
  });

  const favoriteAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: favoriteScale.value }],
    };
  });

  const reminderAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: reminderScale.value }],
    };
  });

  const colorIndex = (event.id || 0) % cardColors.length;
  const cardColor = cardColors[colorIndex];

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    card: { backgroundColor: colors.cardBackground },
    name: { color: colors.text },
    infoValue: { color: colors.text },
    infoLabel: { color: colors.textSecondary },
    infoRow: { borderBottomColor: colors.border },
    descriptionTitle: { color: colors.text },
    description: { color: colors.textSecondary },
    shareTitle: { color: colors.text },
    registeredText: { color: '#10b981' },
    countdownLabel: { color: colors.text },
    countdownNumber: { color: colors.text },
    countdownUnit: { color: colors.textSecondary },
    modalContent: { backgroundColor: colors.cardBackground },
    modalTitle: { color: colors.text },
    modalInput: { backgroundColor: colors.inputBackground, color: colors.inputText, borderColor: colors.border },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.card, cardAnimatedStyle, dynamicStyles.card]}>
            <View style={[styles.header, { backgroundColor: cardColor.primary }]}>
              <View style={styles.headerContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {event.category || 'Event'}
                  </Text>
                </View>
                <View style={styles.headerActions}>
                  <AnimatedTouchable
                    style={favoriteAnimatedStyle}
                    onPress={handleFavorite}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={28}
                      color={isFavorite ? '#ef4444' : '#ffffff'}
                    />
                  </AnimatedTouchable>
                </View>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={[styles.name, dynamicStyles.name]}>{event.name}</Text>

              {/* Countdown Timer */}
              <CountdownTimer eventDate={event.date} />

              <View style={styles.infoSection}>
                <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                  <Ionicons name="calendar-outline" size={22} color="#6366f1" />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>Date & Time</Text>
                    <Text style={[styles.infoValue, dynamicStyles.infoValue]}>{event.date || 'TBA'}</Text>
                  </View>
                </View>

                {event.location && (
                  <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                    <Ionicons name="location-outline" size={22} color="#ec4899" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>Location</Text>
                      <Text style={[styles.infoValue, dynamicStyles.infoValue]}>{event.location}</Text>
                    </View>
                  </View>
                )}

                {event.organizer && (
                  <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                    <Ionicons name="people-outline" size={22} color="#f59e0b" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>Organizer</Text>
                      <Text style={[styles.infoValue, dynamicStyles.infoValue]}>{event.organizer}</Text>
                    </View>
                  </View>
                )}
              </View>

              {event.description && (
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionTitle, dynamicStyles.descriptionTitle]}>About This Event</Text>
                  <Text style={[styles.description, dynamicStyles.description]}>{event.description}</Text>
                </View>
              )}

              {isRegistered && (
                <View style={styles.registeredBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <Text style={styles.registeredText}>
                    You're registered!
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <AnimatedTouchable
                  style={[styles.actionButton, reminderAnimatedStyle, { backgroundColor: hasReminder ? '#f59e0b' : 'rgba(99, 102, 241, 0.1)', borderColor: hasReminder ? '#f59e0b' : colors.primary }]}
                  onPress={handleReminder}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={hasReminder ? 'notifications' : 'notifications-outline'}
                    size={20}
                    color={hasReminder ? '#ffffff' : colors.primary}
                  />
                  <Text style={[styles.actionButtonText, { color: hasReminder ? '#ffffff' : colors.primary }]}>
                    {hasReminder ? 'Reminder Set' : 'Set Reminder'}
                  </Text>
                </AnimatedTouchable>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }]}
                  onPress={() => setShowRatingModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star-outline" size={20} color="#10b981" />
                  <Text style={[styles.actionButtonText, { color: '#10b981' }]}>
                    {hasRated ? 'Update Rating' : 'Rate & Feedback'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Share Options */}
              <View style={styles.shareSection}>
                <Text style={[styles.shareTitle, dynamicStyles.shareTitle]}>Share Event</Text>
                <View style={styles.shareButtons}>
                  <TouchableOpacity
                    style={[styles.shareButton, { backgroundColor: '#25D366', marginRight: 8 }]}
                    onPress={handleShareWhatsApp}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
                    <Text style={[styles.shareButtonText, { marginLeft: 8 }]}>WhatsApp</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.shareButton, { backgroundColor: '#6366f1', marginRight: 0 }]}
                    onPress={handleShareEmail}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mail" size={24} color="#ffffff" />
                    <Text style={[styles.shareButtonText, { marginLeft: 8 }]}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          <AnimatedTouchable
            style={[
              styles.registerButton,
              buttonAnimatedStyle,
              { backgroundColor: isRegistered ? '#10b981' : '#6366f1' }
            ]}
            onPress={handleRegister}
            disabled={isLoading || isRegistered}
          >
            <View style={styles.buttonContent}>
              {isRegistered ? (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                  <Text style={styles.buttonText}>Already Registered</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>Register Now!</Text>
              )}
            </View>
          </AnimatedTouchable>
        </ScrollView>
      </SafeAreaView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Rate This Event</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingLabel, { color: colors.text }]}>Your Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#f59e0b' : colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.feedbackContainer}>
              <Text style={[styles.feedbackLabel, { color: colors.text }]}>Your Feedback</Text>
              <TextInput
                style={[styles.feedbackInput, dynamicStyles.modalInput]}
                placeholder="Share your thoughts about this event..."
                placeholderTextColor={colors.textTertiary}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleRating}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 24,
    lineHeight: 40,
  },
  countdownContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  countdownUnit: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  countdownSeparator: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 8,
    opacity: 0.5,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  descriptionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  registeredText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shareSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  registerButton: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  ratingContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
