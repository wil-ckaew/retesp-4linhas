//mobile/src/components/PDFViewerExpo.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/api';
import * as Linking from 'expo-linking';

interface PDFViewerProps {
  visible: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName?: string;
}

export default function PDFViewer({ visible, onClose, pdfUrl, fileName = 'Ficha Médica' }: PDFViewerProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    pdfContainer: {
      flex: 1,
      minHeight: 300,
      backgroundColor: colors.background,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pdfIcon: {
      marginBottom: 16,
    },
    pdfName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 8,
    },
    pdfInfo: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
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

  const openPDF = () => {
    const fullUrl = getFullUrl(pdfUrl);
    if (!fullUrl) {
      Alert.alert('Erro', 'URL do PDF inválida');
      return;
    }

    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
    } else {
      Linking.openURL(fullUrl).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o PDF');
      });
    }
  };

  if (!visible) return null;

  const fullPdfUrl = getFullUrl(pdfUrl);

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
            <Text style={styles.headerTitle}>{fileName}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.pdfContainer}>
            {fullPdfUrl ? (
              <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
                <Icon name="document-text" size={72} color={colors.primary} style={styles.pdfIcon} />
                <Text style={styles.pdfName}>{fileName}</Text>
                
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    O PDF está disponível. Toque no botão abaixo para visualizar.
                  </Text>
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.openButton} onPress={openPDF}>
                    <Icon name={Platform.OS === 'web' ? 'open-outline' : 'eye'} size={20} color="#FFFFFF" />
                    <Text style={styles.openButtonText}>
                      {Platform.OS === 'web' ? 'Abrir PDF' : 'Visualizar PDF'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Icon name="document-text-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.noFileText}>Nenhum PDF disponível</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}