//mobile/src/screens/AthletesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PDFViewer from '../components/PDFViewerExpo';
import PhotoViewer from '../components/PhotoViewer';

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  birth_date: string;
  medical_form_url: string | null;
  // NOVOS CAMPOS
  phone?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

export default function AthletesScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Estados para histórico de presenças
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string>('');

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string>('');

  const categories = ['all', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    createButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 16,
    },
    categoriesContainer: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.hover || '#21262D',
      marginRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    athleteCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    athleteAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary || '#4f46e5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      resizeMode: 'cover',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    athleteInfo: {
      flex: 1,
    },
    athleteName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    athleteCategory: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    expandedContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailText: {
      color: colors.text,
      fontSize: 14,
      marginLeft: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary || '#4f46e5',
    },
    actionButtonEdit: {
      backgroundColor: '#8B5CF6',
    },
    actionButtonDanger: {
      backgroundColor: '#EF4444',
    },
    actionButtonSuccess: {
      backgroundColor: '#10B981',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 12,
    },
    emptyButton: {
      marginTop: 16,
      backgroundColor: colors.primary || '#4f46e5',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
      maxHeight: '90%',
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalAvatarContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    modalAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.primary || '#4f46e5',
      resizeMode: 'cover',
    },
    modalAvatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary || '#4f46e5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalAvatarText: {
      color: '#FFFFFF',
      fontSize: 40,
      fontWeight: 'bold',
    },
    modalName: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalCategory: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 4,
    },
    modalBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'center',
      marginBottom: 12,
    },
    modalBadgeText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    modalInfoContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    modalInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalInfoRowLast: {
      borderBottomWidth: 0,
      marginBottom: 0,
      paddingBottom: 0,
    },
    modalInfoLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      marginLeft: 8,
      flex: 1,
    },
    modalInfoValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    modalInfoLink: {
      color: '#10B981',
      fontSize: 14,
      fontWeight: '600',
    },
    // Histórico de Presenças
    historySection: {
      marginTop: 4,
      marginBottom: 12,
    },
    historyTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    historyStats: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
      padding: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    historyStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    historyStatText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyStatValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    historyList: {
      maxHeight: 150,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 4,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyItemLast: {
      borderBottomWidth: 0,
    },
    historyDate: {
      color: colors.text,
      fontSize: 13,
    },
    historyStatus: {
      fontSize: 13,
      fontWeight: '500',
    },
    historyStatusPresent: {
      color: '#10B981',
    },
    historyStatusAbsent: {
      color: '#EF4444',
    },
    historyDay: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyEmpty: {
      padding: 12,
      alignItems: 'center',
    },
    historyEmptyText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyLoading: {
      padding: 12,
      alignItems: 'center',
    },
    // Modal Actions
    modalActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
      marginBottom: 8,
    },
    modalActionButton: {
      flex: 1,
      minWidth: '30%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
      gap: 6,
    },
    modalActionAttendance: {
      backgroundColor: colors.primary || '#4f46e5',
    },
    modalActionEdit: {
      backgroundColor: '#F59E0B',
    },
    modalActionDanger: {
      backgroundColor: '#EF4444',
    },
    modalActionText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
    modalActionEmoji: {
      fontSize: 18,
    },
    deleteModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    deleteModalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      alignItems: 'center',
      width: '100%',
    },
    deleteModalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 12,
    },
    deleteModalText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 20,
    },
    deleteModalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    deleteModalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteModalCancel: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteModalCancelText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    deleteModalConfirm: {
      backgroundColor: '#EF4444',
    },
    deleteModalConfirmText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    docButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginLeft: 8,
    },
    docButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    docButtonDisabled: {
      backgroundColor: '#6B7280',
    },
    docButtonSuccess: {
      backgroundColor: '#10B981',
    },
    docButtonPrimary: {
      backgroundColor: colors.primary,
    },
    emojiIcon: {
      fontSize: 16,
      width: 24,
      textAlign: 'center',
    },
    emojiIconLarge: {
      fontSize: 22,
      width: 32,
      textAlign: 'center',
    },
    emojiIconSmall: {
      fontSize: 14,
      width: 20,
      textAlign: 'center',
    },
  });

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      console.log('📥 Atletas recebidos:', data.length);
      setAthletes(data);
      setFilteredAthletes(data);
      setImageErrors({});
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAthletes();
    }, [])
  );

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    let filtered = athletes;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedCategory, athletes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAthletes();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ========== FUNÇÃO PARA ABRIR MODAL COMPLETO ==========
  const openDetails = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setModalVisible(true);
    fetchAttendanceHistory(athlete.id);
  };

  const closeDetails = () => {
    setModalVisible(false);
    setSelectedAthlete(null);
    setAttendanceHistory([]);
  };

  // ========== BUSCAR HISTÓRICO DE PRESENÇAS ==========
  const fetchAttendanceHistory = async (athleteId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/attendance/athlete/${athleteId}?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(data || []);
        console.log(`📊 ${data.length} registros de presença encontrados`);
      } else {
        setAttendanceHistory([]);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setAttendanceHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const navigateToEdit = (id: string) => {
    setModalVisible(false);
    navigation.navigate('EditAthlete', { id });
  };

  const navigateToCreate = () => {
    navigation.navigate('CreateAthlete');
  };

  // ========== NAVEGAR PARA CHAMADA ==========
  const navigateToAttendance = (athleteId: string) => {
    setModalVisible(false);
    setSelectedAthlete(null);
    setAttendanceHistory([]);
    
    setTimeout(() => {
      navigation.navigate('Attendance', { athleteId });
    }, 300);
  };

  const confirmDelete = (id: string) => {
    setAthleteToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!athleteToDelete) return;
    try {
      const res = await fetch(`${API_URL}/athletes/${athleteToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        Alert.alert('✅ Sucesso', 'Atleta excluído com sucesso!');
        setDeleteModalVisible(false);
        setAthleteToDelete(null);
        fetchAthletes();
      } else {
        Alert.alert('❌ Erro', 'Não foi possível excluir o atleta');
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Erro de conexão com o servidor');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAvatarUrl = (avatar_url: string | null): string | null => {
    if (!avatar_url) return null;
    
    if (avatar_url.startsWith('http://') || avatar_url.startsWith('https://')) {
      return avatar_url;
    }
    
    if (avatar_url.startsWith('/uploads/')) {
      let url = avatar_url;
      if (url.endsWith('.bin')) {
        url = url.replace('.bin', '.jpg');
      }
      if (!url.includes('.')) {
        url = url + '.jpg';
      }
      return `${API_URL}${url}`;
    }
    
    if (avatar_url.startsWith('/')) {
      return `${API_URL}${avatar_url}`;
    }
    
    return `${API_URL}/uploads/${avatar_url}`;
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const openPDF = (url: string | null, name: string) => {
    if (!url) {
      Alert.alert('❌ Erro', 'Nenhum PDF disponível para este atleta');
      return;
    }
    setSelectedPdfUrl(url);
    setSelectedPdfName(name);
    setPdfModalVisible(true);
  };

  const openPhoto = (url: string | null, name: string) => {
    if (!url) {
      Alert.alert('❌ Erro', 'Nenhuma foto disponível para este atleta');
      return;
    }
    setSelectedPhotoUrl(url);
    setSelectedPhotoName(name);
    setPhotoModalVisible(true);
  };

  // ========== RENDER HISTÓRICO DE PRESENÇAS ==========
  const renderAttendanceHistory = () => {
    if (loadingHistory) {
      return (
        <View style={styles.historyLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.historyEmptyText}>⏳ Carregando histórico...</Text>
        </View>
      );
    }

    if (attendanceHistory.length === 0) {
      return (
        <View style={styles.historyEmpty}>
          <Text style={{ fontSize: 24 }}>📭</Text>
          <Text style={styles.historyEmptyText}>Nenhum registro de presença</Text>
        </View>
      );
    }

    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(r => r.present).length;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>📊 Histórico de Presenças</Text>
        
        <View style={styles.historyStats}>
          <View style={styles.historyStat}>
            <Text style={{ fontSize: 14 }}>✅</Text>
            <Text style={[styles.historyStatValue, { color: '#10B981' }]}>
              {present}
            </Text>
            <Text style={styles.historyStatText}>presentes</Text>
          </View>
          <View style={styles.historyStat}>
            <Text style={{ fontSize: 14 }}>❌</Text>
            <Text style={[styles.historyStatValue, { color: '#EF4444' }]}>
              {absent}
            </Text>
            <Text style={styles.historyStatText}>ausentes</Text>
          </View>
          <View style={styles.historyStat}>
            <Text style={{ fontSize: 14 }}>📊</Text>
            <Text style={[styles.historyStatValue, { color: colors.primary }]}>
              {percentage.toFixed(0)}%
            </Text>
            <Text style={styles.historyStatText}>taxa</Text>
          </View>
        </View>

        <View style={styles.historyList}>
          <FlatList
            data={attendanceHistory.slice(0, 10)}
            keyExtractor={(item, index) => `${index}`}
            scrollEnabled={true}
            renderItem={({ item, index }) => {
              const date = new Date(item.date);
              const isLast = index === Math.min(attendanceHistory.length, 10) - 1;
              return (
                <View style={[styles.historyItem, isLast && styles.historyItemLast]}>
                  <Text style={styles.historyDate}>
                    {date.toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={[
                    styles.historyStatus,
                    item.present ? styles.historyStatusPresent : styles.historyStatusAbsent
                  ]}>
                    {item.present ? '✅ Presente' : '❌ Faltou'}
                  </Text>
                  <Text style={styles.historyDay}>
                    {weekDays[date.getDay()]}
                  </Text>
                </View>
              );
            }}
            ListFooterComponent={() => {
              if (attendanceHistory.length > 10) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        '📊 Histórico Completo',
                        `Total: ${attendanceHistory.length} registros\n✅ Presentes: ${present}\n❌ Ausentes: ${absent}\n📊 Taxa: ${percentage.toFixed(0)}%`
                      );
                    }}
                    style={{ padding: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      Ver todos os {attendanceHistory.length} registros
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            }}
          />
        </View>
      </View>
    );
  };

  // renderAthlete
  const renderAthlete = ({ item }: { item: Athlete }) => {
    const isExpanded = expandedId === item.id;
    const age = calculateAge(item.birth_date);
    const avatarUrl = getAvatarUrl(item.avatar_url);
    const hasError = imageErrors[item.id];
    const showInitials = !avatarUrl || hasError;

    return (
      <View style={styles.athleteCard}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.athleteAvatar}>
            {showInitials ? (
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Image
                source={{ uri: avatarUrl || undefined }}
                style={styles.avatarImage}
                onError={() => handleImageError(item.id)}
              />
            )}
          </View>
          <View style={styles.athleteInfo}>
            <Text style={styles.athleteName}>{item.name}</Text>
            <Text style={styles.athleteCategory}>{item.category}</Text>
          </View>
          <Text style={{ fontSize: 22 }}>
            {isExpanded ? '🔽' : '▶️'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Text style={styles.emojiIcon}>📅</Text>
              <Text style={styles.detailText}>
                Nascimento: {formatDate(item.birth_date)} ({age} anos)
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.emojiIcon}>🏷️</Text>
              <Text style={styles.detailText}>Categoria: {item.category}</Text>
            </View>
            
            <View style={{ marginTop: 8 }}>
              <View style={[styles.detailRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.emojiIcon}>📸</Text>
                  <Text style={styles.detailText}>Foto:</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.docButton,
                    item.avatar_url ? styles.docButtonSuccess : styles.docButtonDisabled
                  ]}
                  onPress={() => openPhoto(item.avatar_url, item.name)}
                  disabled={!item.avatar_url}
                >
                  <Text style={styles.emojiIconSmall}>👁️</Text>
                  <Text style={styles.docButtonText}>
                    {item.avatar_url ? 'Visualizar' : 'Indisponível'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.detailRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.emojiIcon}>📄</Text>
                  <Text style={styles.detailText}>Ficha Médica:</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.docButton,
                    item.medical_form_url ? styles.docButtonSuccess : styles.docButtonDisabled
                  ]}
                  onPress={() => openPDF(item.medical_form_url, `Ficha Médica - ${item.name}`)}
                  disabled={!item.medical_form_url}
                >
                  <Text style={styles.emojiIconSmall}>👁️</Text>
                  <Text style={styles.docButtonText}>
                    {item.medical_form_url ? 'Visualizar' : 'Indisponível'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => openDetails(item)}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF' }}>👁️</Text>
                <Text style={styles.actionButtonText}>Detalhes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonEdit]}
                onPress={() => navigateToEdit(item.id)}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF' }}>✏️</Text>
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF' }}>🗑️</Text>
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary || '#4f46e5'} />
        <Text style={styles.loadingText}>⏳ Carregando atletas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏃 Atletas</Text>
        <TouchableOpacity style={styles.createButton} onPress={navigateToCreate}>
          <Text style={{ fontSize: 20 }}>➕</Text>
          <Text style={styles.createButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Text style={{ fontSize: 18 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar atleta..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm !== '' && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Text style={{ fontSize: 18 }}>✖️</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={{ fontSize: 14, marginRight: 4 }}>🏷️</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item === 'all' ? 'Todas' : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredAthletes}
        keyExtractor={(item) => item.id}
        renderItem={renderAthlete}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary || '#4f46e5'} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 60 }}>🏃</Text>
            <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={navigateToCreate}>
              <Text style={{ fontSize: 20 }}>➕</Text>
              <Text style={styles.emptyButtonText}>Criar primeiro atleta</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* MODAL COMPLETO DE DETALHES DO ATLETA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 Detalhes do Atleta</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeDetails}>
                <Text style={{ fontSize: 28 }}>✖️</Text>
              </TouchableOpacity>
            </View>

            {selectedAthlete && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar e Nome */}
                <View style={styles.modalAvatarContainer}>
                  {selectedAthlete.avatar_url ? (
                    <TouchableOpacity onPress={() => openPhoto(selectedAthlete.avatar_url, selectedAthlete.name)}>
                      <Image
                        source={{ uri: getAvatarUrl(selectedAthlete.avatar_url) || undefined }}
                        style={styles.modalAvatar}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <Text style={styles.modalAvatarText}>
                        {selectedAthlete.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.modalName}>{selectedAthlete.name}</Text>
                <Text style={styles.modalCategory}>{selectedAthlete.category}</Text>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>🏅 ATLETA CADASTRADO</Text>
                </View>

                {/* Informações do Atleta */}
                <View style={styles.modalInfoContainer}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>📅</Text>
                    <Text style={styles.modalInfoLabel}>Data de Nascimento</Text>
                    <Text style={styles.modalInfoValue}>
                      {formatDate(selectedAthlete.birth_date)}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>🎂</Text>
                    <Text style={styles.modalInfoLabel}>Idade</Text>
                    <Text style={styles.modalInfoValue}>
                      {calculateAge(selectedAthlete.birth_date)} anos
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>🏷️</Text>
                    <Text style={styles.modalInfoLabel}>Categoria</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedAthlete.category}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>📸</Text>
                    <Text style={styles.modalInfoLabel}>Foto</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedAthlete.avatar_url) {
                          openPhoto(selectedAthlete.avatar_url, selectedAthlete.name);
                        } else {
                          Alert.alert('❌ Erro', 'Nenhuma foto disponível');
                        }
                      }}
                    >
                      <Text style={[
                        styles.modalInfoValue,
                        { 
                          color: selectedAthlete.avatar_url ? '#10B981' : colors.textSecondary,
                          fontWeight: selectedAthlete.avatar_url ? '600' : '400'
                        }
                      ]}>
                        {selectedAthlete.avatar_url ? '👁️ Visualizar Foto' : '📷 Indisponível'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* NOVOS CAMPOS - Telefone */}
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>📞</Text>
                    <Text style={styles.modalInfoLabel}>Telefone</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedAthlete.phone || 'Não informado'}
                    </Text>
                  </View>

                  {/* NOVOS CAMPOS - Endereço */}
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>📍</Text>
                    <Text style={styles.modalInfoLabel}>Endereço</Text>
                    <Text style={styles.modalInfoValue} numberOfLines={2}>
                      {selectedAthlete.address || 'Não informado'}
                    </Text>
                  </View>

                  {/* NOVOS CAMPOS - Bairro */}
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>🏘️</Text>
                    <Text style={styles.modalInfoLabel}>Bairro</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedAthlete.neighborhood || 'Não informado'}
                    </Text>
                  </View>

                  {/* NOVOS CAMPOS - Cidade/Estado */}
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>🏙️</Text>
                    <Text style={styles.modalInfoLabel}>Cidade/UF</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedAthlete.city || ''} {selectedAthlete.state ? `- ${selectedAthlete.state}` : ''}
                    </Text>
                  </View>

                  {/* NOVOS CAMPOS - CEP */}
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.emojiIconLarge}>📮</Text>
                    <Text style={styles.modalInfoLabel}>CEP</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedAthlete.zip_code || 'Não informado'}
                    </Text>
                  </View>

                  {/* NOVOS CAMPOS - Contato de Emergência */}
                  <View style={[styles.modalInfoRow, styles.modalInfoRowLast]}>
                    <Text style={styles.emojiIconLarge}>🆘</Text>
                    <Text style={styles.modalInfoLabel}>Contato Emergência</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedAthlete.emergency_contact || 'Não informado'}
                      {selectedAthlete.emergency_phone ? ` (${selectedAthlete.emergency_phone})` : ''}
                    </Text>
                  </View>
                </View>

                {/* Histórico de Presenças */}
                {renderAttendanceHistory()}

                {/* Botões de Ação */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionAttendance]}
                    onPress={() => navigateToAttendance(selectedAthlete.id)}
                  >
                    <Text style={styles.modalActionEmoji}>📋</Text>
                    <Text style={styles.modalActionText}>Chamada</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionEdit]}
                    onPress={() => {
                      closeDetails();
                      navigateToEdit(selectedAthlete.id);
                    }}
                  >
                    <Text style={styles.modalActionEmoji}>✏️</Text>
                    <Text style={styles.modalActionText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionDanger]}
                    onPress={() => {
                      closeDetails();
                      confirmDelete(selectedAthlete.id);
                    }}
                  >
                    <Text style={styles.modalActionEmoji}>🗑️</Text>
                    <Text style={styles.modalActionText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={{ fontSize: 60 }}>⚠️</Text>
            <Text style={styles.deleteModalTitle}>Excluir Atleta</Text>
            <Text style={styles.deleteModalText}>
              Tem certeza que deseja excluir este atleta? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalCancel]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.deleteModalCancelText}>❌ Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalConfirm]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteModalConfirmText}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PDF Viewer */}
      <PDFViewer
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        pdfUrl={selectedPdfUrl}
        fileName={selectedPdfName}
      />

      {/* Photo Viewer */}
      <PhotoViewer
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        photoUrl={selectedPhotoUrl}
        athleteName={selectedPhotoName}
      />
    </View>
  );
}