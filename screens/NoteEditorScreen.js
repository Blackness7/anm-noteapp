import React, { useState, useLayoutEffect, useContext } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, I18nManager, ActivityIndicator, Modal, Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Mic, Volume2, StopCircle, Languages, Trash2, Share2 } from 'lucide-react-native';
import i18n from '../localization/i18n';
import { COLORS } from '../constants/Colors';
import { dictionary } from '../data/dictionary';
import { ThemeContext } from '../contexts/ThemeContext';

const WIT_AI_TOKEN = "YOUR_WIT_AI_SERVER_ACCESS_TOKEN"; 

const NoteEditorScreen = ({ route, navigation }) => {
  const { note } = route.params;
  const [content, setContent] = useState(note ? note.content : '');
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranslateModalVisible, setTranslateModalVisible] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const { theme } = useContext(ThemeContext);
  const colors = COLORS[theme];

  const saveNote = async () => {
    Speech.stop();
    if (content.trim().length === 0 && !note) {
        navigation.goBack();
        return;
    }
    try {
      const storedNotes = await AsyncStorage.getItem('user-notes');
      let notes = storedNotes ? JSON.parse(storedNotes) : [];
      
      if (note) {
        notes = notes.map(n => n.id === note.id ? { ...n, content: content } : n);
      } else {
        const newNote = { id: Date.now(), content: content };
        notes.push(newNote);
      }
      
      notes.sort((a, b) => b.id - a.id);
      await AsyncStorage.setItem('user-notes', JSON.stringify(notes));
      navigation.goBack();
    } catch (e) {
      console.error("Failed to save note.", e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      i18n.t('deleteNote'),
      i18n.t('deleteConfirm'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        { text: i18n.t('delete'), style: 'destructive', onPress: deleteNote }
      ]
    );
  };

  const deleteNote = async () => {
    try {
        const storedNotes = await AsyncStorage.getItem('user-notes');
        let notes = storedNotes ? JSON.parse(storedNotes) : [];
        const updatedNotes = notes.filter(n => n.id !== note.id);
        await AsyncStorage.setItem('user-notes', JSON.stringify(updatedNotes));
        navigation.goBack();
    } catch (e) {
        console.error("Failed to delete note.", e);
    }
  };
  
  async function startRecording() {
    if (WIT_AI_TOKEN === "YOUR_WIT_AI_SERVER_ACCESS_TOKEN") {
        Alert.alert("API Key Missing", "Please add your Wit.ai Server Access Token to the code.");
        return;
    }
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true }); 
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setIsTranscribing(true);

    try {
      const response = await FileSystem.uploadAsync('https://api.wit.ai/speech', uri, {
        headers: {
          'Authorization': `Bearer ${WIT_AI_TOKEN}`,
          'Content-Type': 'audio/mpeg3'
        },
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      const responseBody = JSON.parse(response.body);
      const lastLine = response.body.split('\n').pop();
      const data = JSON.parse(lastLine);
      if(data.text) {
         setContent(prevContent => prevContent ? prevContent + ' ' + data.text : data.text);
      } else {
         throw new Error("No text found in response");
      }
    } catch (error) {
      console.error("Transcription Error:", error);
      Alert.alert("Transcription Failed", "Could not transcribe the audio.");
    } finally {
      setIsTranscribing(false);
    }
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
    } else {
      if (content.trim().length > 0) {
        Speech.speak(content, {
          language: i18n.locale,
          onStart: () => setIsSpeaking(true),
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    }
  };

  const handleOfflineTranslate = (targetLang) => {
    if (content.trim().length === 0) return;
    setIsTranslating(true);
    
    const words = content.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      const cleanedWord = word.replace(/[.,!?]/g, '');
      if (dictionary[cleanedWord] && dictionary[cleanedWord][targetLang]) {
        return dictionary[cleanedWord][targetLang];
      }
      return word;
    });

    setTranslatedText(translatedWords.join(' '));
    setIsTranslating(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: content,
      });
    } catch (error) {
      console.error('Failed to share note.', error);
    }
  };

  const openTranslateModal = () => {
    setTranslatedText('');
    setTranslateModalVisible(true);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: note ? i18n.t('editNote') : i18n.t('addNote'),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {note && (
              <>
                <TouchableOpacity onPress={handleShare} style={{ marginRight: 15 }}>
                    <Share2 color={colors.text} size={24} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={{ marginRight: 15 }}>
                    <Trash2 color={'#ff4444'} size={24} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={saveNote} style={{ marginRight: 15 }}>
                <Text style={[styles.buttonText, {color: colors.accent}]}>{i18n.t('save')}</Text>
            </TouchableOpacity>
        </View>
      ),
    });
    return () => Speech.stop();
  }, [navigation, content, note, theme]);

  const styles = StyleSheet.create({
    editorContainer: { flex: 1, backgroundColor: colors.background },
    textInput: { flex: 1, fontSize: 18, color: colors.text, padding: 20, paddingBottom: 100, fontFamily: 'NataSans-Regular', textAlign: I18nManager.isRTL ? 'right' : 'left' },
    actionsContainer: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row-reverse', alignItems: 'center' },
    actionButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', elevation: 8, marginLeft: 10 },
    buttonText: { fontSize: 18, fontFamily: 'CairoPlay-Bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalView: { width: '90%', backgroundColor: colors.primary, borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 22, fontFamily: 'CairoPlay-Bold', color: colors.text, marginBottom: 15 },
    modalSubTitle: { fontSize: 16, fontFamily: 'NataSans-Bold', color: colors.subtleText, marginTop: 20, marginBottom: 10 },
    translationResultBox: { minHeight: 100, width: '100%', backgroundColor: colors.background, borderRadius: 10, padding: 15, justifyContent: 'center', alignItems: 'center' },
    translatedText: { fontSize: 16, fontFamily: 'NataSans-Regular', color: colors.text },
    langOptionsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 10 },
    langOptionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: colors.secondary },
    langOptionText: { color: colors.text, fontFamily: 'NataSans-Regular' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
    modalButton: { flex: 1, backgroundColor: colors.accent, borderRadius: 10, padding: 12, marginHorizontal: 5 },
    modalButtonText: { color: colors.text, fontFamily: 'NataSans-Bold', textAlign: 'center' },
  });

  return (
    <View style={styles.editorContainer}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTranslateModalVisible}
        onRequestClose={() => setTranslateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{i18n.t('translation')}</Text>
            <View style={styles.translationResultBox}>
              {isTranslating ? <ActivityIndicator color={colors.accent}/> : <Text style={styles.translatedText}>{translatedText}</Text>}
            </View>
            <Text style={styles.modalSubTitle}>{i18n.t('translateTo')}</Text>
            <View style={styles.langOptionsContainer}>
                <TouchableOpacity style={styles.langOptionButton} onPress={() => handleOfflineTranslate('en')}><Text style={styles.langOptionText}>English</Text></TouchableOpacity>
                <TouchableOpacity style={styles.langOptionButton} onPress={() => handleOfflineTranslate('ar')}><Text style={styles.langOptionText}>العربية</Text></TouchableOpacity>
                <TouchableOpacity style={styles.langOptionButton} onPress={() => handleOfflineTranslate('id')}><Text style={styles.langOptionText}>Indonesia</Text></TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton} onPress={() => { setContent(translatedText); setTranslateModalVisible(false); }}>
                    <Text style={styles.modalButtonText}>{i18n.t('replaceText')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, {backgroundColor: colors.secondary}]} onPress={() => setTranslateModalVisible(false)}>
                    <Text style={styles.modalButtonText}>{i18n.t('close')}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.textInput}
        multiline
        placeholder={i18n.t('notePlaceholder')}
        placeholderTextColor={colors.subtleText}
        value={content}
        onChangeText={setContent}
        textAlignVertical="top"
        autoFocus={true}
      />
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={openTranslateModal}>
          <Languages color={colors.text} size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSpeak}>
          {isSpeaking ? <StopCircle color={'red'} size={28} /> : <Volume2 color={colors.text} size={28} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={isRecording ? stopRecording : startRecording}>
          {isTranscribing ? <ActivityIndicator color={colors.text} /> : <Mic color={isRecording ? 'red' : colors.text} size={28} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NoteEditorScreen;
