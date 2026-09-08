//mobile/src/screens/AttendanceScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  Image,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Habilita animações para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
}

interface AttendanceStatus {
  athlete_id: string;
  name: string;
  category: string;
  present: boolean;
  avatar_url: string | null;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

interface AthleteAttendanceStats {
  athlete_id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  total: number;
  present: number;
  absent: number;
  percentage: number;
  records: AttendanceRecord[];
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

// Função para converter YYYY-MM-DD para DD/MM/YYYY
const convertToDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function AttendanceScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { athleteId?: string } | undefined;
  const filterAthleteId = params?.athleteId;
  
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [displayDate, setDisplayDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [athleteName, setAthleteName] = useState<string>('');
  
  // Estados para histórico do atleta
  const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);
  const [athleteHistory, setAthleteHistory] = useState<Record<string, AthleteAttendanceStats>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  // Função para obter URL da imagem
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
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 8,
    },
    // ========== HEADER CORRIGIDO ==========
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 16,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statPresent: {
      borderColor: '#10B98140',
      backgroundColor: '#10B98110',
    },
    statAbsent: {
      borderColor: '#EF444440',
      backgroundColor: '#EF444410',
    },
    statPercentage: {
      borderColor: colors.primary + '40',
      backgroundColor: colors.primary + '10',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    dateArrow: {
      padding: 8,
      width: 44,
      alignItems: 'center',
    },
    dateDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    dateText: {
      color: colors.text,
      fontSize: 14,
    },
    filtersContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 14,
    },
    categoryFilter: {
      flexDirection: 'row',
      paddingVertical: 4,
    },
    categoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.hover,
      marginRight: 6,
    },
    categoryActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
    progressContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    progressTitle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    progressValue: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.hover,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    bulkActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 16,
    },
    bulkButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
      borderWidth: 1,
    },
    bulkPresent: {
      backgroundColor: '#10B98120',
      borderColor: '#10B98140',
    },
    bulkAbsent: {
      backgroundColor: '#EF444420',
      borderColor: '#EF444440',
    },
    bulkButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
    },
    athletesContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    listTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    athleteItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    athleteItemPresent: {
      borderColor: '#10B98140',
      backgroundColor: '#10B98110',
    },
    athleteItemExpanded: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primary + '10',
    },
    athleteInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    athleteAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    athleteAvatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      resizeMode: 'cover',
    },
    athleteAvatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    athleteNameContainer: {
      flex: 1,
    },
    athleteName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    athleteCategory: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    athleteStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    presentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B98120',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    presentText: {
      color: '#10B981',
      fontSize: 11,
      fontWeight: '500',
    },
    absentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EF444420',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    absentText: {
      color: '#EF4444',
      fontSize: 11,
      fontWeight: '500',
    },
    expandButton: {
      padding: 4,
      marginLeft: 4,
    },
    expandedContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.primary + '40',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    expandedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    expandedAthleteInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    expandedAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    expandedAvatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      resizeMode: 'cover',
    },
    expandedAvatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    expandedName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    expandedCategory: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    closeExpanded: {
      padding: 8,
      backgroundColor: colors.hover,
      borderRadius: 20,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    historyTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    historyStats: {
      flexDirection: 'row',
      gap: 12,
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
      fontSize: 12,
      fontWeight: '600',
    },
    historyList: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      maxHeight: 200,
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
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
      marginBottom: 16,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      height: 20,
    },
    emptyState: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      color: colors.textSecondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 340,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    dateInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    dateHelper: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: colors.hover,
    },
    modalButtonConfirm: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    todayButton: {
      marginTop: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    todayButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  // ========== FUNÇÕES PRINCIPAIS ==========

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      const data = await res.json();
      
      // Filtrar por atleta específico se tiver ID
      let filteredData = data || [];
      if (filterAthleteId) {
        filteredData = filteredData.filter((a: any) => a.id === filterAthleteId);
        if (filteredData.length > 0) {
          setAthleteName(filteredData[0].name);
          console.log(`📋 Visualizando presenças de: ${filteredData[0].name}`);
        }
      }
      
      setAthletes(filteredData);
      setImageErrors({});
      
      const initialAttendance = filteredData.map((athlete: any) => ({
        athlete_id: athlete.id,
        name: athlete.name,
        category: athlete.category,
        present: false,
        avatar_url: athlete.avatar_url,
      }));
      setAttendance(initialAttendance);
      updateStats(initialAttendance);
      
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
      Alert.alert('❌ Erro', 'Não foi possível carregar os atletas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========== BUSCAR PRESENÇA POR DATA ESPECÍFICA ==========
  const fetchAttendanceByDate = async (date: string) => {
    try {
      console.log(`📡 Buscando chamada para data: ${date}`);
      
      const res = await fetch(`${API_URL}/attendance/today?date=${date}&_t=${Date.now()}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${data.length} registros encontrados para ${date}`);
        
        const updatedAttendance = attendance.map((item) => {
          const found = data.find((d: any) => d.athlete_id === item.athlete_id);
          return {
            ...item,
            present: found ? found.present : false,
          };
        });
        
        setAttendance(updatedAttendance);
        updateStats(updatedAttendance);
      } else {
        console.warn(`⚠️ Nenhum registro encontrado para ${date}`);
        const resetAttendance = attendance.map((item) => ({
          ...item,
          present: false,
        }));
        setAttendance(resetAttendance);
        updateStats(resetAttendance);
      }
    } catch (error) {
      console.error('Erro ao buscar chamada:', error);
    }
  };

  // ========== BUSCAR HISTÓRICO DO ATLETA ==========
  const fetchAthleteHistory = async (athleteId: string) => {
    if (athleteHistory[athleteId]) return;

    setLoadingHistory(prev => ({ ...prev, [athleteId]: true }));

    try {
      const res = await fetch(`${API_URL}/attendance/athlete/${athleteId}?_t=${Date.now()}`);
      if (res.ok) {
        const data: AttendanceRecord[] = await res.json();
        
        const total = data.length;
        const present = data.filter(r => r.present).length;
        const absent = total - present;
        const percentage = total > 0 ? (present / total) * 100 : 0;

        const sortedRecords = [...data].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const athlete = athletes.find(a => a.id === athleteId);

        setAthleteHistory(prev => ({
          ...prev,
          [athleteId]: {
            athlete_id: athleteId,
            name: athlete?.name || '',
            category: athlete?.category || '',
            avatar_url: athlete?.avatar_url || null,
            total,
            present,
            absent,
            percentage,
            records: sortedRecords,
          }
        }));
      } else {
        console.error('Erro ao buscar histórico:', res.status);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoadingHistory(prev => ({ ...prev, [athleteId]: false }));
    }
  };

  // ========== TOGGLE EXPANSÃO ==========
  const toggleExpand = (athleteId: string) => {
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    if (expandedAthlete === athleteId) {
      setExpandedAthlete(null);
    } else {
      setExpandedAthlete(athleteId);
      if (!athleteHistory[athleteId]) {
        fetchAthleteHistory(athleteId);
      }
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (athletes.length > 0) {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      fetchAttendanceByDate(date);
    }
  }, [selectedDate, athletes]);

  // ========== FUNÇÕES DE UI ==========
  const updateStats = (attendanceList: AttendanceStatus[]) => {
    const total = attendanceList.length;
    const present = attendanceList.filter(a => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    setStats({ total, present, absent, percentage });
  };

  const toggleAttendance = (athleteId: string) => {
    const updated = attendance.map((item) =>
      item.athlete_id === athleteId
        ? { ...item, present: !item.present }
        : item
    );
    setAttendance(updated);
    updateStats(updated);
  };

  const getFilteredAthletes = () => {
    let filtered = attendance;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    
    return filtered;
  };

  // ========== SALVAR CHAMADA ==========
  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const date = selectedDate || new Date().toISOString().split('T')[0];
      let successCount = 0;
      let errorCount = 0;

      for (const item of attendance) {
        try {
          const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              athlete_id: item.athlete_id,
              training_date: date,
              present: item.present || false,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      setAthleteHistory({});
      setExpandedAthlete(null);

      if (errorCount === 0) {
        Alert.alert(
          '✅ Sucesso!',
          `Chamada salva com sucesso!\n\n📅 Data: ${formatDateDisplay(date)}\n✅ Presentes: ${stats.present}\n❌ Ausentes: ${stats.absent}\n📊 Taxa: ${stats.percentage.toFixed(0)}%`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                fetchAttendanceByDate(date);
                navigation.navigate('Dashboard' as never);
                setTimeout(() => {
                  navigation.goBack();
                }, 300);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '⚠️ Atenção',
          `${successCount} atletas salvos, ${errorCount} com erro.`
        );
      }
      
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
      Alert.alert('❌ Erro', 'Não foi possível salvar a chamada. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const filteredIds = getFilteredAthletes().map(a => a.athlete_id);
    const updated = attendance.map((item) => ({
      ...item,
      present: filteredIds.includes(item.athlete_id) ? true : item.present,
    }));
    setAttendance(updated);
    updateStats(updated);
  };

  const markAllAbsent = () => {
    const filteredIds = getFilteredAthletes().map(a => a.athlete_id);
    const updated = attendance.map((item) => ({
      ...item,
      present: filteredIds.includes(item.athlete_id) ? false : item.present,
    }));
    setAttendance(updated);
    updateStats(updated);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setAthleteHistory({});
    setExpandedAthlete(null);
    const date = selectedDate || new Date().toISOString().split('T')[0];
    fetchAthletes();
    fetchAttendanceByDate(date);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Hoje';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const changeDate = (days: number) => {
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDate(text);
    setDisplayDate(formatted);
    setTempDate(formatted);
  };

  const confirmDate = () => {
    if (displayDate) {
      const parts = displayDate.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setSelectedDate(formattedDate);
        setTempDate('');
        setDisplayDate('');
        setShowDatePicker(false);
      } else {
        Alert.alert('❌ Erro', 'Data incompleta. Use o formato DD/MM/AAAA (ex: 15/03/2024)');
      }
    }
  };

  // ========== RENDER EXPANDED CONTENT ==========
  const renderExpandedContent = (athleteId: string) => {
    const history = athleteHistory[athleteId];
    const isLoading = loadingHistory[athleteId];
    const athlete = athletes.find(a => a.id === athleteId);

    if (isLoading) {
      return (
        <View style={styles.historyLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.historyEmptyText}>⏳ Carregando histórico...</Text>
        </View>
      );
    }

    if (!history || history.records.length === 0) {
      return (
        <View style={styles.historyEmpty}>
          <Text style={{ fontSize: 30 }}>📭</Text>
          <Text style={styles.historyEmptyText}>Nenhum registro de presença encontrado</Text>
        </View>
      );
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <View style={styles.expandedContent}>
        <View style={styles.expandedHeader}>
          <View style={styles.expandedAthleteInfo}>
            <View style={styles.expandedAvatar}>
              {athlete?.avatar_url ? (
                <Image
                  source={{ uri: getAvatarUrl(athlete.avatar_url) || undefined }}
                  style={styles.expandedAvatarImage}
                />
              ) : (
                <Text style={styles.expandedAvatarText}>
                  {athlete?.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.expandedName}>{history.name}</Text>
              <Text style={styles.expandedCategory}>{history.category}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeExpanded}
            onPress={() => setExpandedAthlete(null)}
          >
            <Text style={{ fontSize: 18 }}>✖️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>📊 Histórico de Presenças</Text>
          <View style={styles.historyStats}>
            <View style={styles.historyStat}>
              <Text style={{ fontSize: 12 }}>✅</Text>
              <Text style={[styles.historyStatValue, { color: '#10B981' }]}>
                {history.present}
              </Text>
            </View>
            <View style={styles.historyStat}>
              <Text style={{ fontSize: 12 }}>❌</Text>
              <Text style={[styles.historyStatValue, { color: '#EF4444' }]}>
                {history.absent}
              </Text>
            </View>
            <View style={styles.historyStat}>
              <Text style={{ fontSize: 12 }}>📊</Text>
              <Text style={[styles.historyStatValue, { color: colors.primary }]}>
                {history.percentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.historyList}>
          <FlatList
            data={history.records.slice(0, 20)}
            keyExtractor={(item, index) => `${athleteId}-${index}`}
            scrollEnabled={true}
            renderItem={({ item, index }) => {
              const date = new Date(item.date);
              const isLast = index === history.records.slice(0, 20).length - 1;
              return (
                <View style={[styles.historyItem, isLast && styles.historyItemLast]}>
                  <Text style={styles.historyDate}>
                    {date.toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={[styles.historyStatus, item.present ? styles.historyStatusPresent : styles.historyStatusAbsent]}>
                    {item.present ? '✅ Presente' : '❌ Faltou'}
                  </Text>
                  <Text style={styles.historyDay}>
                    {weekDays[date.getDay()]}
                  </Text>
                </View>
              );
            }}
            ListFooterComponent={() => {
              if (history.records.length > 20) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        '📊 Histórico Completo',
                        `Total de registros: ${history.records.length}\n✅ Presentes: ${history.present}\n❌ Ausentes: ${history.absent}\n📊 Taxa: ${history.percentage.toFixed(0)}%`
                      );
                    }}
                    style={{ padding: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      Ver todos os {history.records.length} registros
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

  const categories = Array.from(new Set(athletes.map(a => a.category)));
  const filteredAthletes = getFilteredAthletes();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>⏳ Carregando chamada...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ========== HEADER CORRIGIDO - TÍTULO E DATA NA MESMA LINHA ========== */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              {filterAthleteId && athleteName ? `📋 Chamada - ${athleteName}` : '📋 Chamada'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {formatDateDisplay(selectedDate || getTodayDate())}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>👥 Total</Text>
          </View>
          <View style={[styles.statBox, styles.statPresent]}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.present}</Text>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>✅ Presentes</Text>
          </View>
          <View style={[styles.statBox, styles.statAbsent]}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.absent}</Text>
            <Text style={[styles.statLabel, { color: '#EF4444' }]}>❌ Ausentes</Text>
          </View>
          <View style={[styles.statBox, styles.statPercentage]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.percentage.toFixed(0)}%</Text>
            <Text style={[styles.statLabel, { color: colors.primary }]}>📊 Presença</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateContainer}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
            <Text style={{ fontSize: 28 }}>◀️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateDisplay}
            onPress={() => {
              if (selectedDate) {
                setDisplayDate(convertToDisplayDate(selectedDate));
                setTempDate(convertToDisplayDate(selectedDate));
              } else {
                setDisplayDate('');
                setTempDate('');
              }
              setShowDatePicker(true);
            }}
          >
            <Text style={{ fontSize: 16 }}>📅</Text>
            <Text style={styles.dateText}>
              {selectedDate ? formatDateDisplay(selectedDate) : 'Hoje'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
            <Text style={{ fontSize: 28 }}>▶️</Text>
          </TouchableOpacity>
        </View>

        {/* Busca e Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar atleta..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm !== '' && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Text style={{ fontSize: 16 }}>✖️</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
                🏷️ Todas
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, selectedCategory === cat && styles.categoryActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>📊 Taxa de Presença</Text>
            <Text style={styles.progressValue}>{stats.percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats.percentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Ações em massa */}
        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkPresent]}
            onPress={markAllPresent}
          >
            <Text style={{ fontSize: 16 }}>✅</Text>
            <Text style={styles.bulkButtonText}>Todos Presentes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkAbsent]}
            onPress={markAllAbsent}
          >
            <Text style={{ fontSize: 16 }}>❌</Text>
            <Text style={styles.bulkButtonText}>Todos Ausentes</Text>
          </TouchableOpacity>
        </View>

        {/* Athletes List */}
        <View style={styles.athletesContainer}>
          <Text style={styles.listTitle}>👥 Atletas</Text>

          {filteredAthletes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>👥</Text>
              <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
            </View>
          ) : (
            <>
              {filteredAthletes.map((item) => {
                const avatarUrl = getAvatarUrl(item.avatar_url);
                const hasError = imageErrors[item.athlete_id];
                const showInitials = !avatarUrl || hasError;
                const isExpanded = expandedAthlete === item.athlete_id;
                
                if (expandedAthlete && expandedAthlete !== item.athlete_id) {
                  return null;
                }
                
                return (
                  <TouchableOpacity
                    key={item.athlete_id}
                    style={[
                      styles.athleteItem,
                      item.present && styles.athleteItemPresent,
                      isExpanded && styles.athleteItemExpanded,
                    ]}
                    onPress={() => toggleAttendance(item.athlete_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.athleteInfo}>
                      <View style={styles.athleteAvatar}>
                        {showInitials ? (
                          <Text style={styles.athleteAvatarText}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        ) : (
                          <Image
                            source={{ uri: avatarUrl || undefined }}
                            style={styles.athleteAvatarImage}
                            onError={() => handleImageError(item.athlete_id)}
                          />
                        )}
                      </View>
                      <View style={styles.athleteNameContainer}>
                        <Text style={styles.athleteName}>{item.name}</Text>
                        <Text style={styles.athleteCategory}>{item.category}</Text>
                      </View>
                    </View>
                    <View style={styles.athleteStatus}>
                      {item.present ? (
                        <View style={styles.presentBadge}>
                          <Text style={{ fontSize: 14 }}>✅</Text>
                          <Text style={styles.presentText}>Presente</Text>
                        </View>
                      ) : (
                        <View style={styles.absentBadge}>
                          <Text style={{ fontSize: 14 }}>❌</Text>
                          <Text style={styles.absentText}>Ausente</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.athlete_id);
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>
                          {isExpanded ? '🔽' : '▶️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>

        {expandedAthlete && (
          <View>
            {renderExpandedContent(expandedAthlete)}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveAttendance}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={{ fontSize: 18 }}>💾</Text>
              <Text style={styles.saveButtonText}>Salvar Chamada</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>

      {/* Modal de Data */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDatePicker(false);
          setTempDate('');
          setDisplayDate('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📅 Selecionar Data</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textSecondary}
              value={displayDate}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.dateHelper}>
              Digite a data desejada e clique em Confirmar para visualizar a chamada daquele dia.
              {'\n'}Exemplo: 15/03/2024
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setTempDate('');
                  setDisplayDate('');
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDate}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>✅ Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                setSelectedDate('');
                setTempDate('');
                setDisplayDate('');
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.todayButtonText}>📅 Voltar para hoje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}