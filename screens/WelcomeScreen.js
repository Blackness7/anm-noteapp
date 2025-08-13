import React, { useState, useCallback, useContext } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, TouchableOpacity, I18nManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, useAnimatedGestureHandler } from 'react-native-reanimated';
import { ChevronUp } from 'lucide-react-native';
import i18n from '../localization/i18n';
import { COLORS } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const [selectedLang, setSelectedLang] = useState(i18n.locale);
  const translateY = useSharedValue(0);
  const { theme } = useContext(ThemeContext);
  const colors = COLORS[theme];

  const navigateToMain = useCallback(() => navigation.replace('Main'), [navigation]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => { ctx.startY = translateY.value; },
    onActive: (event, ctx) => { translateY.value = ctx.startY + event.translationY; },
    onEnd: (event) => {
      if (event.translationY < -SCREEN_HEIGHT * 0.2) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 400 });
        runOnJS(navigateToMain)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const selectLanguage = async (lang) => {
    i18n.locale = lang;
    setSelectedLang(lang);
    await AsyncStorage.setItem('user-language', lang);
    const isRTL = lang === 'ar';
    I18nManager.forceRTL(isRTL);
    navigation.replace('Welcome');
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    welcomeContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, position: 'absolute', paddingHorizontal: 20 },
    title: { fontSize: 32, fontFamily: 'CairoPlay-Bold', color: colors.text, textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 18, fontFamily: 'NataSans-Regular', color: colors.subtleText, textAlign: 'center', marginBottom: 40 },
    langContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 60 },
    langButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, borderColor: colors.accent },
    langButtonSelected: { backgroundColor: colors.accent },
    langText: { color: colors.text, fontSize: 16, fontFamily: 'NataSans-Bold' },
    swipeUpContainer: { position: 'absolute', bottom: 80, alignItems: 'center' },
    swipeUpText: { color: colors.subtleText, fontSize: 16, fontFamily: 'NataSans-Regular', marginTop: 8 },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.welcomeContainer, animatedStyle]}>
            <Text style={styles.title}>{i18n.t('welcomeTitle')}</Text>
            <Text style={styles.subtitle}>{i18n.t('welcomeSubtitle')}</Text>
            <View style={styles.langContainer}>
              <TouchableOpacity style={[styles.langButton, selectedLang === 'en' && styles.langButtonSelected]} onPress={() => selectLanguage('en')}><Text style={styles.langText}>English</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.langButton, selectedLang === 'ar' && styles.langButtonSelected]} onPress={() => selectLanguage('ar')}><Text style={styles.langText}>العربية</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.langButton, selectedLang === 'id' && styles.langButtonSelected]} onPress={() => selectLanguage('id')}><Text style={styles.langText}>Indonesia</Text></TouchableOpacity>
            </View>
            <View style={styles.swipeUpContainer}>
              <ChevronUp color={colors.subtleText} size={24} />
              <Text style={styles.swipeUpText}>{i18n.t('swipeUp')}</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

export default WelcomeScreen;
