/**
 * Health App
 */

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faMoon, faSun, faMobile, faBell, faLanguage, faSave, faArrowLeft, 
  faCog, faGlobe, faRulerCombined, faSync, faShieldAlt, faDatabase, 
  faBookOpen, faHeartPulse, faUser, faHome, faWater, faAppleWhole,
  faFire, faRunning, faPersonWalking, faQuestion, faBed, faEdit,
  faWalking, faDumbbell, faBrain, faLightbulb, faAppleAlt, faCalendarCheck,
  faCheckCircle, faClock, faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './app/context/ThemeContext';
import { useTheme } from './app/hooks/useTheme';
import { UserProvider } from './app/context/UserContext';
import AppNavigator from './app/navigation/AppNavigator';
import { CombinedDefaultTheme, CombinedDarkTheme } from './app/theme';
import store, { persistor } from './app/store';
import type { ExtendedMD3Theme } from './app/types';

// Initialize FontAwesome library
library.add(
  faMoon, faSun, faMobile, faBell, faLanguage, faSave, faArrowLeft, 
  faCog, faGlobe, faRulerCombined, faSync, faShieldAlt, faDatabase, 
  faBookOpen, faHeartPulse, faUser, faHome, faWater, faAppleWhole,
  faFire, faRunning, faPersonWalking, faQuestion, faBed, faEdit,
  faWalking, faDumbbell, faBrain, faLightbulb, faAppleAlt, faCalendarCheck,
  faCheckCircle, faClock, faUtensils
);

// NavigationContainer ile tema entegrasyonu
const AppContent = () => {
  const { isDarkMode, theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();
  
  // Tema seçimi için improved logic
  const navigationTheme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <ThemeProvider>
            <UserProvider>
              <AppContent />
            </UserProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

export default App;
