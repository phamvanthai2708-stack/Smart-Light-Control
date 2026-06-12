import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppTabs from './src/demo_nav/AppTabs';

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppTabs/>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
