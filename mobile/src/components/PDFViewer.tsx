//mobile/src/components/PDFViewer.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/api';

interface PDFViewerProps {
  visible: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName?: string;
}

export default function PDFViewer({ visible, onClose, pdfUrl, fileName = 'Ficha Médica' }: PDFViewerProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

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
      padding: 4,
    },
    pdfContainer: {
      flex: 1,
      minHeight: 400,
      backgroundColor: colors.background,
      borderRadius: 8,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    pdfWeb: {
      width: '100%',
      height: 500,
      backgroundColor: '#f5f5f5',
    },
    pdfMobile: {
      padding: 20,
      alignItems: 'center',
      width: '100%',
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
    errorText: {
      color: '#EF4444',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
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
  });

  const getFullUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  const handleOpenPDF = async () => {
    if (!pdfUrl) {
      Alert.alert('Erro', 'Nenhum PDF disponível');
      return;
    }

    try {
      const fullUrl = getFullUrl(pdfUrl);
      if (!fullUrl) {
        Alert.alert('Erro', 'URL do PDF inválida');
        return;
      }

      console.log('📄 Abrindo PDF:', fullUrl);

      if (Platform.OS === 'web') {
        // Abrir em nova aba no web
        window.open(fullUrl, '_blank');
      } else {
        // No mobile, tentar abrir com Linking
        const canOpen = await Linking.canOpenURL(fullUrl);
        if (canOpen) {
          await Linking.openURL(fullUrl);
        } else {
          Alert.alert(
            'Erro',
            'Não foi possível abrir o PDF. Verifique se você tem um aplicativo de PDF instalado.',
            [
              {
                text: 'Tentar com Google Drive',
                onPress: () => {
                  // Tentar abrir com Google Drive Viewer
                  const driveUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
                  Linking.openURL(driveUrl).catch(() => {
                    Alert.alert('Erro', 'Não foi possível abrir o PDF');
                  });
                },
              },
              { text: 'Cancelar', style: 'cancel' },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Erro ao abrir PDF:', error);
      Alert.alert('Erro', 'Não foi possível abrir o PDF');
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

          {fullPdfUrl ? (
            <View style={styles.pdfContainer}>
              {Platform.OS === 'web' ? (
                // Web: usar iframe
                <iframe
                  src={fullPdfUrl}
                  style={styles.pdfWeb}
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              ) : (
                // Mobile: mostrar opções para abrir
                <ScrollView style={styles.pdfMobile} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
                  <Icon name="document-text" size={72} color={colors.primary} style={styles.pdfIcon} />
                  
                  <Text style={styles.pdfName}>{fileName}</Text>
                  
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Para visualizar o PDF, escolha uma das opções abaixo:
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.openButton} onPress={handleOpenPDF}>
                    <Icon name="eye" size={20} color="#FFFFFF" />
                    <Text style={styles.openButtonText}>Abrir com Visualizador</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.openButton, { backgroundColor: '#4285F4', marginTop: 8 }]} 
                    onPress={() => {
                      const driveUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullPdfUrl)}&embedded=true`;
                      Linking.openURL(driveUrl).catch(() => {
                        Alert.alert('Erro', 'Não foi possível abrir no Google Drive');
                      });
                    }}
                  >
                    <Icon name="cloud-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.openButtonText}>Google Drive</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.openButton, { backgroundColor: '#34A853', marginTop: 8 }]} 
                    onPress={() => {
                      Linking.openURL(fullPdfUrl).catch(() => {
                        Alert.alert('Erro', 'Não foi possível baixar o PDF');
                      });
                    }}
                  >
                    <Icon name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.openButtonText}>Baixar PDF</Text>
                  </TouchableOpacity>

                  <Text style={[styles.infoText, { marginTop: 16, fontSize: 11 }]}>
                    Arquivo: {pdfUrl?.split('/').pop() || 'documento.pdf'}
                  </Text>
                </ScrollView>
              )}
              
              {loading && Platform.OS === 'web' && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
                    Carregando PDF...
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.pdfContainer}>
              <Icon name="document-text-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.noFileText}>Nenhum PDF disponível</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}