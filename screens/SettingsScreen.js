import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, I18nManager } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';
import { COLORS } from '../constants/Colors';
import i18n from '../localization/i18n';
import { ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';
  const colors = COLORS[theme];
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const changeLanguage = async (lang) => {
    i18n.locale = lang;
    await AsyncStorage.setItem('user-language', lang);
    const isRTL = lang === 'ar';
    I18nManager.forceRTL(isRTL);
    
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      fontFamily: 'CairoPlay-Bold',
      color: colors.accent,
      fontSize: 16,
      marginBottom: 10,
      marginTop: 10,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    settingText: {
      fontFamily: 'NataSans-Bold',
      color: colors.text,
      fontSize: 18,
    },
    languageValue: {
      fontFamily: 'NataSans-Regular',
      color: colors.subtleText,
      fontSize: 16,
      marginRight: 5,
    },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalView: { width: '90%', backgroundColor: colors.primary, borderRadius: 20, padding: 25, alignItems: 'center' },
    modalTitle: { fontSize: 22, fontFamily: 'CairoPlay-Bold', color: colors.text, marginBottom: 20 },
    langOptionButton: { width: '100%', padding: 15, borderRadius: 10, backgroundColor: colors.secondary, marginBottom: 10 },
    langOptionText: { color: colors.text, fontFamily: 'NataSans-Bold', textAlign: 'center', fontSize: 16 },
  });

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLanguageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setLanguageModalVisible(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{i18n.t('language')}</Text>
            <TouchableOpacity style={styles.langOptionButton} onPress={() => changeLanguage('en')}><Text style={styles.langOptionText}>English</Text></TouchableOpacity>
            <TouchableOpacity style={styles.langOptionButton} onPress={() => changeLanguage('ar')}><Text style={styles.langOptionText}>العربية</Text></TouchableOpacity>
            <TouchableOpacity style={styles.langOptionButton} onPress={() => changeLanguage('id')}><Text style={styles.langOptionText}>Indonesia</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.header}>{i18n.t('interface')}</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>{i18n.t('darkMode')}</Text>
        <Switch
          trackColor={{ false: '#767577', true: colors.accent }}
          thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
          onValueChange={toggleTheme}
          value={isDarkMode}
        />
      </View>

      <TouchableOpacity style={styles.settingRow} onPress={() => setLanguageModalVisible(true)}>
        <Text style={styles.settingText}>{i18n.t('language')}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.languageValue}>{i18n.locale.toUpperCase()}</Text>
            <ChevronRight color={colors.subtleText} size={20}/>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;
