import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function EventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{event.name}</Text>
      <Text style={styles.category}>{event.category}</Text>
      <Text style={styles.date}>{event.date}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  category: {
    color: '#00796b',
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#004d40',
    marginTop: 2,
  },
});
