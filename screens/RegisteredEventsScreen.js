import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventCard from '../components/EventCard';
import { useIsFocused } from '@react-navigation/native';

export default function RegisteredEventsScreen() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadRegisteredEvents();
    }
  }, [isFocused]);

  const loadRegisteredEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem('registeredEvents');
      setRegisteredEvents(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error loading registered events:', error);
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const updated = registeredEvents.filter(event => event.id !== eventId);
      await AsyncStorage.setItem('registeredEvents', JSON.stringify(updated));
      setRegisteredEvents(updated);
      Alert.alert('Success', 'You have unregistered from the event.');
    } catch (error) {
      Alert.alert('Error', 'Failed to unregister.');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.eventContainer}>
      <EventCard event={item} onPress={() => {}} />
      <Button
        title="Unregister"
        onPress={() =>
          Alert.alert(
            'Unregister',
            'Are you sure you want to unregister?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Yes', onPress: () => handleUnregister(item.id) }
            ]
          )
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {registeredEvents.length === 0 ? (
        <Text style={styles.emptyText}>No registered events.</Text>
      ) : (
        <FlatList
          data={registeredEvents}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  eventContainer: { marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#999' },
});
