import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import AuthStackNavigation from './src/navigation/AuthStackNavigation';
import { navigationRef } from './src/navigation/NavigationService';
import Theme from './src/theme/Theme';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/AppToast';
import { BusinessUnitProvider } from './src/context/BusinessContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <BusinessUnitProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={Theme.colors.white}
        />

        <NavigationContainer ref={navigationRef}>
          <AuthStackNavigation />
        </NavigationContainer>

        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </BusinessUnitProvider>
  );
}

export default App;
