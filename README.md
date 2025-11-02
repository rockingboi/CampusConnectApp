# CampusConnect App 🎓

A modern and feature-rich mobile application for discovering, managing, and engaging with campus events.

## Project Description

CampusConnect is a React Native mobile application built with Expo that helps students and campus community members discover, explore, and stay connected with various events happening on campus. The app provides a seamless experience for browsing events, managing registrations, setting reminders, and sharing events with friends.

## Features Implemented ✨

### Core Features
- **Event Discovery & Search**: Browse all campus events with real-time search functionality
- **Event Details**: Comprehensive event information including date, location, organizer, and description
- **Event Registration**: One-tap registration for events with confirmation
- **Favorites System**: Save your favorite events for quick access
- **Registered Events Management**: View and manage all your registered events with ability to unregister

### Advanced Features
- **Dark/Light Theme Toggle**: Complete theme switching with persistent preference
- **Event Reminders**: Set notifications for events one day before they occur
- **Event Rating & Feedback**: Rate events and provide feedback with a 5-star system
- **Analytics Dashboard**: Track your event activity with statistics including:
  - Number of registered events
  - Favorite events count
  - Reminders set
  - Events rated
  - Total engagement metrics

### User Experience Features
- **Pull-to-Refresh**: Refresh event lists with a simple pull gesture
- **Countdown Timer**: Real-time countdown to upcoming events
- **Social Sharing**: Share events via WhatsApp or Email
- **Empty States**: Beautiful empty state UI for better user guidance
- **Responsive Design**: Optimized for different screen sizes

### Navigation
- **Bottom Tab Navigation**: Easy access to Explore, Favorites, Registered Events, and Analytics
- **Stack Navigation**: Seamless navigation between event lists and details

## Tools and Libraries Used 🛠️

### Framework & Runtime
- **Expo** (~54.0.20) - Development platform and runtime
- **React** (19.1.0) - UI library
- **React Native** (0.81.5) - Mobile framework

### Navigation
- **@react-navigation/native** (^7.1.8) - Navigation framework
- **@react-navigation/bottom-tabs** (^7.4.0) - Tab navigation
- **@react-navigation/elements** (^2.6.3) - Navigation elements

### UI & Animations
- **@expo/vector-icons** (^15.0.3) - Icon library
- **react-native-reanimated** (~4.1.1) - Smooth animations
- **react-native-gesture-handler** (~2.28.0) - Gesture handling
- **expo-linear-gradient** (^15.0.7) - Gradient support

### Storage & State Management
- **@react-native-async-storage/async-storage** (^2.2.0) - Local data persistence
- **React Context API** - Theme management

### Device Features
- **expo-notifications** (^0.32.12) - Push notifications for reminders
- **expo-haptics** (~15.0.7) - Haptic feedback
- **expo-sharing** (^14.0.7) - Sharing functionality
- **expo-calendar** (^15.0.7) - Calendar integration

### Utilities
- **TypeScript** (~5.9.2) - Type safety
- **ESLint** (^9.25.0) - Code linting

## Installation & Running the App 

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended globally)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your device

### Installation Steps

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd CampusConnectApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   Alternatively, you can use:
   - `npm run ios` - Open on iOS simulator
   - `npm run android` - Open on Android emulator
   - `npm run web` - Open in web browser

4. **Run the app**
   - Use Expo Go app on your mobile device by scanning the QR code
   - Or press `i` for iOS simulator, `a` for Android emulator
   - Or open in web browser with `w`

### API Details

The application uses a **Mock API** created using a mock API website with random event data:
- **Mock API URL**: `https://6907b4d3b1879c890eda823d.mockapi.io/api/CampusConnect/CampusConnectApp`
- The API provides randomly generated event data including:
  - Event names, descriptions, dates
  - Location and organizer information
  - Categories and event details

## Project Structure 📁

```
CampusConnectApp/
├── components/           # Reusable UI components
│   ├── EventCard.js     # Event card display component
│   ├── SearchBar.js     # Search functionality component
│   ├── ThemeToggleButton.js  # Theme switcher
│   └── ui/              # Additional UI components
├── constants/           # App constants
│   └── theme.ts        # Theme configuration
├── context/            # React Context providers
│   └── ThemeContext.js # Theme management
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
│   ├── StackNavigator.js
│   └── TabNavigator.js
├── screens/            # Screen components
│   ├── HomeScreen.js          # Main event discovery
│   ├── EventDetailsScreen.js  # Event details
│   ├── FavoritesScreen.js     # Favorite events
│   ├── RegisteredEventsScreen.js  # Registered events
│   └── AnalyticsScreen.js     # User analytics
├── utils/              # Utility functions
│   └── api.js         # API configuration
├── assets/            # Images, fonts, etc.
├── App.js            # Root component
└── package.json      # Dependencies
```


Built with ❤️ using React Native and Expo