import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Athlete {
  id: string;
  name: string;
  birth_date: string;
  category: string;
  avatar_url: string | null;
  medical_form_url: string | null;
}

export default function AthleteDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { id } = route.params as { id: string };
  
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 20,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 12,
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 18,
      marginTop: 12,
    },
    backButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    backButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    header: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      position: 'relative',
    },
    backButtonHeader: {
      position: 'absolute',
      top: 16,
      left: 16,
      padding: 8,
      zIndex: 10,
    },
    avatarContainer: {
      marginTop: 8,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    avatarFallback: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.primary,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 40,
      fontWeight: 'bold',
    },
    athleteName: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 12,
    },
    athleteBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
      justifyContent: 'center',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    badgeText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    section: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    infoGrid: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    infoValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B98120',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusText: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: '500',
    },
    documentCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    documentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    documentIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.hover,
      justifyContent: 'center',
      alignItems: 'center',
    },
    documentInfo: {
      flex: 1,
    },
    documentTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    documentStatus: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    documentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.hover,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 12,
      gap: 6,
    },
    documentButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    actionsSection: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      height: 20,
    },
  });

  const fetchAthlete = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes/${id}?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setAthlete(data);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados do atleta');
      }
    } catch (error) {
      console.error('Erro ao buscar atleta:', error);
      Alert.alert('Erro', 'Erro de comunicação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthlete();
  }, [id]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  const openDocument = (url: string) => {
    const fullUrl = getImageUrl(url);
    if (fullUrl) {
      Linking.openURL(fullUrl).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o documento');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando dados do atleta...</Text>
      </View>
    );
  }

  if (!athlete) {
    return (
      <View style={styles.centered}>
        <Icon name="person-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.errorText}>Atleta não encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarUrl = getImageUrl(athlete.avatar_url);
  const medicalUrl = getImageUrl(athlete.medical_form_url);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com Avatar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.avatarContainer}>
          {avatarUrl && !imageError ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {athlete.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.athleteName}>{athlete.name}</Text>
        <View style={styles.athleteBadges}>
          <View style={styles.badge}>
            <Icon name="pricetag-outline" size={14} color="#8B5CF6" />
            <Text style={styles.badgeText}>{athlete.category}</Text>
          </View>
          <View style={styles.badge}>
            <Icon name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.badgeText}>{formatDate(athlete.birth_date)}</Text>
          </View>
          <View style={styles.badge}>
            <Icon name="time-outline" size={14} color="#F59E0B" />
            <Text style={styles.badgeText}>{calculateAge(athlete.birth_date)} anos</Text>
          </View>
        </View>
      </View>

      {/* Informações do Atleta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Informações do Atleta</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Categoria</Text>
            <Text style={styles.infoValue}>{athlete.category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data de Nascimento</Text>
            <Text style={styles.infoValue}>{formatDate(athlete.birth_date)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Idade</Text>
            <Text style={styles.infoValue}>{calculateAge(athlete.birth_date)} anos</Text>
          </View>
          <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Icon name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.statusText}>Ativo</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Documentos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Documentos</Text>
        
        {/* Ficha Médica */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentIcon}>
              <Icon name="medical-outline" size={24} color="#EF4444" />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>Ficha Médica</Text>
              <Text style={styles.documentStatus}>
                {athlete.medical_form_url ? '📎 Documento anexado' : '📄 Nenhum documento'}
              </Text>
            </View>
          </View>
          {athlete.medical_form_url && (
            <TouchableOpacity
              style={styles.documentButton}
              onPress={() => openDocument(athlete.medical_form_url!)}
            >
              <Icon name="eye-outline" size={18} color={colors.primary} />
              <Text style={styles.documentButtonText}>Visualizar PDF</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Foto do Atleta */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentIcon}>
              <Icon name="image-outline" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>Foto do Atleta</Text>
              <Text style={styles.documentStatus}>
                {athlete.avatar_url ? '🖼️ Foto anexada' : '📷 Nenhuma foto'}
              </Text>
            </View>
          </View>
          {athlete.avatar_url && (
            <TouchableOpacity
              style={styles.documentButton}
              onPress={() => openDocument(athlete.avatar_url!)}
            >
              <Icon name="eye-outline" size={18} color={colors.primary} />
              <Text style={styles.documentButtonText}>Visualizar Foto</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Ações */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}
