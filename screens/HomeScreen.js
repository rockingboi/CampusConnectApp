import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, StyleSheet } from 'react-native';
import EventCard from '../components/EventCard';

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetch('https://6907b4d3b1879c890eda823d.mockapi.io/api/CampusConnect/CampusConnectApp')
      .then(response => response.json())
      .then(data => {
        setEvents(data);
        setFilteredEvents(data);
      })
      .catch(error => console.error(error));
  }, []);

  const onSearch = text => {
    setSearchText(text);
    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(text.toLowerCase()) ||
      event.category.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const onEventPress = event => {
    navigation.navigate('EventDetails', { event });
  };

  const renderItem = ({ item }) => (
    <EventCard event={item} onPress={() => onEventPress(item)} />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or category"
        value={searchText}
        onChangeText={onSearch}
      />
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, paddingVertical: 8 },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
});
