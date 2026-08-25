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
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { API_URL } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function EditAthleteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || { id: '' };
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);
  const [currentMedicalUrl, setCurrentMedicalUrl] = useState(null);

  const categories = ['Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20'];

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateStr) => {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  useEffect(() => {
    if (id) fetchAthlete();
  }, [id]);

  const fetchAthlete = async () => {
    try {
      const response = await fetch(`${API_URL}/athletes/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        const birthDate = parseDate(data.birth_date);
        setFormData({
          name: data.name,
          birth_date: birthDate,
          category: data.category,
        });
        setDateText(formatDate(birthDate));
        setCurrentAvatarUrl(data.avatar_url);
        setCurrentMedicalUrl(data.medical_form_url);
        if (data.avatar_url) {
          setAvatarPreview(`${API_URL}${data.avatar_url}`);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao buscar atleta:', error);
      Alert.alert('Erro', 'Erro de conexão');
      navigation.goBack();
    } finally {
      setFetching(false);
    }
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
        setAvatarFile({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
        });
        setAvatarPreview(asset.uri);
        Alert.alert('Sucesso', 'Foto selecionada!');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const removeImage = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setCurrentAvatarUrl(null);
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setMedicalFile({
          uri: result.uri,
          type: result.mimeType || 'application/pdf',
          name: result.name || `medical_${Date.now()}.pdf`,
        });
        Alert.alert('Sucesso', 'PDF selecionado!');
      }
    } catch (error) {
      console.error('Erro PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  };

  const removePDF = () => {
    setMedicalFile(null);
    setCurrentMedicalUrl(null);
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.url) {
        return data.url;
      } else {
        throw new Error(data.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleUpdateAthlete = async () => {
    console.log('🔄 ATUALIZANDO ATLETA');

    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Digite o nome do atleta');
      return;
    }
    if (!formData.category) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }

    setLoading(true);
    try {
      let uploadedAvatarUrl = currentAvatarUrl;
      let uploadedMedicalUrl = currentMedicalUrl;

      if (avatarFile) {
        try {
          uploadedAvatarUrl = await uploadFile(avatarFile);
          console.log('✅ Nova foto enviada:', uploadedAvatarUrl);
        } catch (error) {
          console.error('Erro upload foto:', error);
        }
      }

      if (medicalFile) {
        try {
          uploadedMedicalUrl = await uploadFile(medicalFile);
          console.log('✅ Novo PDF enviado:', uploadedMedicalUrl);
        } catch (error) {
          console.error('Erro upload PDF:', error);
        }
      }

      const birthDateStr = formData.birth_date.toISOString().split('T')[0];
      const athleteData = {
        name: formData.name.trim(),
        birth_date: birthDateStr,
        category: formData.category,
        avatar_url: uploadedAvatarUrl,
        medical_form_url: uploadedMedicalUrl,
      };

      console.log('📦 Enviando:', JSON.stringify(athleteData));

      const response = await fetch(`${API_URL}/athletes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(athleteData),
      });

      const data = await response.json();
      console.log('📥 Resposta:', data);

      setLoading(false);

      setTimeout(() => {
        Alert.alert(
          '✅ Sucesso!',
          `Atleta ${formData.name} atualizado!`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AthletesList' }],
                  })
                );
              },
            },
          ],
          { cancelable: false }
        );
      }, 300);

    } catch (error) {
      console.error('❌ Erro:', error);
      setLoading(false);
      Alert.alert('Erro', 'Erro de conexão com o servidor');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, birth_date: selectedDate }));
      setDateText(formatDate(selectedDate));
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Atleta</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Atleta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              placeholderTextColor="#6B7280"
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
                placeholderTextColor="#6B7280"
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
                <Icon name="calendar" size={24} color="#3B82F6" />
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
            <Text style={[styles.helperText, { color: formData.category ? '#10B981' : '#6B7280' }]}>
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
            {avatarPreview || currentAvatarUrl ? (
              <View style={styles.fileContainer}>
                <Image source={{ uri: avatarPreview || `${API_URL}${currentAvatarUrl}` }} style={styles.previewImage} />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{avatarFile ? avatarFile.name : 'Foto atual'}</Text>
                  <TouchableOpacity onPress={pickImage}>
                    <Text style={styles.changeButtonText}>Trocar foto</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={removeImage}>
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Icon name="cloud-upload" size={32} color="#3B82F6" />
                <Text style={styles.uploadText}>Selecionar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ficha Médica (PDF)</Text>
            {(medicalFile || currentMedicalUrl) ? (
              <View style={styles.fileContainer}>
                <Icon name="document-text" size={32} color="#10B981" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{medicalFile ? medicalFile.name : 'PDF atual'}</Text>
                  <TouchableOpacity onPress={pickPDF}>
                    <Text style={styles.changeButtonText}>Trocar PDF</Text>
                  </TouchableOpacity>
                </View>
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
          <TouchableOpacity style={[styles.button, styles.buttonCreate]} onPress={handleUpdateAthlete} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
              <>
                <Icon name="save" size={20} color="#FFFFFF" />
                <Text style={styles.buttonCreateText}>Atualizar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>* Campos obrigatórios</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0D1117',
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  headerPlaceholder: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  loadingText: { color: '#6B7280', marginTop: 12 },
  formCard: { margin: 16, padding: 20, backgroundColor: '#161B22', borderRadius: 16, borderWidth: 1, borderColor: '#30363D' },
  formGroup: { marginBottom: 20 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  helperText: { fontSize: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  dateContainer: { flexDirection: 'row', gap: 8 },
  dateInputText: { flex: 1 },
  datePickerButton: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
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
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
    minWidth: 70,
    alignItems: 'center',
  },
  categoryButtonActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  categoryText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  categoryTextActive: { color: '#FFFFFF' },
  uploadButton: {
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#30363D',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  uploadText: { color: '#FFFFFF', fontSize: 14, marginTop: 4, fontWeight: '500' },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  previewImage: { width: 50, height: 50, borderRadius: 8, resizeMode: 'cover' },
  fileInfo: { flex: 1 },
  fileName: { color: '#FFFFFF', fontSize: 14 },
  changeButtonText: { color: '#3B82F6', fontSize: 12, marginTop: 4 },
  actionsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 8 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  buttonCancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#30363D' },
  buttonCancelText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
  buttonCreate: { backgroundColor: '#3B82F6' },
  buttonCreateText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { paddingHorizontal: 16, marginTop: 12, alignItems: 'center' },
  footerText: { color: '#6B7280', fontSize: 12 },
});
