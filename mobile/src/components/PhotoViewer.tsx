//mobile/src/components/PhotoViewer.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/api';
import * as Linking from 'expo-linking';

interface PhotoViewerProps {
  visible: boolean;
  onClose: () => void;
  photoUrl: string | null;
  athleteName?: string;
}

export default function PhotoViewer({ visible, onClose, photoUrl, athleteName = 'Atleta' }: PhotoViewerProps) {
  const { colors } = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: '95%',
      maxHeight: '90%',
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    photoContainer: {
      flex: 1,
      minHeight: 300,
      backgroundColor: colors.background,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    photoImage: {
      width: '100%',
      height: 400,
      resizeMode: 'contain',
      borderRadius: 8,
    },
    photoPlaceholder: {
      alignItems: 'center',
      padding: 20,
    },
    placeholderIcon: {
      marginBottom: 16,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    noFileText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    infoBox: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoText: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
    openButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      minWidth: 200,
      justifyContent: 'center',
    },
    openButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    buttonGroup: {
      width: '100%',
      paddingHorizontal: 20,
    },
  });

  const getFullUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  const openPhoto = () => {
    const fullUrl = getFullUrl(photoUrl);
    if (!fullUrl) {
      Alert.alert('Erro', 'URL da foto inválida');
      return;
    }

    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
    } else {
      Linking.openURL(fullUrl).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir a foto');
      });
    }
  };

  if (!visible) return null;

  const fullPhotoUrl = getFullUrl(photoUrl);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📸 Foto - {athleteName}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.photoContainer}>
            {fullPhotoUrl ? (
              <>
                <Image
                  source={{ uri: fullPhotoUrl }}
                  style={styles.photoImage}
                  resizeMode="contain"
                  onError={() => {
                    Alert.alert('Erro', 'Não foi possível carregar a foto');
                  }}
                />
                <View style={{ padding: 12, width: '100%' }}>
                  <TouchableOpacity style={styles.openButton} onPress={openPhoto}>
                    <Icon name={Platform.OS === 'web' ? 'open-outline' : 'expand-outline'} size={20} color="#FFFFFF" />
                    <Text style={styles.openButtonText}>
                      {Platform.OS === 'web' ? 'Abrir em Nova Aba' : 'Ver em Tela Cheia'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Icon name="image-outline" size={64} color={colors.textSecondary} style={styles.placeholderIcon} />
                <Text style={styles.placeholderText}>Nenhuma foto disponível</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}