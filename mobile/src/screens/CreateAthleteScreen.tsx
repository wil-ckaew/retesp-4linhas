//mobile/src/screens/CreateAthleteScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { pickImage, pickPDF } from '../utils/filePicker';

// Tipos para os arquivos
interface FileAsset {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  name?: string;
  size?: number;
}

// Função para formatar data DD/MM/YYYY
const formatDate = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  let formatted = cleaned;
  if (cleaned.length > 2) {
    formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  }
  if (cleaned.length > 4) {
    formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
  }
  return formatted;
};

// Função para converter DD/MM/YYYY para YYYY-MM-DD
const convertToBackendDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export default function CreateAthleteScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    category: 'Sub-12',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact: '',
    emergency_phone: '',
  });
  
  const [avatarFile, setAvatarFile] = useState<FileAsset | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [medicalFormFile, setMedicalFormFile] = useState<FileAsset | null>(null);
  const [medicalFormUrl, setMedicalFormUrl] = useState<string | null>(null);
  const [uploadingMedicalForm, setUploadingMedicalForm] = useState(false);

  const [displayDate, setDisplayDate] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    uploadContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 4,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    uploadButtonDisabled: {
      opacity: 0.5,
    },
    uploadButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    uploadButtonGreen: {
      backgroundColor: '#22c55e',
    },
    removeButton: {
      padding: 8,
    },
    avatarPreview: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.primary,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 48,
      height: 48,
      resizeMode: 'cover',
    },
    fileInfo: {
      color: colors.text,
      fontSize: 14,
      marginLeft: 4,
    },
    helperText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    input: {
      flex: 1,
      color: colors.text,
      paddingVertical: 12,
      fontSize: 16,
    },
    picker: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    pickerItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginBottom: 4,
    },
    pickerItemActive: {
      backgroundColor: colors.primary,
    },
    pickerItemText: {
      fontSize: 16,
    },
    pickerItemTextActive: {
      color: '#FFFFFF',
    },
    pickerItemTextInactive: {
      color: colors.text,
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginVertical: 16,
    },
    dateHelper: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
      marginLeft: 4,
    },
    emojiIcon: { 
      fontSize: 16, 
      width: 24, 
      textAlign: 'center' 
    },
    emojiIconLarge: { 
      fontSize: 22, 
      width: 32, 
      textAlign: 'center' 
    },
    emojiIconSmall: { 
      fontSize: 14, 
      width: 20, 
      textAlign: 'center' 
    },
    emojiButton: { 
      fontSize: 18, 
      marginRight: 4 
    },
    emojiSection: { 
      fontSize: 16, 
      marginRight: 6 
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    rowHalf: {
      flex: 1,
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDate(text);
    setDisplayDate(formatted);
    const backendDate = convertToBackendDate(formatted);
    setFormData({ ...formData, birth_date: backendDate });
  };

  const handleAvatarUpload = async () => {
    try {
      const result: any = await pickImage();
      
      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('❌ Erro', 'A foto deve ter no máximo 5MB');
        return;
      }

      setAvatarFile(asset);
      setUploadingAvatar(true);

      const formDataUpload = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formDataUpload.append('file', blob, asset.fileName || 'avatar.jpg');
      } else {
        formDataUpload.append('file', {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'avatar.jpg',
        } as any);
      }

      try {
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formDataUpload,
        });

        if (res.ok) {
          const data = await res.json();
          // CORREÇÃO: A URL retornada já tem o caminho completo
          setAvatarUrl(data.url);
          Alert.alert('✅ Sucesso', 'Foto enviada com sucesso!');
        } else {
          Alert.alert('❌ Erro', 'Erro ao fazer upload da foto');
          setAvatarFile(null);
        }
      } catch (error) {
        console.error('Erro:', error);
        Alert.alert('❌ Erro', 'Erro de comunicação ao enviar a foto');
        setAvatarFile(null);
      } finally {
        setUploadingAvatar(false);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('❌ Erro', 'Erro ao selecionar imagem');
    }
  };

  const handleMedicalFormUpload = async () => {
    try {
      const result: any = await pickPDF();
      
      const file = result[0];
      if (!file) return;

      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('❌ Erro', 'O arquivo PDF deve ter no máximo 10MB');
        return;
      }

      setMedicalFormFile(file);
      setUploadingMedicalForm(true);

      const formDataUpload = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formDataUpload.append('file', blob, file.name || 'medical_form.pdf');
      } else {
        formDataUpload.append('file', {
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'medical_form.pdf',
        } as any);
      }

      try {
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formDataUpload,
        });

        if (res.ok) {
          const data = await res.json();
          setMedicalFormUrl(data.url);
          Alert.alert('✅ Sucesso', 'Ficha médica enviada com sucesso!');
        } else {
          Alert.alert('❌ Erro', 'Erro ao fazer upload da ficha');
          setMedicalFormFile(null);
        }
      } catch (error) {
        console.error('Erro:', error);
        Alert.alert('❌ Erro', 'Erro de comunicação ao enviar a ficha');
        setMedicalFormFile(null);
      } finally {
        setUploadingMedicalForm(false);
      }
    } catch (error) {
      console.error('Erro ao selecionar PDF:', error);
      Alert.alert('❌ Erro', 'Erro ao selecionar o arquivo PDF');
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(null);
  };

  const removeMedicalForm = () => {
    setMedicalFormFile(null);
    setMedicalFormUrl(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('❌ Erro', 'Nome do atleta é obrigatório');
      return;
    }
    if (!formData.birth_date) {
      Alert.alert('❌ Erro', 'Data de nascimento é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        birth_date: formData.birth_date,
        category: formData.category,
        avatar_url: avatarUrl,
        medical_form_url: medicalFormUrl,
        phone: formData.phone || null,
        address: formData.address || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
      };

      const res = await fetch(`${API_URL}/athletes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('✅ Sucesso', 'Atleta cadastrado com sucesso!');
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              state: {
                index: 0,
                routes: [{ name: 'Atletas' }],
              },
            },
          ],
        });
      } else {
        const err = await res.text();
        Alert.alert('❌ Erro', `Erro: ${err}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('❌ Erro', 'Erro de comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>📋 Novo Atleta</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>📸</Text> Foto do Atleta
        </Text>
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, (uploadingAvatar || avatarFile) && styles.uploadButtonDisabled]}
            onPress={handleAvatarUpload}
            disabled={uploadingAvatar || !!avatarFile}
          >
            <Text style={styles.emojiButton}>{avatarFile ? '📷' : '☁️'}</Text>
            <Text style={styles.uploadButtonText}>
              {uploadingAvatar ? '⏳ Enviando...' : avatarFile ? '📸 Foto Selecionada' : '📎 Anexar Foto'}
            </Text>
          </TouchableOpacity>

          {avatarFile && (
            <TouchableOpacity style={styles.removeButton} onPress={removeAvatar}>
              <Text style={{ fontSize: 24 }}>❌</Text>
            </TouchableOpacity>
          )}

          {/* CORREÇÃO: Exibir a foto após o upload */}
          {avatarUrl && (
            <View style={styles.avatarPreview}>
              <Image 
                source={{ uri: avatarUrl.startsWith('http') ? avatarUrl : `${API_URL}${avatarUrl}` }} 
                style={styles.avatarImage} 
              />
            </View>
          )}
        </View>
        <Text style={styles.helperText}>Aceita imagens JPG, PNG, GIF (máx 5MB)</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Text style={styles.emojiSection}>👤</Text> Nome completo
          </Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do atleta"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Text style={styles.emojiSection}>📅</Text> Data de nascimento
          </Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>📅</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textSecondary}
              value={displayDate}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          <Text style={styles.dateHelper}>Digite no formato: dia/mês/ano (ex: 15/03/2000)</Text>
        </View>

        <Text style={styles.inputLabel}>
          <Text style={styles.emojiSection}>🏷️</Text> Categoria / Turma
        </Text>
        <View style={styles.picker}>
          {['Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pickerItem,
                formData.category === cat && styles.pickerItemActive,
              ]}
              onPress={() => handleChange('category', cat)}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  formData.category === cat ? styles.pickerItemTextActive : styles.pickerItemTextInactive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NOVOS CAMPOS */}
        <View style={styles.divider} />
        
        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>📞</Text> Telefone
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>📞</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>📍</Text> Endereço
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>📍</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
              placeholder="Rua, número, complemento"
              placeholderTextColor={colors.textSecondary}
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>🏘️</Text> Bairro
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>🏘️</Text>
            <TextInput
              style={styles.input}
              placeholder="Bairro"
              placeholderTextColor={colors.textSecondary}
              value={formData.neighborhood}
              onChangeText={(value) => handleChange('neighborhood', value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.rowHalf, styles.inputContainer]}>
            <Text style={styles.sectionLabel}>
              <Text style={styles.emojiSection}>🏙️</Text> Cidade
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.emojiIcon}>🏙️</Text>
              <TextInput
                style={styles.input}
                placeholder="Cidade"
                placeholderTextColor={colors.textSecondary}
                value={formData.city}
                onChangeText={(value) => handleChange('city', value)}
              />
            </View>
          </View>
          <View style={[styles.rowHalf, styles.inputContainer]}>
            <Text style={styles.sectionLabel}>
              <Text style={styles.emojiSection}>📮</Text> UF
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.emojiIcon}>📮</Text>
              <TextInput
                style={styles.input}
                placeholder="SP"
                placeholderTextColor={colors.textSecondary}
                value={formData.state}
                onChangeText={(value) => handleChange('state', value)}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>📮</Text> CEP
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>📮</Text>
            <TextInput
              style={styles.input}
              placeholder="00000-000"
              placeholderTextColor={colors.textSecondary}
              value={formData.zip_code}
              onChangeText={(value) => handleChange('zip_code', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>🆘</Text> Contato de Emergência
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>🆘</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do contato de emergência"
              placeholderTextColor={colors.textSecondary}
              value={formData.emergency_contact}
              onChangeText={(value) => handleChange('emergency_contact', value)}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>📞</Text> Telefone de Emergência
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.emojiIcon}>📞</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.textSecondary}
              value={formData.emergency_phone}
              onChangeText={(value) => handleChange('emergency_phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.sectionLabel}>
          <Text style={styles.emojiSection}>📄</Text> Ficha do Atleta (3 páginas)
        </Text>
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, styles.uploadButtonGreen, (uploadingMedicalForm || medicalFormFile) && styles.uploadButtonDisabled]}
            onPress={handleMedicalFormUpload}
            disabled={uploadingMedicalForm || !!medicalFormFile}
          >
            <Text style={styles.emojiButton}>📄</Text>
            <Text style={styles.uploadButtonText}>
              {uploadingMedicalForm ? '⏳ Enviando...' : medicalFormFile ? '📄 PDF Selecionado' : '📎 Anexar Ficha PDF'}
            </Text>
          </TouchableOpacity>

          {medicalFormFile && (
            <TouchableOpacity style={styles.removeButton} onPress={removeMedicalForm}>
              <Text style={{ fontSize: 24 }}>❌</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.helperText}>Aceita apenas arquivos PDF (máx 10MB)</Text>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>✅ Cadastrar Atleta</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}