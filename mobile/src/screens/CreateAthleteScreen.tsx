import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { API_URL } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';

export default function CreateAthleteScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateText, setDateText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    birth_date: new Date(),
    category: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [medicalFile, setMedicalFile] = useState(null);

  const categories = ['Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20'];

  useEffect(() => {
    setDateText(formatDate(new Date()));
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('📸 Foto selecionada:', asset.uri);
        
        // Criar nome com extensão .jpg
        const filename = `avatar_${Date.now()}.jpg`;
        
        setAvatarFile({
          uri: asset.uri,
          type: 'image/jpeg',
          name: filename,
        });
        setAvatarPreview(asset.uri);
        console.log('📸 Arquivo preparado:', { name: filename });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const removeImage = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        console.log('📄 PDF selecionado:', result.name);
        const filename = `medical_${Date.now()}.pdf`;
        
        setMedicalFile({
          uri: result.uri,
          type: 'application/pdf',
          name: filename,
        });
      }
    } catch (error) {
      console.error('Erro PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  };

  const removePDF = () => {
    setMedicalFile(null);
  };

  const uploadFile = async (file) => {
    try {
      console.log('📤 Enviando arquivo:', file.name);
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name,
      } as any);

      // IMPORTANTE: Não definir Content-Type manualmente
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📥 Resposta upload:', data);

      if (response.ok && data.url) {
        console.log('✅ Arquivo enviado:', data.url);
        return data.url;
      } else {
        throw new Error(data.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('❌ Erro upload:', error);
      throw error;
    }
  };

  const handleCreateAthlete = async () => {
    console.log('🚀 INICIANDO CRIAÇÃO DO ATLETA');

    if (!formData.name.trim()) {
      Alert.alert('❌ Erro', 'Digite o nome do atleta');
      return;
    }
    if (!formData.category) {
      Alert.alert('❌ Erro', 'Selecione uma categoria');
      return;
    }

    setLoading(true);
    
    try {
      let uploadedAvatarUrl = null;

      if (avatarFile) {
        try {
          console.log('📸 Enviando foto...');
          uploadedAvatarUrl = await uploadFile(avatarFile);
          console.log('✅ Foto enviada:', uploadedAvatarUrl);
        } catch (error) {
          console.error('❌ Erro ao enviar foto:', error);
        }
      }

      const birthDateStr = formData.birth_date.toISOString().split('T')[0];
      const athleteData = {
        name: formData.name.trim(),
        birth_date: birthDateStr,
        category: formData.category,
        avatar_url: uploadedAvatarUrl,
        medical_form_url: null,
      };

      console.log('📦 Enviando para /athletes:', JSON.stringify(athleteData, null, 2));

      const response = await fetch(`${API_URL}/athletes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(athleteData),
      });

      const data = await response.json();
      console.log('📥 Resposta /athletes:', data);

      setLoading(false);

      if (response.ok) {
        Alert.alert(
          '✅ Sucesso!',
          `Atleta ${formData.name} criado com sucesso!`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      { 
                        name: 'Main',
                        state: {
                          index: 0,
                          routes: [
                            { name: 'Atletas' }
                          ]
                        }
                      }
                    ],
                  })
                );
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('❌ Erro', typeof data === 'string' ? data : 'Erro ao cadastrar atleta');
      }
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      setLoading(false);
      Alert.alert('❌ Erro', 'Erro de conexão com o servidor. Tente novamente.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, birth_date: selectedDate }));
      setDateText(formatDate(selectedDate));
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    backButton: { padding: 8 },
    headerTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    headerPlaceholder: { width: 40 },
    formCard: { 
      margin: 16, 
      padding: 20, 
      backgroundColor: colors.card, 
      borderRadius: 16, 
      borderWidth: 1, 
      borderColor: colors.border 
    },
    formGroup: { marginBottom: 20 },
    label: { color: colors.text, fontSize: 14, fontWeight: '500', marginBottom: 8 },
    helperText: { fontSize: 12, marginBottom: 8, color: colors.textSecondary },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 16,
    },
    dateContainer: { flexDirection: 'row', gap: 8 },
    dateInputText: { flex: 1 },
    datePickerButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.hover || '#21262D',
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 70,
      alignItems: 'center',
    },
    categoryButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
    categoryTextActive: { color: '#FFFFFF' },
    uploadButton: {
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 70,
    },
    uploadText: { color: colors.text, fontSize: 14, marginTop: 4, fontWeight: '500' },
    fileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      gap: 12,
    },
    previewImage: { width: 50, height: 50, borderRadius: 8, resizeMode: 'cover' },
    fileName: { flex: 1, color: colors.text, fontSize: 14 },
    actionsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 8 },
    button: { 
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 14, 
      borderRadius: 12, 
      gap: 8 
    },
    buttonCancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    buttonCancelText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
    buttonCreate: { backgroundColor: colors.primary || '#3B82F6' },
    buttonCreateText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    buttonCreateDisabled: { opacity: 0.5 },
    footer: { paddingHorizontal: 16, marginTop: 12, alignItems: 'center' },
    footerText: { color: colors.textSecondary, fontSize: 12 },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Atleta</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Atleta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Data de Nascimento *</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={[styles.input, styles.dateInputText]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textSecondary}
                value={dateText}
                onChangeText={(text) => {
                  let cleaned = text.replace(/\D/g, '');
                  if (cleaned.length <= 2) {
                    setDateText(cleaned);
                  } else if (cleaned.length <= 4) {
                    setDateText(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
                  } else if (cleaned.length <= 8) {
                    setDateText(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
                  } else {
                    setDateText(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
                  }
                  
                  if (cleaned.length >= 8) {
                    const day = parseInt(cleaned.slice(0, 2));
                    const month = parseInt(cleaned.slice(2, 4)) - 1;
                    const year = parseInt(cleaned.slice(4, 8));
                    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
                      const newDate = new Date(year, month, day);
                      if (!isNaN(newDate.getTime())) {
                        setFormData(prev => ({ ...prev, birth_date: newDate }));
                      }
                    }
                  }
                }}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Icon name="calendar" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={formData.birth_date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <Text style={[styles.helperText, { color: formData.category ? '#10B981' : colors.textSecondary }]}>
              {formData.category ? `✅ ${formData.category}` : '⚠️ Selecione uma categoria'}
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category }))}
                >
                  <Text style={[styles.categoryText, formData.category === category && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Foto do Atleta</Text>
            {avatarPreview ? (
              <View style={styles.fileContainer}>
                <Image source={{ uri: avatarPreview }} style={styles.previewImage} />
                <Text style={styles.fileName} numberOfLines={1}>{avatarFile?.name}</Text>
                <TouchableOpacity onPress={removeImage}>
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Icon name="camera" size={32} color={colors.primary} />
                <Text style={styles.uploadText}>Adicionar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ficha Médica (PDF)</Text>
            {medicalFile ? (
              <View style={styles.fileContainer}>
                <Icon name="document-text" size={32} color="#10B981" />
                <Text style={styles.fileName} numberOfLines={1}>{medicalFile.name}</Text>
                <TouchableOpacity onPress={removePDF}>
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickPDF}>
                <Icon name="document-text" size={32} color="#10B981" />
                <Text style={styles.uploadText}>Selecionar PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.buttonCreate,
              loading && styles.buttonCreateDisabled
            ]} 
            onPress={handleCreateAthlete} 
            disabled={loading}
          >
            {loading ? 
              <ActivityIndicator size="small" color="#FFFFFF" /> : 
              <>
                <Icon name="save" size={20} color="#FFFFFF" />
                <Text style={styles.buttonCreateText}>Salvar</Text>
              </>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>* Campos obrigatórios</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
