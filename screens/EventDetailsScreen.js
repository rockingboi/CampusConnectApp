import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EventDetailsScreen({ route }) {
  const { event } = route.params;

  const handleRegister = async () => {
    try {
      const stored = await AsyncStorage.getItem('registeredEvents');
      const registeredEvents = stored ? JSON.parse(stored) : [];

      if (registeredEvents.some(e => e.id === event.id)) {
        Alert.alert('Info', 'Already registered for this event.');
        return;
      }

      const updatedEvents = [...registeredEvents, event];
      await AsyncStorage.setItem('registeredEvents', JSON.stringify(updatedEvents));
      Alert.alert('Success', 'You have successfully registered for this event!');
    } catch (error) {
      Alert.alert('Error', 'Failed to register event.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{event.name}</Text>
      <Text style={styles.date}>Date: {event.date}</Text>
      <Text style={styles.location}>Location: {event.location}</Text>
      <Text style={styles.organizer}>Organizer: {event.organizer}</Text>
      <Text style={styles.description}>Description: {event.description}</Text>
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  date: { fontSize: 16, marginBottom: 5 },
  location: { fontSize: 16, marginBottom: 5 },
  organizer: { fontSize: 14, color: '#555', marginBottom: 15 },
  description: { fontSize: 16, marginBottom: 20 },
});
