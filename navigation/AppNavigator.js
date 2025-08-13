import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';

import WelcomeScreen from '../screens/WelcomeScreen';
import MainScreen from '../screens/MainScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import SettingsScreen from '../screens/SettingsScreen';

import i18n from '../localization/i18n';
import { COLORS } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRoute }) => {
  const { theme } = useContext(ThemeContext);
  const colors = COLORS[theme];

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary, shadowColor: 'transparent' },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'CairoPlay-Bold',
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={({ navigation }) => ({
          title: i18n.t('mainScreenTitle'),
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 15 }} onPress={() => navigation.navigate('Settings')}>
              <Settings color={colors.text} size={24} />
            </TouchableOpacity>
          ),
          headerLeft: null,
        })}
      />
      <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: i18n.t('settingsTitle') }}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;
