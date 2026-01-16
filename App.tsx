// CV Master - Main App Entry Point
import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <AppNavigator />
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default App;
