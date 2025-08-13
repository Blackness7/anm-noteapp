import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, I18nManager } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import i18n from '../localization/i18n';
import { COLORS } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const MainScreen = () => {
  const navigation = useNavigation();
  const [notes, setNotes] = useState([]);
  const isFocused = useIsFocused();
  const { theme } = useContext(ThemeContext);
  const colors = COLORS[theme];

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('user-notes');
      if (storedNotes !== null) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (e) {
      console.error("Failed to load notes.", e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadNotes();
    }
  }, [isFocused]);

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate('NoteEditor', { note: item })}
    >
      <Text style={styles.noteText} numberOfLines={3}>{item.content}</Text>
      <Text style={styles.noteDate}>{i18n.t('noteDate')} {new Date(item.id).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.background },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: {
      color: colors.subtleText,
      fontSize: 18,
      fontFamily: 'NataSans-Regular',
    },
    noteItem: { backgroundColor: colors.secondary, padding: 15, borderRadius: 10, marginBottom: 10 },
    noteText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'NataSans-Regular',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr'
    },
    noteDate: {
      color: colors.subtleText,
      fontSize: 12,
      marginTop: 8,
      textAlign: 'right',
      fontFamily: 'NataSans-Regular',
    },
    fab: {
      position: 'absolute', right: 20, bottom: 20, width: 60, height: 60,
      borderRadius: 30, backgroundColor: colors.accent, justifyContent: 'center',
      alignItems: 'center', elevation: 8,
    },
  });

  return (
    <View style={styles.mainContainer}>
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{i18n.t('noNotes')}</Text>
        </View>
      ) : (
        <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 10 }}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NoteEditor', { note: null })}
      >
        <Plus color={colors.text} size={30} />
      </TouchableOpacity>
    </View>
  );
};

export default MainScreen;
