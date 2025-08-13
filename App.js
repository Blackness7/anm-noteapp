import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import AppNavigator from './navigation/AppNavigator';
import i18n from './localization/i18n';
import { COLORS } from './constants/Colors';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  const [fontsLoaded] = useFonts({
    'NataSans-Regular': require('./assets/fonts/NataSans-Regular.ttf'),
    'NataSans-Bold': require('./assets/fonts/NataSans-Bold.ttf'),
    'CairoPlay-Regular': require('./assets/fonts/CairoPlay-Regular.ttf'),
    'CairoPlay-Bold': require('./assets/fonts/CairoPlay-Bold.ttf'),
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const lang = await AsyncStorage.getItem('user-language');
        if (lang) {
          i18n.locale = lang;
          const isRTL = lang === 'ar';
          I18nManager.forceRTL(isRTL);
          I18nManager.allowRTL(isRTL);
          setInitialRoute('Main');
        } else {
          setInitialRoute('Welcome');
        }
      } catch (e) {
        console.error("Bootstrap error", e);
        setInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator initialRoute={initialRoute} />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
